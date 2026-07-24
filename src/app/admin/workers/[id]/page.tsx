import { notFound } from "next/navigation";
import { getWorkerProfile } from "@/lib/services/workers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { WorkerActionsMenu } from "@/components/admin/worker-actions-menu";
import { formatCurrency, timeAgo } from "@/lib/utils";

export default async function WorkerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getWorkerProfile(id);
  if (!profile) notFound();

  const { worker, balance, submissions, approvedCount, rejectedCount, pendingCount, totalEarnings } = profile;

  const reviewedCount = approvedCount + rejectedCount;
  const stats = [
    { label: "Balance", value: formatCurrency(balance.toString()) },
    { label: "Total earnings", value: formatCurrency(totalEarnings.toString()) },
    { label: "Approved", value: approvedCount },
    { label: "Rejected", value: rejectedCount },
    { label: "Pending", value: pendingCount },
    { label: "Approval rate", value: reviewedCount ? `${Math.round((approvedCount / reviewedCount) * 100)}%` : "—" },
    { label: "Completion rate", value: submissions.length ? `${Math.round((reviewedCount / submissions.length) * 100)}%` : "—" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <h2 className="font-display text-xl">{worker.username}</h2>
            <p className="text-sm text-muted">{worker.email}</p>
            <div className="grid gap-x-6 gap-y-1 pt-2 text-sm text-muted sm:grid-cols-2">
              <p>Reddit: {worker.redditUsername ? `u/${worker.redditUsername.replace(/^u\//, "")}` : "not linked"}</p>
              <p>Discord: {worker.discordUsername ? `@${worker.discordUsername}` : "not linked"}</p>
              {worker.discordId && <p className="font-mono text-xs sm:col-span-2">Discord ID: {worker.discordId}</p>}
            </div>
            <p className="mt-1 text-xs text-muted">
              Registered {timeAgo(worker.createdAt)} · Last login {timeAgo(worker.lastLoginAt)} · Last active {timeAgo(worker.lastActiveAt)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2"><WorkerActionsMenu workerId={worker.id} suspended={worker.suspended} claimBanned={worker.claimBanned} hasDiscord={Boolean(worker.discordId)} /></div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted">{s.label}</p>
              <p className="font-display text-2xl">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submission history</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {submissions.length === 0 ? (
            <div className="px-5 pb-5 text-sm text-muted">No submissions yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted">
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Task link</th>
                    <th className="px-4 py-3 font-medium">Required post/comment</th>
                    <th className="px-4 py-3 font-medium">Main comment</th>
                    <th className="px-4 py-3 font-medium">Proof links</th>
                    <th className="px-4 py-3 font-medium">Reward</th>
                    <th className="px-4 py-3 font-medium">Submitted</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {submissions.map((s) => (
                    <tr key={s.id} className="hover:bg-surface-2/50">
                      <td className="px-4 py-3">{s.task.category}</td>
                      <td className="max-w-[220px] truncate px-4 py-3">
                        <a href={s.task.targetUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">Open task</a>
                      </td>
                      <td className="min-w-[240px] px-4 py-3"><details><summary className="cursor-pointer text-accent hover:underline">View instructions</summary><p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-muted">{s.task.instructions}</p></details></td>
                      <td className="max-w-[220px] truncate px-4 py-3">
                        <a href={s.mainLink} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                          Open main comment
                        </a>
                      </td>
                      <td className="px-4 py-3"><div className="flex gap-2"><a href={s.randomLink1} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline">Proof 1</a><a href={s.randomLink2} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline">Proof 2</a><a href={s.randomLink3} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline">Proof 3</a></div></td>
                      <td className="px-4 py-3 font-mono">{formatCurrency(s.task.rewardSnapshot.toString())}</td>
                      <td className="px-4 py-3 text-muted">{timeAgo(s.submittedAt)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={s.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
