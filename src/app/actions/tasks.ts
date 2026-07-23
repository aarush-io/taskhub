"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { claimTask, submitTask, TaskError } from "@/lib/services/tasks";
import { submitTaskSchema, SubmitTaskInput } from "@/lib/validations/task";

export async function claimTaskAction(taskId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") {
    return { success: false, error: "You must be logged in as a worker." };
  }

  try {
    await claimTask(taskId, session.user.id);
    revalidatePath("/dashboard/tasks");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    if (err instanceof TaskError) return { success: false, error: err.message };
    console.error(err);
    return { success: false, error: "Something went wrong claiming this task." };
  }
}

export async function submitTaskAction(input: SubmitTaskInput) {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") {
    return { success: false, error: "You must be logged in as a worker." };
  }

  const parsed = submitTaskSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid submission" };
  }

  try {
    await submitTask(parsed.data, session.user.id);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/history");
    return { success: true };
  } catch (err) {
    if (err instanceof TaskError) return { success: false, error: err.message };
    console.error(err);
    return { success: false, error: "Something went wrong submitting this task." };
  }
}
