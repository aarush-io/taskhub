import Link from "next/link";
import { searchWorkers } from "@/lib/services/workers";
import { Card, CardContent } from "@/components/ui/card";
import { WorkerSearchInput } from "@/components/admin/worker-search-input";
import { formatCurrency, timeAgo } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default async function AdminWorkersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const currentPage = Number(page ?? "1") || 1;
  const { workers, total, pageSize } = await searchWorkers(q ?? "", currentPage);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg">Workers ({total})</h2>
        <WorkerSearchInput defaultValue={q} />
      </div>
      <Card>
        <CardContent className="p-0">
          {workers.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted">No workers match that search.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted">
                    <th className="px-4 py-3 font-medium">Username</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Reddit</th>
                    <th className="px-4 py-3 font-medium">Discord</th>
                    <th className="px-4 py-3 font-medium">Balance</th>
                    <th className="px-4 py-3 font-medium">Last active</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {workers.map((w) => (
                    <tr key={w.id} className="hover:bg-surface-2/50">
                      <td className="px-4 py-3">
                        <Link href={`/admin/workers/${w.id}`} className="font-medium text-accent hover:underline">
                          {w.username}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted">{w.email}</td>
                      <td className="px-4 py-3 text-muted">{w.redditUsername ? `u/${w.redditUsername.replace(/^u\//, "")}` : "Not linked"}</td>
                      <td className="px-4 py-3 text-muted">{w.discordUsername ? `@${w.discordUsername}` : "Not linked"}</td>
                      <td className="px-4 py-3 font-mono">{formatCurrency(w.balance.toString())}</td>
                      <td className="px-4 py-3 text-muted">{timeAgo(w.lastActiveAt)}</td>
                      <td className="px-4 py-3">
                        {w.suspended ? <Badge variant="danger">Suspended</Badge> : <Badge variant="success">Active</Badge>}
                      </td>
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
          {currentPage > 1 && (
            <Link href={`/admin/workers?${new URLSearchParams({ ...(q ? { q } : {}), page: String(currentPage - 1) })}`}>
              Previous
            </Link>
          )}
          <span>
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link href={`/admin/workers?${new URLSearchParams({ ...(q ? { q } : {}), page: String(currentPage + 1) })}`}>
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
