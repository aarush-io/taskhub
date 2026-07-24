import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getWorkerBalance } from "@/lib/services/balance";

const getCachedWorkerOverview = unstable_cache(
  async (workerId: string) => {
    const [balance, submissionCounts, recentSubmissions] = await Promise.all([
      getWorkerBalance(workerId),
      prisma.submission.groupBy({
        by: ["status"],
        where: { workerId, status: { in: ["SUBMITTED", "APPROVED", "REJECTED"] } },
        _count: { _all: true },
      }),
      prisma.submission.findMany({
        where: { workerId },
        include: { task: true },
        orderBy: { submittedAt: "desc" },
        take: 5,
      }),
    ]);

    const countByStatus = Object.fromEntries(submissionCounts.map((count) => [count.status, count._count._all]));

    return {
      balance: balance.toString(),
      pending: countByStatus.SUBMITTED ?? 0,
      approved: countByStatus.APPROVED ?? 0,
      rejected: countByStatus.REJECTED ?? 0,
      recentSubmissions: recentSubmissions.map((submission) => ({
        id: submission.id,
        status: submission.status,
        submittedAt: submission.submittedAt.toISOString(),
        task: {
          category: submission.task.category,
          rewardSnapshot: submission.task.rewardSnapshot.toString(),
        },
      })),
    };
  },
  ["worker-overview"],
  { revalidate: 10, tags: ["worker-overview"] }
);

export function getWorkerOverview(workerId: string) {
  return getCachedWorkerOverview(workerId);
}
