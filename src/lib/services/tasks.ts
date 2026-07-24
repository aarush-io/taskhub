import { Prisma, TaskStatus } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSettings, rewardForCategory } from "@/lib/services/settings";
import { creditWorker } from "@/lib/services/balance";
import { CreateTaskInput, SubmitTaskInput, ReviewSubmissionInput } from "@/lib/validations/task";

export class TaskError extends Error {}

export async function createTask(input: CreateTaskInput, createdById: string) {
  const settings = await getSettings();
  const reward = rewardForCategory(input.category, settings);

  return prisma.task.create({
    data: {
      category: input.category,
      targetUrl: input.targetUrl,
      instructions: input.instructions,
      rewardSnapshot: reward as Prisma.Decimal,
      createdById,
      status: "AVAILABLE",
      scheduledFor: input.publishAt ? new Date(input.publishAt) : null,
    },
  });
}

const getCachedAvailableTasks = unstable_cache(
  async (category: "POST" | "COMMENT" | "REPLY" | null) => {
    const tasks = await prisma.task.findMany({
      where: { status: "AVAILABLE", isPaused: false, OR: [{ scheduledFor: null }, { scheduledFor: { lte: new Date() } }], ...(category ? { category } : {}) },
      orderBy: { createdAt: "asc" },
    });

    return tasks.map((task) => ({
      ...task,
      rewardSnapshot: task.rewardSnapshot.toString(),
      claimedAt: task.claimedAt?.toISOString() ?? null,
      claimExpiresAt: task.claimExpiresAt?.toISOString() ?? null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    }));
  },
  ["available-tasks"],
  { revalidate: 15, tags: ["available-tasks"] }
);

export function listAvailableTasks(filter?: { category?: "POST" | "COMMENT" | "REPLY" }) {
  return getCachedAvailableTasks(filter?.category ?? null);
}

/** Uses the same visibility rules as the worker task pool. */
export function countAvailableTasks() {
  return prisma.task.count({
    where: {
      status: "AVAILABLE",
      isPaused: false,
      OR: [{ scheduledFor: null }, { scheduledFor: { lte: new Date() } }],
    },
  });
}

export type BrowseTasksData = Awaited<ReturnType<typeof getBrowseTasksData>>;

/**
 * Data needed to render the "browse tasks" view (available tasks + the
 * worker's own active claims + settings). Fetched as one parallel batch so
 * callers (the dashboard page and the tasks page) never pay for this twice
 * or sequentially.
 */
export async function getBrowseTasksData(workerId: string, category?: "POST" | "COMMENT" | "REPLY") {
  const [available, myClaims, settings] = await Promise.all([
    listAvailableTasks(category ? { category } : undefined),
    prisma.task.findMany({
      where: { claimedById: workerId, status: { in: ["CLAIMED", "NEEDS_REVISION"] } },
      include: { submission: { select: { status: true, adminNote: true } } },
      orderBy: { claimedAt: "asc" },
    }),
    getSettings(),
  ]);

  const normalizedMyClaims = myClaims.map((task) => ({
    id: task.id,
    category: task.category as string,
    rewardSnapshot: task.rewardSnapshot.toString(),
    instructions: task.instructions,
    status: task.submission?.status === "NEEDS_REVISION" ? "NEEDS_REVISION" : (task.status as string),
    revisionNote: task.submission?.status === "NEEDS_REVISION" ? task.submission.adminNote : null,
  }));

  return { available, myClaims: normalizedMyClaims, settings };
}

/**
 * Claims a task for a worker. Uses a conditional `updateMany` so two
 * concurrent claim attempts on the same task cannot both succeed - the
 * second request's `updateMany` matches zero rows and is rejected.
 */
export async function claimTask(taskId: string, workerId: string) {
  const now = new Date();

  // These three reads are independent of one another, so run them concurrently
  // instead of paying for three sequential round trips.
  const [settings, worker, activeCount] = await Promise.all([
    getSettings(),
    prisma.user.findUniqueOrThrow({ where: { id: workerId } }),
    prisma.task.count({
      where: { claimedById: workerId, status: { in: ["CLAIMED", "SUBMITTED"] } },
    }),
  ]);

  if (worker.claimBanned) throw new TaskError("Your account is currently blocked from claiming tasks.");

  if (worker.lastClaimAt && settings.claimCooldownMin > 0) {
    const cooldownEnds = new Date(worker.lastClaimAt.getTime() + settings.claimCooldownMin * 60_000);
    if (cooldownEnds > new Date()) {
      throw new TaskError(
        `You're on cooldown. You can claim another task at ${cooldownEnds.toLocaleTimeString()}.`
      );
    }
  }

  if (activeCount >= settings.maxActiveTasks) {
    throw new TaskError(`You already have ${activeCount} active tasks (limit ${settings.maxActiveTasks}).`);
  }

  const claimExpiresAt = new Date(now.getTime() + settings.claimTimeoutMin * 60_000);

  const result = await prisma.task.updateMany({
    where: { id: taskId, status: "AVAILABLE", isPaused: false, OR: [{ scheduledFor: null }, { scheduledFor: { lte: now } }] },
    data: { status: "CLAIMED", claimedById: workerId, claimedAt: now, claimExpiresAt },
  });

  if (result.count === 0) {
    throw new TaskError("This task was just claimed by someone else. Try another one.");
  }

  // The caller doesn't use the returned task, and the caller's lastActiveAt
  // bump doesn't need to block the response - fire it without an extra
  // findUnique round trip afterwards.
  await prisma.user.update({ where: { id: workerId }, data: { lastActiveAt: now } });

  return { id: taskId, claimedById: workerId, claimedAt: now, claimExpiresAt };
}

