import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getReferralDashboard(workerId: string) {
  const [user, referrals, earnings, leaderboard, referralList] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: workerId }, select: { referralCode: true, discordId: true, discordUsername: true, discordAvatar: true } }),
    prisma.referral.groupBy({ by: ["status"], where: { referrerId: workerId }, _count: { _all: true } }),
    prisma.balanceTransaction.aggregate({ where: { workerId, type: "REFERRAL_REWARD" }, _sum: { amount: true } }),
    prisma.referral.groupBy({ by: ["referrerId"], where: { status: "SUCCESSFUL" }, _count: { _all: true }, orderBy: { _count: { referrerId: "desc" } }, take: 10 }),
    prisma.referral.findMany({ where: { referrerId: workerId }, include: { referred: { select: { username: true, email: true } } }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);
  const counts = Object.fromEntries(referrals.map((row) => [row.status, row._count._all]));
  const referrerIds = leaderboard.map((row) => row.referrerId);
  const users = referrerIds.length ? await prisma.user.findMany({ where: { id: { in: referrerIds } }, select: { id: true, username: true } }) : [];
  const names = new Map(users.map((user) => [user.id, user.username]));
  return {
    user,
    total: referrals.reduce((sum, row) => sum + row._count._all, 0),
    pending: counts.PENDING ?? 0,
    successful: counts.SUCCESSFUL ?? 0,
    earnings: earnings._sum.amount ?? new Prisma.Decimal(0),
    leaderboard: leaderboard.map((row) => ({ username: names.get(row.referrerId) ?? "Unknown", successful: row._count._all })),
    referrals: referralList.map((referral) => ({ id: referral.id, username: referral.referred.username, email: referral.referred.email, status: referral.status, createdAt: referral.createdAt })),
  };
}
