import Link from "next/link";
import { ADMIN_LIST_PAGE_SIZE, getAdminReviewsPage } from "@/lib/services/admin-lists";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, timeAgo } from "@/lib/utils";
import { ReviewActions } from "@/components/admin/review-actions";
import { ExternalLink } from "lucide-react";

export default async function AdminReviewsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const { submissions, total } = await getAdminReviewsPage(currentPage);
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_LIST_PAGE_SIZE));

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg">Pending reviews ({submissions.length})</h2>
      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted">Nothing waiting on review.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {submissions.map((s) => (
            <Card key={s.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{s.task.category}</span>
                  <span className="font-mono text-muted">{formatCurrency(s.task.rewardSnapshot.toString())}</span>
                </div>
                <p className="text-xs text-muted">
                  {s.worker.username} · reddit: {s.worker.redditUsername ?? "not set"} · submitted {timeAgo(s.submittedAt)}
                </p>
                <div className="space-y-1 rounded-md bg-surface-2 p-3 text-xs">
                  <LinkRow label="Main" url={s.mainLink} />
                  <LinkRow label="Random 1" url={s.randomLink1} />
                  <LinkRow label="Random 2" url={s.randomLink2} />
                  <LinkRow label="Random 3" url={s.randomLink3} />
                </div>
                <ReviewActions submissionId={s.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted">
          {currentPage > 1 && <Link href={`/admin/reviews?page=${currentPage - 1}`}>Previous</Link>}
          <span>
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && <Link href={`/admin/reviews?page=${currentPage + 1}`}>Next</Link>}
        </div>
      )}
    </div>
  );
}

function LinkRow({ label, url }: { label: string; url: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted">{label}</span>
      <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-1 truncate text-accent hover:underline">
        <span className="truncate">{url}</span>
        <ExternalLink className="h-3 w-3 shrink-0" />
      </a>
    </div>
  );
}
