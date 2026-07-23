"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { submitTaskSchema, SubmitTaskInput } from "@/lib/validations/task";
import { submitTaskAction } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function SubmitTaskDialog({ taskId }: { taskId: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SubmitTaskInput>({
    resolver: zodResolver(submitTaskSchema),
    defaultValues: { taskId },
  });

  const onSubmit = async (data: SubmitTaskInput) => {
    const result = await submitTaskAction(data);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Submitted for review.");
    reset();
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Submit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit your work</DialogTitle>
          <DialogDescription>Paste the main link and three random links from the same thread.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <input type="hidden" {...register("taskId")} value={taskId} />
          <div className="space-y-1.5">
            <Label htmlFor="mainLink">Main link</Label>
            <Input id="mainLink" placeholder="https://reddit.com/r/..." {...register("mainLink")} />
            {errors.mainLink && <p className="text-xs text-danger">{errors.mainLink.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="randomLink1">Random link 1</Label>
            <Input id="randomLink1" placeholder="https://reddit.com/r/..." {...register("randomLink1")} />
            {errors.randomLink1 && <p className="text-xs text-danger">{errors.randomLink1.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="randomLink2">Random link 2</Label>
            <Input id="randomLink2" placeholder="https://reddit.com/r/..." {...register("randomLink2")} />
            {errors.randomLink2 && <p className="text-xs text-danger">{errors.randomLink2.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="randomLink3">Random link 3</Label>
            <Input id="randomLink3" placeholder="https://reddit.com/r/..." {...register("randomLink3")} />
            {errors.randomLink3 && <p className="text-xs text-danger">{errors.randomLink3.message}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting…" : "Submit for review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
