import { notFound } from "next/navigation";
import { getWorkerProfile } from "@/lib/services/workers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { SuspendToggle } from "@/components/admin/suspend-toggle";
import { formatCurrency, timeAgo } from "@/lib/utils";

export default async function WorkerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getWorkerProfile(id);
  if (!profile) notFound();

  const { worker, balance, submissions, approvedCount, rejectedCount, pendingCount, totalEarnings } = profile;

  const stats = [
    { label: "Balance", value: formatCurrency(balance.toString()) },
    { label: "Total earnings", value: formatCurrency(totalEarnings.toString()) },
    { label: "Approved", value: approvedCount },
    { label: "Rejected", value: rejectedCount },
    { label: "Pending", value: pendingCount },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-xl">{worker.username}</h2>
            <p className="text-sm text-muted">{worker.email}</p>
            <p className="text-sm text-muted">Reddit: {worker.redditUsername ?? "not set"}</p>
            <p className="mt-1 text-xs text-muted">
              Registered {timeAgo(worker.createdAt)} · Last login {timeAgo(worker.lastLoginAt)} · Last active {timeAgo(worker.lastActiveAt)}
            </p>
          </div>
          <SuspendToggle workerId={worker.id} suspended={worker.suspended} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
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
                    <th className="px-4 py-3 font-medium">Main link</th>
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
                        <a href={s.mainLink} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                          {s.mainLink}
                        </a>
                      </td>
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
