"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { reviewSubmissionAction } from "@/app/actions/admin";

export function ReviewActions({ submissionId }: { submissionId: string }) {
  const [note, setNote] = useState("");
  const [revisionMode, setRevisionMode] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const decide = (decision: "APPROVED" | "REJECTED" | "NEEDS_REVISION") => {
    startTransition(async () => {
      const result = await reviewSubmissionAction({ submissionId, decision, adminNote: note || undefined });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(
        decision === "APPROVED" ? "Approved and balance credited." : decision === "REJECTED" ? "Rejected." : "Sent back for revision."
      );
      router.refresh();
    });
  };

  return (
    <div className="space-y-2">
      {revisionMode && (
        <Textarea
          placeholder="Tell the worker what to fix…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="text-xs"
          autoFocus
        />
      )}
      <div className="flex gap-2">
        {revisionMode ? (
          <>
            <Button size="sm" onClick={() => decide("NEEDS_REVISION")} disabled={pending || !note.trim()}>
              Send back
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setRevisionMode(false)} disabled={pending}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" onClick={() => decide("APPROVED")} disabled={pending}>
              <Check className="h-4 w-4" />
              Approve
            </Button>
            <Button size="sm" variant="outline" onClick={() => setRevisionMode(true)} disabled={pending}>
              <RotateCcw className="h-4 w-4" />
              Revision
            </Button>
            <Button size="sm" variant="destructive" onClick={() => decide("REJECTED")} disabled={pending}>
              <X className="h-4 w-4" />
              Reject
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