export async function submitTask(input: SubmitTaskInput, workerId: string) {
  const task = await prisma.task.findUnique({
    where: { id: input.taskId },
    include: { submission: { select: { id: true, status: true } } },
  });
  if (!task) throw new TaskError("Task not found.");
  if (task.claimedById !== workerId) throw new TaskError("You have not claimed this task.");
  if (task.status !== "CLAIMED") throw new TaskError("This task is not awaiting submission.");

  return prisma.$transaction(async (tx) => {
    const submittedAt = new Date();
    const submissionData = {
      mainLink: input.mainLink,
      randomLink1: input.randomLink1,
      randomLink2: input.randomLink2,
      randomLink3: input.randomLink3,
      status: "SUBMITTED" as const,
      reviewedById: null,
      reviewedAt: null,
      adminNote: null,
    };
    const submission =
      task.submission?.status === "NEEDS_REVISION"
        ? await tx.submission.update({ where: { id: task.submission.id }, data: submissionData })
        : await tx.submission.create({ data: { taskId: task.id, workerId, ...submissionData } });

    await tx.task.update({ where: { id: task.id }, data: { status: "SUBMITTED" } });
    // Cooldown starts only once the worker actually submits their current task.
    await tx.user.update({ where: { id: workerId }, data: { lastActiveAt: submittedAt, lastClaimAt: submittedAt } });

    return submission;
  });
}

/**
 * Admin review of a submission. Approval credits the worker's balance
 * ledger inside the same transaction as the status update, so a balance
 * entry can never exist without a corresponding approved submission (or
 * vice versa).
 */
export async function reviewSubmission(input: ReviewSubmissionInput, reviewerId: string) {
  const submission = await prisma.submission.findUnique({
    where: { id: input.submissionId },
    include: { task: true },
  });
  if (!submission) throw new TaskError("Submission not found.");
  if (submission.status !== "SUBMITTED") throw new TaskError("This submission has already been reviewed.");

  return prisma.$transaction(async (tx) => {
    const updatedSubmission = await tx.submission.update({
      where: { id: submission.id },
      data: {
        status: input.decision,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        adminNote: input.adminNote,
      },
    });

    // NEEDS_REVISION sends the task back to CLAIMED so the same worker can
    // resubmit, rather than releasing it to the whole pool.
    const nextTaskStatus: TaskStatus =
      input.decision === "NEEDS_REVISION"
        ? "CLAIMED"
        : input.decision === "REJECTED"
          ? "AVAILABLE"
          : (input.decision as TaskStatus);

    await tx.task.update({
      where: { id: submission.taskId },
      data: {
        status: nextTaskStatus,
        ...(input.decision === "REJECTED"
          ? { claimedById: null, claimedAt: null, claimExpiresAt: null }
          : {}),
        ...(input.decision === "NEEDS_REVISION"
          ? { claimExpiresAt: new Date(Date.now() + 60 * 60_000) }
          : {}),
      },
    });

    if (input.decision === "APPROVED") {
      await creditWorker(tx, {
        workerId: submission.workerId,
        taskId: submission.taskId,
        amount: submission.task.rewardSnapshot,
        type: "TASK_APPROVAL",
        note: `Approved: ${submission.task.category} task`,
      });

      const approvedCount = await tx.submission.count({
        where: { workerId: submission.workerId, status: "APPROVED" },
      });
      const referral = approvedCount === 1
        ? await tx.referral.findUnique({ where: { referredId: submission.workerId } })
        : null;
      if (referral?.status === "PENDING") {
        const settings = await tx.globalSettings.findUnique({ where: { id: "singleton" } });
        if (settings) {
          if (settings.referralReward.greaterThan(0)) {
            await creditWorker(tx, {
              workerId: referral.referrerId,
              amount: settings.referralReward,
              type: "REFERRAL_REWARD",
              note: "Referral reward: first approved task",
            });
          }
          if (settings.referredWorkerBonus.greaterThan(0)) {
            await creditWorker(tx, {
              workerId: submission.workerId,
              amount: settings.referredWorkerBonus,
              type: "REFERRAL_BONUS",
              note: "Referral welcome bonus: first approved task",
            });
          }
        }
        await tx.referral.update({ where: { id: referral.id }, data: { status: "SUCCESSFUL", rewardedAt: new Date() } });
      }
    }

    return updatedSubmission;
  });
}

/** Releases claimed tasks whose claim window has lapsed back to the pool. Intended to run on a schedule (Vercel Cron). */
export async function expireStaleClaims() {
  const result = await prisma.task.updateMany({
    where: { status: "CLAIMED", claimExpiresAt: { lt: new Date() } },
    data: { status: "EXPIRED" },
  });

  // Re-open expired tasks as fresh AVAILABLE tasks in a second pass so a
  // worker's stale claim doesn't leave a dangling claimedById reference.
  await prisma.task.updateMany({
    where: { status: "EXPIRED" },
    data: { status: "AVAILABLE", claimedById: null, claimedAt: null, claimExpiresAt: null },
  });

  return result.count;
}
