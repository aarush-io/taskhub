import { getCurrentSession } from "@/lib/session";
import { getWorkerOverview } from "@/lib/services/worker-overview";
import { getBrowseTasksData } from "@/lib/services/tasks";
import { BrowseTasksView } from "@/components/dashboard/browse-tasks-view";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, timeAgo } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wallet, Clock, CheckCircle2, XCircle, ListChecks } from "lucide-react";

export default async function WorkerOverviewPage({ searchParams }: { searchParams: Promise<{ category?: "POST" | "COMMENT" | "REPLY" }> }) {
  const session = await getCurrentSession();
  const workerId = session!.user.id;
  const { category } = await searchParams;

  // Both of these are independent reads - run them concurrently instead of
  // waterfalling one after the other.
  const [{ balance, pending, approved, rejected, recentSubmissions }, browseTasksData] = await Promise.all([
    getWorkerOverview(workerId),
    getBrowseTasksData(workerId, category),
  ]);
  const completed = approved + rejected;

  const cards = [
    { label: "Available balance", value: formatCurrency(balance), icon: Wallet },
    { label: "Pending review", value: pending, icon: Clock },
    { label: "Approved", value: approved, icon: CheckCircle2 },
    { label: "Rejected", value: rejected, icon: XCircle },
    { label: "Completed", value: completed, icon: ListChecks },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="flex flex-col gap-2 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted">{c.label}</p>
                <c.icon className="h-4 w-4 text-accent" />
              </div>
              <p className="font-display text-2xl">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section id="tasks" className="border-t border-border pt-6">
        <BrowseTasksView {...browseTasksData} />
      </section>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent submissions</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard#tasks">Browse tasks</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentSubmissions.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="divide-y divide-border">
              {recentSubmissions.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{s.task.category} · Reddit</p>
                    <p className="text-xs text-muted">Submitted {timeAgo(s.submittedAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-muted">
                      {formatCurrency(s.task.rewardSnapshot.toString())}
                    </span>
                    <StatusBadge status={s.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <p className="text-sm font-medium">Nothing submitted yet</p>
      <p className="text-sm text-muted">Claim your first task to get started.</p>
      <Button asChild size="sm" className="mt-2">
        <Link href="/dashboard#tasks">Browse available tasks</Link>
      </Button>
    </div>
  );
}
