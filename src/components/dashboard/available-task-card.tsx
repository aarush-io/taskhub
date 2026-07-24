"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, cn } from "@/lib/utils";
import { claimTaskAction } from "@/app/actions/tasks";

type AvailableTask = {
  id: string;
  category: string;
  targetUrl: string;
  rewardSnapshot: string | number;
};

export function AvailableTaskCard({ task }: { task: AvailableTask }) {
  const [pending, startTransition] = useTransition();
  const [claimed, setClaimed] = useState(false);
  const router = useRouter();

  const handleClaim = () => {
    startTransition(async () => {
      const result = await claimTaskAction(task.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Task claimed. It's now in your active claims.");
      setClaimed(true);
      router.refresh();
    });
  };

  return (
    <Card
      className={cn(
        "transition-transform duration-200",
        claimed ? "opacity-50" : "hover:-translate-y-0.5 hover:border-border-strong"
      )}
    >
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <Badge variant="accent">{task.category}</Badge>
          <span className="font-mono text-sm text-muted">{formatCurrency(task.rewardSnapshot)}</span>
        </div>
        <p className="text-sm text-muted">Claim this task to view the full instructions.</p>
        <a
          href={task.targetUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-xs text-muted hover:text-accent"
        >
          View Reddit thread <ExternalLink className="h-3 w-3" />
        </a>
        <Button size="sm" onClick={handleClaim} disabled={pending || claimed}>
          {claimed ? "Claimed" : pending ? "Claiming…" : "Claim task"}
        </Button>
      </CardContent>
    </Card>
  );
}
