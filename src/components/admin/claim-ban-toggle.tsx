"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { setWorkerClaimBanAction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";

export function ClaimBanToggle({ workerId, claimBanned }: { workerId: string; claimBanned: boolean }) {
  const [pending, startTransition] = useTransition();
  return <Button variant="outline" size="sm" disabled={pending} onClick={() => startTransition(async () => {
    const result = await setWorkerClaimBanAction(workerId, !claimBanned);
    result.success ? toast.success(claimBanned ? "Claim access restored." : "Worker blocked from claiming tasks.") : toast.error(result.error);
  })}>{pending ? "Saving..." : claimBanned ? "Allow claims" : "Block claims"}</Button>;
}
