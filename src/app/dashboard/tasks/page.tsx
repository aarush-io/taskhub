import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { listAvailableTasks } from "@/lib/services/tasks";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryFilter } from "@/components/dashboard/category-filter";
import { AvailableTaskCard } from "@/components/dashboard/available-task-card";
import { SubmitTaskDialog } from "@/components/dashboard/submit-task-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

type MyClaim = {
  id: string;
  category: string;
  rewardSnapshot: string;
  instructions: string;
  status: string;
};

export default async function BrowseTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: "POST" | "COMMENT" | "REPLY" }>;
}) {
  const session = await auth();
  const workerId = session!.user.id;
  const { category } = await searchParams;

  const [available, myClaims] = await Promise.all([
    listAvailableTasks(category ? { category } : undefined),
    prisma.task.findMany({
      where: { claimedById: workerId, status: { in: ["CLAIMED", "NEEDS_REVISION"] } },
      orderBy: { claimedAt: "asc" },
    }) as Promise<Array<{ id: string; category: string; rewardSnapshot: unknown; instructions: string; status: string }>>,
  ]);

  const normalizedMyClaims: MyClaim[] = myClaims.map((task) => ({
    id: task.id,
    category: task.category,
    rewardSnapshot: task.rewardSnapshot.toString(),
    instructions: task.instructions,
    status: task.status,
  }));

  return (
    <div className="space-y-8">
      {normalizedMyClaims.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-lg">Your active claims</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {normalizedMyClaims.map((task) => (
              <Card key={task.id}>
                <CardContent className="flex flex-col gap-3 p-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="accent">{task.category}</Badge>
                    <span className="font-mono text-sm text-muted">
                      {formatCurrency(task.rewardSnapshot.toString())}
                    </span>
                  </div>
                  <p className="line-clamp-3 text-sm text-foreground/90">{task.instructions}</p>
                  <div className="flex items-center justify-between">
                    <StatusBadge status={task.status} />
                    <SubmitTaskDialog taskId={task.id} />
                  </div>
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
                task={{ ...task, rewardSnapshot: task.rewardSnapshot.toString() }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
