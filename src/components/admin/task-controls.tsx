"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { removeTaskFromWorkerAction, setTaskPausedAction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";

export function TaskControls({ taskId, paused, claimed }: { taskId: string; paused: boolean; claimed: boolean }) {
  const [pending, startTransition] = useTransition();
  const run = (operation: "pause" | "remove") => startTransition(async () => {
    const result = operation === "pause" ? await setTaskPausedAction(taskId, !paused) : await removeTaskFromWorkerAction(taskId);
    result.success ? toast.success(operation === "pause" ? (paused ? "Task resumed." : "Task paused.") : "Task returned to the pool.") : toast.error(result.error);
  });
  return <div className="flex gap-2"><Button size="sm" variant="outline" disabled={pending} onClick={() => run("pause")}>{paused ? "Resume" : "Pause"}</Button>{claimed && <Button size="sm" variant="outline" disabled={pending} onClick={() => run("remove")}>Remove worker</Button>}</div>;
}
