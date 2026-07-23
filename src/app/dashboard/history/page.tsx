import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, timeAgo } from "@/lib/utils";

export default async function HistoryPage() {
  const session = await auth();
  const workerId = session!.user.id;

  const submissions = await prisma.submission.findMany({
    where: { workerId },
    include: { task: true },
    orderBy: { submittedAt: "desc" },
  });

  return (
    <Card>
      <CardContent className="p-0">
        {submissions.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted">No submissions yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted">
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Reward</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Admin note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {submissions.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-2/50">
                    <td className="px-4 py-3">{s.task.category}</td>
                    <td className="px-4 py-3 font-mono">{formatCurrency(s.task.rewardSnapshot.toString())}</td>
                    <td className="px-4 py-3 text-muted">{timeAgo(s.submittedAt)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-4 py-3 text-muted">{s.adminNote ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
