import { prisma } from "@/lib/prisma";
import { getWorkerBalance } from "@/lib/services/balance";

export async function searchWorkers(query: string, page = 1, pageSize = 20) {
  const where = query
    ? {
        role: "WORKER" as const,
        OR: [
          { username: { contains: query, mode: "insensitive" as const } },
          { email: { contains: query, mode: "insensitive" as const } },
          { redditUsername: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : { role: "WORKER" as const };

  const [workers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  const withBalances = await Promise.all(
    workers.map(async (w) => ({ ...w, balance: await getWorkerBalance(w.id) }))
  );

  return { workers: withBalances, total, page, pageSize };
}

export async function getWorkerProfile(workerId: string) {
  const worker = await prisma.user.findUnique({ where: { id: workerId } });
  if (!worker) return null;

  const [balance, submissions, counts] = await Promise.all([
    getWorkerBalance(workerId),
    prisma.submission.findMany({
      where: { workerId },
      include: { task: true },
      orderBy: { submittedAt: "desc" },
    }),
    prisma.submission.groupBy({
      by: ["status"],
      where: { workerId },
      _count: { _all: true },
    }),
  ]);

  const countByStatus = Object.fromEntries(counts.map((c) => [c.status, c._count._all]));

  const totalEarnings = await prisma.balanceTransaction.aggregate({
    where: { workerId, type: "TASK_APPROVAL" },
    _sum: { amount: true },
  });

  return {
    worker,
    balance,
    submissions,
    approvedCount: countByStatus.APPROVED ?? 0,
    rejectedCount: countByStatus.REJECTED ?? 0,
    pendingCount: countByStatus.SUBMITTED ?? 0,
    totalEarnings: totalEarnings._sum.amount ?? 0,
  };
}
