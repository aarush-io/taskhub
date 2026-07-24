import { Card, CardContent } from "@/components/ui/card";
import { CategoryFilter } from "@/components/dashboard/category-filter";
import { AvailableTaskCard } from "@/components/dashboard/available-task-card";
import { SubmitTaskDialog } from "@/components/dashboard/submit-task-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { TaskSupportLink } from "@/components/dashboard/task-support-link";
import type { BrowseTasksData } from "@/lib/services/tasks";

export function BrowseTasksView({ available, myClaims, settings }: BrowseTasksData) {
  return (
    <div className="space-y-8">
      {myClaims.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-lg">Your active claims</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {myClaims.map((task) => (
              <Card key={task.id}>
                <CardContent className="flex flex-col gap-3 p-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="accent">{task.category}</Badge>
                    <span className="font-mono text-sm text-muted">
                      {formatCurrency(task.rewardSnapshot.toString())}
                    </span>
                  </div>
                  <p className="line-clamp-3 text-sm text-foreground/90">{task.instructions}</p>
                  {task.status === "NEEDS_REVISION" && (
                    <div className="rounded-md border border-accent/30 bg-accent/10 p-3 text-sm">
                      <p className="font-medium text-accent">Revision requested</p>
                      <p className="mt-1 text-foreground/90">
                        {task.revisionNote ?? "Please review the task and submit an updated response."}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <StatusBadge status={task.status} />
                    <SubmitTaskDialog taskId={task.id} />
                  </div>
                  {settings.discordSupportUrl && (
                    <TaskSupportLink url={settings.discordSupportUrl} taskId={task.id} category={task.category} />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg">Available tasks</h2>
          <CategoryFilter />
        </div>
        {available.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted">
              No available tasks right now. Check back soon.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {available.map((task) => (
              <AvailableTaskCard
                key={task.id}
                task={{
                  id: task.id,
                  category: task.category,
                  targetUrl: task.targetUrl,
                  rewardSnapshot: task.rewardSnapshot,
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
