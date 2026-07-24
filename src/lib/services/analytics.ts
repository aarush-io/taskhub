import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

const ONLINE_WINDOW_MIN = 5;

type AnalyticsRow = {
  registeredUsers: bigint;
  activeToday: bigint;
  activeThisWeek: bigint;
  activeThisMonth: bigint;
  onlineUsers: bigint;
  pendingReviews: bigint;
  approvedTasks: bigint;
  rejectedTasks: bigint;
  totalPayouts: Prisma.Decimal;
};

const getCachedAdminAnalytics = unstable_cache(
  async () => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60_000);
    const startOfMonth = new Date(startOfToday.getTime() - 30 * 24 * 60 * 60_000);
    const onlineSince = new Date(now.getTime() - ONLINE_WINDOW_MIN * 60_000);

    const [row] = await prisma.$queryRaw<AnalyticsRow[]>`
      SELECT
        COUNT(*) FILTER (WHERE u."role" = 'WORKER'::"Role") AS "registeredUsers",
        COUNT(*) FILTER (WHERE u."role" = 'WORKER'::"Role" AND u."lastActiveAt" >= ${startOfToday}) AS "activeToday",
        COUNT(*) FILTER (WHERE u."role" = 'WORKER'::"Role" AND u."lastActiveAt" >= ${startOfWeek}) AS "activeThisWeek",
        COUNT(*) FILTER (WHERE u."role" = 'WORKER'::"Role" AND u."lastActiveAt" >= ${startOfMonth}) AS "activeThisMonth",
        COUNT(*) FILTER (WHERE u."role" = 'WORKER'::"Role" AND u."lastActiveAt" >= ${onlineSince}) AS "onlineUsers",
        (SELECT COUNT(*) FROM "Submission" WHERE "status" = 'SUBMITTED'::"TaskStatus") AS "pendingReviews",
        (SELECT COUNT(*) FROM "Submission" WHERE "status" = 'APPROVED'::"TaskStatus") AS "approvedTasks",
        (SELECT COUNT(*) FROM "Submission" WHERE "status" = 'REJECTED'::"TaskStatus") AS "rejectedTasks",
        (SELECT COALESCE(SUM("amount"), 0) FROM "BalanceTransaction" WHERE "type" = 'TASK_APPROVAL'::"TransactionType") AS "totalPayouts"
      FROM "User" u
    `;
    if (!row) throw new Error("Admin analytics query returned no data.");

    return {
      registeredUsers: Number(row.registeredUsers),
      activeToday: Number(row.activeToday),
      activeThisWeek: Number(row.activeThisWeek),
      activeThisMonth: Number(row.activeThisMonth),
      onlineUsers: Number(row.onlineUsers),
      pendingReviews: Number(row.pendingReviews),
      approvedTasks: Number(row.approvedTasks),
      rejectedTasks: Number(row.rejectedTasks),
      totalPayouts: row.totalPayouts.toString(),
    };
  },
  ["admin-analytics"],
  { revalidate: 30, tags: ["admin-analytics"] }
);

export function getAdminAnalytics() {
  return getCachedAdminAnalytics();
}
