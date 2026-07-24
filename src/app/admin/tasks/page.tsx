import Link from "next/link";
import { ADMIN_LIST_PAGE_SIZE, getAdminTasksPage } from "@/lib/services/admin-lists";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { CreateTaskDialog } from "@/components/admin/create-task-dialog";
import { formatCurrency, timeAgo } from "@/lib/utils";
import { TaskControls } from "@/components/admin/task-controls";

export default async function AdminTasksPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const { tasks, total } = await getAdminTasksPage(currentPage);
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_LIST_PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg">All tasks</h2>
        <CreateTaskDialog />
      </div>
      <Card>
        <CardContent className="p-0">
          {tasks.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted">No tasks created yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted">
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Reward</th>
                    <th className="px-4 py-3 font-medium">Claimed by</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tasks.map((t) => (
                    <tr key={t.id} className="hover:bg-surface-2/50">
                      <td className="px-4 py-3">{t.category}</td>
                      <td className="px-4 py-3 font-mono">{formatCurrency(t.rewardSnapshot.toString())}</td>
                      <td className="px-4 py-3 text-muted">{t.claimedBy?.username ?? "—"}</td>
                      <td className="px-4 py-3 text-muted">{timeAgo(t.createdAt)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="px-4 py-3"><TaskControls taskId={t.id} paused={t.isPaused} claimed={Boolean(t.claimedById)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted">
          {currentPage > 1 && <Link href={`/admin/tasks?page=${currentPage - 1}`}>Previous</Link>}
          <span>
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && <Link href={`/admin/tasks?page=${currentPage + 1}`}>Next</Link>}
        </div>
      )}
    </div>
  );
}
