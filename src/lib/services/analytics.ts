import { prisma } from "@/lib/prisma";

const ONLINE_WINDOW_MIN = 5;

export async function getAdminAnalytics() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60_000);
  const startOfMonth = new Date(startOfToday.getTime() - 30 * 24 * 60 * 60_000);
  const onlineSince = new Date(now.getTime() - ONLINE_WINDOW_MIN * 60_000);

  const [
    registeredUsers,
    activeToday,
    activeThisWeek,
    activeThisMonth,
    onlineUsers,
    pendingReviews,
    approvedTasks,
    rejectedTasks,
    totalPayouts,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "WORKER" } }),
    prisma.user.count({ where: { role: "WORKER", lastActiveAt: { gte: startOfToday } } }),
    prisma.user.count({ where: { role: "WORKER", lastActiveAt: { gte: startOfWeek } } }),
    prisma.user.count({ where: { role: "WORKER", lastActiveAt: { gte: startOfMonth } } }),
    prisma.user.count({ where: { role: "WORKER", lastActiveAt: { gte: onlineSince } } }),
    prisma.submission.count({ where: { status: "SUBMITTED" } }),
    prisma.submission.count({ where: { status: "APPROVED" } }),
    prisma.submission.count({ where: { status: "REJECTED" } }),
    prisma.balanceTransaction.aggregate({ where: { type: "TASK_APPROVAL" }, _sum: { amount: true } }),
  ]);

  return {
    registeredUsers,
    activeToday,
    activeThisWeek,
    activeThisMonth,
    onlineUsers,
    pendingReviews,
    approvedTasks,
    rejectedTasks,
    totalPayouts: totalPayouts._sum.amount ?? 0,
  };
}
