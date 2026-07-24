import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { TaskControls } from "@/components/admin/task-controls";
import { formatCurrency, timeAgo } from "@/lib/utils";

export default async function ActiveWorkPage() {
  const tasks = await prisma.task.findMany({
    where: { status: { in: ["CLAIMED", "SUBMITTED", "NEEDS_REVISION"] } },
    include: { claimedBy: { select: { id: true, username: true } }, submission: { select: { status: true, submittedAt: true } } },
    orderBy: { claimedAt: "asc" },
  });

  return <div className="space-y-5"><div><p className="text-sm text-muted">Operations</p><h2 className="font-display text-xl">Active work</h2><p className="mt-1 text-sm text-muted">Claimed tasks that need monitoring, review, or intervention.</p></div><Card><CardContent className="p-0">{tasks.length === 0 ? <div className="py-16 text-center text-sm text-muted">No tasks are currently in progress.</div> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-xs text-muted"><th className="px-4 py-3 font-medium">Task</th><th className="px-4 py-3 font-medium">Worker</th><th className="px-4 py-3 font-medium">Reward</th><th className="px-4 py-3 font-medium">Claimed</th><th className="px-4 py-3 font-medium">Review status</th><th className="px-4 py-3 font-medium">Actions</th></tr></thead><tbody className="divide-y divide-border">{tasks.map((task) => <tr key={task.id} className="hover:bg-surface-2/50"><td className="px-4 py-3"><p className="font-medium">{task.category} task</p><p className="mt-0.5 max-w-xs truncate text-xs text-muted">{task.instructions}</p></td><td className="px-4 py-3">{task.claimedBy ? <Link href={`/admin/workers/${task.claimedBy.id}`} className="text-accent hover:underline">{task.claimedBy.username}</Link> : <span className="text-muted">Unassigned</span>}</td><td className="px-4 py-3 font-mono">{formatCurrency(task.rewardSnapshot.toString())}</td><td className="px-4 py-3 text-muted">{timeAgo(task.claimedAt)}</td><td className="px-4 py-3"><StatusBadge status={task.submission?.status ?? task.status} /></td><td className="px-4 py-3"><TaskControls taskId={task.id} paused={task.isPaused} claimed={Boolean(task.claimedById)} /></td></tr>)}</tbody></table></div>}</CardContent></Card></div>;
}
