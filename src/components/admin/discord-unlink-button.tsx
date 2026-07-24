"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { unlinkWorkerDiscordAction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";

export function DiscordUnlinkButton({ workerId }: { workerId: string }) {
  const [pending, startTransition] = useTransition();
  return <Button variant="outline" size="sm" disabled={pending} onClick={() => startTransition(async () => {
    const result = await unlinkWorkerDiscordAction(workerId);
    result.success ? toast.success("Discord account unlinked. The worker can link a new one.") : toast.error(result.error);
  })}>{pending ? "Unlinking..." : "Unlink Discord"}</Button>;
}
