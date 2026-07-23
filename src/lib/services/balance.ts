import { Prisma, PrismaClient, TransactionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type TxClient = Prisma.TransactionClient | PrismaClient;

/**
 * Balance is derived, never stored directly on the worker row. This keeps
 * every credit auditable and makes "Total Earnings" / "Total Payouts"
 * analytics a simple aggregate query instead of a second source of truth
 * that can drift out of sync.
 */
export async function getWorkerBalance(workerId: string, client: TxClient = prisma) {
  const result = await client.balanceTransaction.aggregate({
    where: { workerId },
    _sum: { amount: true },
  });
  return result._sum.amount ?? new Prisma.Decimal(0);
}

export async function creditWorker(
  client: TxClient,
  params: { workerId: string; taskId?: string; amount: Prisma.Decimal; type: TransactionType; note?: string }
) {
  return client.balanceTransaction.create({
    data: {
      workerId: params.workerId,
      taskId: params.taskId,
      amount: params.amount,
      type: params.type,
      note: params.note,
    },
  });
}
