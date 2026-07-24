"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Ban, Link2Off, MoreHorizontal, RotateCcw, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { setWorkerClaimBanAction, suspendWorkerAction, unlinkWorkerDiscordAction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function WorkerActionsMenu({ workerId, suspended, claimBanned, hasDiscord }: { workerId: string; suspended: boolean; claimBanned: boolean; hasDiscord: boolean }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const run = (action: "suspend" | "claims" | "discord") => startTransition(async () => {
    if (action === "discord" && !window.confirm("Unlink this worker's Discord account?")) return;
    const result = action === "suspend" ? await suspendWorkerAction(workerId, !suspended) : action === "claims" ? await setWorkerClaimBanAction(workerId, !claimBanned) : await unlinkWorkerDiscordAction(workerId);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(action === "suspend" ? (suspended ? "Worker reinstated." : "Worker suspended.") : action === "claims" ? (claimBanned ? "Claim access restored." : "Worker blocked from claiming tasks.") : "Discord account unlinked.");
    router.refresh();
  });

  return <DropdownMenu><DropdownMenuTrigger asChild><Button size="sm" variant="outline" disabled={pending}><MoreHorizontal className="h-4 w-4" />Actions</Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="min-w-[13rem]"><DropdownMenuLabel>Worker controls</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem onSelect={() => run("claims")}><ShieldOff className="mr-2 h-4 w-4" />{claimBanned ? "Allow task claims" : "Block task claims"}</DropdownMenuItem><DropdownMenuItem onSelect={() => run("suspend")} className={suspended ? undefined : "text-danger"}>{suspended ? <RotateCcw className="mr-2 h-4 w-4" /> : <Ban className="mr-2 h-4 w-4" />}{suspended ? "Reinstate worker" : "Suspend worker"}</DropdownMenuItem>{hasDiscord && <><DropdownMenuSeparator /><DropdownMenuItem onSelect={() => run("discord")}><Link2Off className="mr-2 h-4 w-4" />Unlink Discord</DropdownMenuItem></>}</DropdownMenuContent></DropdownMenu>;
}
