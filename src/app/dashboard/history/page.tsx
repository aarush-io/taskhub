import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, timeAgo } from "@/lib/utils";

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ category?: "POST" | "COMMENT" | "REPLY"; status?: string }> }) {
  const session = await getCurrentSession();
  const workerId = session!.user.id;
  const { category, status } = await searchParams;

  const submissions = await prisma.submission.findMany({
    where: { workerId, ...(status ? { status: status as "SUBMITTED" | "APPROVED" | "REJECTED" | "NEEDS_REVISION" } : {}), ...(category ? { task: { category } } : {}) },
    include: { task: true },
    orderBy: { submittedAt: "desc" },
  });

  return <div className="space-y-5"><div><p className="text-sm text-muted">Task tracking</p><h1 className="font-display text-2xl">Your completed work</h1><p className="mt-1 text-sm text-muted">Review submitted links, rewards, and feedback in one place.</p></div><form className="grid gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-3"><label className="space-y-1.5 text-sm font-medium">Task type<select name="category" defaultValue={category ?? ""} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"><option value="">All task types</option><option value="POST">Post thread</option><option value="COMMENT">Post comment</option><option value="REPLY">Reply to a comment</option></select></label><label className="space-y-1.5 text-sm font-medium">Review status<select name="status" defaultValue={status ?? ""} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"><option value="">All statuses</option><option value="SUBMITTED">In review</option><option value="APPROVED">Approved</option><option value="NEEDS_REVISION">Needs revision</option><option value="REJECTED">Rejected</option></select></label><div className="flex items-end"><button className="h-10 rounded-md bg-accent px-4 text-sm font-medium text-accent-foreground">Apply filters</button></div></form><Card>
      <CardContent className="p-0">
        {submissions.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted">No submissions yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted">
                  <th className="px-4 py-3 font-medium">Task ID</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Reward</th>
                  <th className="px-4 py-3 font-medium">Submitted at</th>
                  <th className="px-4 py-3 font-medium">Required post/comment</th>
                  <th className="px-4 py-3 font-medium">Submitted link</th>
                  <th className="px-4 py-3 font-medium">Proof links</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Admin note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {submissions.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-2/50">
                    <td className="px-4 py-3"><code className="rounded border border-border bg-surface-2 px-2 py-1 text-xs">{s.taskId.slice(-8)}</code></td>
                    <td className="px-4 py-3">{s.task.category}</td>
                    <td className="px-4 py-3 font-mono">{formatCurrency(s.task.rewardSnapshot.toString())}</td>
                    <td className="px-4 py-3 text-muted">{timeAgo(s.submittedAt)}</td>
                    <td className="min-w-[260px] px-4 py-3"><details><summary className="cursor-pointer text-accent hover:underline">View task instructions</summary><p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-muted">{s.task.instructions}</p></details></td>
                    <td className="max-w-[190px] truncate px-4 py-3"><a href={s.mainLink} target="_blank" rel="noreferrer" className="text-accent hover:underline">View submission</a></td>
                    <td className="px-4 py-3"><div className="flex gap-2 whitespace-nowrap"><a href={s.randomLink1} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline">Proof 1</a><a href={s.randomLink2} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline">Proof 2</a><a href={s.randomLink3} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline">Proof 3</a></div></td>
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
    </Card></div>;
}
