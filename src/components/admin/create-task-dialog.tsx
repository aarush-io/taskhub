"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { createTaskSchema, CreateTaskInput } from "@/lib/validations/task";
import { createTaskAction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function CreateTaskDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateTaskInput>({ resolver: zodResolver(createTaskSchema) });

  const onSubmit = async (data: CreateTaskInput) => {
    const result = await createTaskAction(data);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Task created and added to the pool.");
    reset();
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          New task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a task</DialogTitle>
          <DialogDescription>The reward is snapshotted from current settings at creation time.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POST">Post</SelectItem>
                    <SelectItem value="COMMENT">Comment</SelectItem>
                    <SelectItem value="REPLY">Reply</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && <p className="text-xs text-danger">{errors.category.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="targetUrl">Target Reddit URL</Label>
            <Input id="targetUrl" placeholder="https://reddit.com/r/..." {...register("targetUrl")} />
            {errors.targetUrl && <p className="text-xs text-danger">{errors.targetUrl.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="instructions">Client instructions</Label>
            <Textarea id="instructions" rows={4} {...register("instructions")} />
            {errors.instructions && <p className="text-xs text-danger">{errors.instructions.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="publishAt">Publish at (optional)</Label>
            <Input id="publishAt" type="datetime-local" {...register("publishAt")} />
            <p className="text-xs text-muted">Leave blank to publish immediately.</p>
            {errors.publishAt && <p className="text-xs text-danger">{errors.publishAt.message}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
