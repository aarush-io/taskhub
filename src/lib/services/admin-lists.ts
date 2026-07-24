import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const ADMIN_LIST_PAGE_SIZE = 50;

const getCachedAdminTasks = unstable_cache(
  async (page: number) => {
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        include: { claimedBy: { select: { username: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * ADMIN_LIST_PAGE_SIZE,
        take: ADMIN_LIST_PAGE_SIZE,
      }),
      prisma.task.count(),
    ]);

    return {
      total,
      tasks: tasks.map((task) => ({
        ...task,
        rewardSnapshot: task.rewardSnapshot.toString(),
        claimedAt: task.claimedAt?.toISOString() ?? null,
        claimExpiresAt: task.claimExpiresAt?.toISOString() ?? null,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      })),
    };
  },
  ["admin-tasks"],
  { revalidate: 15, tags: ["admin-tasks"] }
);

const getCachedAdminReviews = unstable_cache(
  async (page: number) => {
    const where = { status: "SUBMITTED" as const };
    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        include: { task: true, worker: true },
        orderBy: { submittedAt: "asc" },
        skip: (page - 1) * ADMIN_LIST_PAGE_SIZE,
        take: ADMIN_LIST_PAGE_SIZE,
      }),
      prisma.submission.count({ where }),
    ]);

    return {
      total,
      submissions: submissions.map((submission) => ({
        ...submission,
        submittedAt: submission.submittedAt.toISOString(),
        reviewedAt: submission.reviewedAt?.toISOString() ?? null,
        updatedAt: submission.updatedAt.toISOString(),
        task: {
          ...submission.task,
          rewardSnapshot: submission.task.rewardSnapshot.toString(),
          claimedAt: submission.task.claimedAt?.toISOString() ?? null,
          claimExpiresAt: submission.task.claimExpiresAt?.toISOString() ?? null,
          createdAt: submission.task.createdAt.toISOString(),
          updatedAt: submission.task.updatedAt.toISOString(),
        },
        worker: {
          ...submission.worker,
          createdAt: submission.worker.createdAt.toISOString(),
          lastLoginAt: submission.worker.lastLoginAt?.toISOString() ?? null,
          lastActiveAt: submission.worker.lastActiveAt?.toISOString() ?? null,
          suspendedAt: submission.worker.suspendedAt?.toISOString() ?? null,
          lastClaimAt: submission.worker.lastClaimAt?.toISOString() ?? null,
        },
      })),
    };
  },
  ["admin-reviews"],
  { revalidate: 15, tags: ["admin-reviews"] }
);

export function getAdminTasksPage(page: number) {
  return getCachedAdminTasks(page);
}

export function getAdminReviewsPage(page: number) {
  return getCachedAdminReviews(page);
}
