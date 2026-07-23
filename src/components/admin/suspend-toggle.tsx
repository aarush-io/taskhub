"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Ban, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { suspendWorkerAction } from "@/app/actions/admin";

export function SuspendToggle({ workerId, suspended }: { workerId: string; suspended: boolean }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const toggle = () => {
    startTransition(async () => {
      const result = await suspendWorkerAction(workerId, !suspended);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(suspended ? "Worker reinstated." : "Worker suspended.");
      router.refresh();
    });
  };

  return (
    <Button size="sm" variant={suspended ? "outline" : "destructive"} onClick={toggle} disabled={pending}>
      {suspended ? <RotateCcw className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
      {suspended ? "Reinstate" : "Suspend"}
    </Button>
  );
}
