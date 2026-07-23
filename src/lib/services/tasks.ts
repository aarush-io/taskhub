import { Prisma, TaskStatus } from "@prisma/client";
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
    },
  });
}

export async function listAvailableTasks(filter?: { category?: "POST" | "COMMENT" | "REPLY" }) {
  return prisma.task.findMany({
    where: { status: "AVAILABLE", ...(filter?.category ? { category: filter.category } : {}) },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Claims a task for a worker. Uses a conditional `updateMany` so two
 * concurrent claim attempts on the same task cannot both succeed - the
 * second request's `updateMany` matches zero rows and is rejected.
 */
export async function claimTask(taskId: string, workerId: string) {
  const settings = await getSettings();

  const worker = await prisma.user.findUniqueOrThrow({ where: { id: workerId } });

  if (worker.lastClaimAt && settings.claimCooldownMin > 0) {
    const cooldownEnds = new Date(worker.lastClaimAt.getTime() + settings.claimCooldownMin * 60_000);
    if (cooldownEnds > new Date()) {
      throw new TaskError(
        `You're on cooldown. You can claim another task at ${cooldownEnds.toLocaleTimeString()}.`
      );
    }
  }

  const activeCount = await prisma.task.count({
    where: { claimedById: workerId, status: { in: ["CLAIMED", "SUBMITTED"] } },
  });
  if (activeCount >= settings.maxActiveTasks) {
    throw new TaskError(`You already have ${activeCount} active tasks (limit ${settings.maxActiveTasks}).`);
  }

  const now = new Date();
  const claimExpiresAt = new Date(now.getTime() + settings.claimTimeoutMin * 60_000);

  const result = await prisma.task.updateMany({
    where: { id: taskId, status: "AVAILABLE" },
    data: { status: "CLAIMED", claimedById: workerId, claimedAt: now, claimExpiresAt },
  });

  if (result.count === 0) {
    throw new TaskError("This task was just claimed by someone else. Try another one.");
  }

  await prisma.user.update({ where: { id: workerId }, data: { lastClaimAt: now, lastActiveAt: now } });

  return prisma.task.findUniqueOrThrow({ where: { id: taskId } });
}

export async function submitTask(input: SubmitTaskInput, workerId: string) {
  const task = await prisma.task.findUnique({ where: { id: input.taskId } });
  if (!task) throw new TaskError("Task not found.");
  if (task.claimedById !== workerId) throw new TaskError("You have not claimed this task.");
  if (task.status !== "CLAIMED") throw new TaskError("This task is not awaiting submission.");

  const [submission] = await prisma.$transaction([
    prisma.submission.create({
      data: {
        taskId: task.id,
        workerId,
        mainLink: input.mainLink,
        randomLink1: input.randomLink1,
        randomLink2: input.randomLink2,
        randomLink3: input.randomLink3,
        status: "SUBMITTED",
      },
    }),
    prisma.task.update({ where: { id: task.id }, data: { status: "SUBMITTED" } }),
    prisma.user.update({ where: { id: workerId }, data: { lastActiveAt: new Date() } }),
  ]);

  return submission;
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
      input.decision === "NEEDS_REVISION" ? "CLAIMED" : (input.decision as TaskStatus);

    await tx.task.update({
      where: { id: submission.taskId },
      data: {
        status: nextTaskStatus,
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
