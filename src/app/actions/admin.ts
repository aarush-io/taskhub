"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { createTask, reviewSubmission, TaskError } from "@/lib/services/tasks";
import { updateSettings } from "@/lib/services/settings";
import { prisma } from "@/lib/prisma";
import {
  createTaskSchema,
  CreateTaskInput,
  reviewSubmissionSchema,
  ReviewSubmissionInput,
  updateSettingsSchema,
  UpdateSettingsInput,
} from "@/lib/validations/task";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new TaskError("Admin access required.");
  }
  return session.user;
}

export async function createTaskAction(input: CreateTaskInput) {
  try {
    const admin = await requireAdmin();
    const parsed = createTaskSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid task" };

    await createTask(parsed.data, admin.id);
    revalidatePath("/admin/tasks");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    if (err instanceof TaskError) return { success: false, error: err.message };
    console.error(err);
    return { success: false, error: "Something went wrong creating the task." };
  }
}

export async function reviewSubmissionAction(input: ReviewSubmissionInput) {
  try {
    const admin = await requireAdmin();
    const parsed = reviewSubmissionSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid review" };

    await reviewSubmission(parsed.data, admin.id);
    revalidatePath("/admin/reviews");
    revalidatePath("/admin");
    revalidatePath("/admin/workers");
    return { success: true };
  } catch (err) {
    if (err instanceof TaskError) return { success: false, error: err.message };
    console.error(err);
    return { success: false, error: "Something went wrong reviewing this submission." };
  }
}

export async function updateSettingsAction(input: UpdateSettingsInput) {
  try {
    await requireAdmin();
    const parsed = updateSettingsSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid settings" };

    await updateSettings(parsed.data);
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (err) {
    if (err instanceof TaskError) return { success: false, error: err.message };
    console.error(err);
    return { success: false, error: "Something went wrong saving settings." };
  }
}

export async function suspendWorkerAction(workerId: string, suspended: boolean) {
  try {
    await requireAdmin();
    await prisma.user.update({
      where: { id: workerId },
      data: { suspended, suspendedAt: suspended ? new Date() : null },
    });
    revalidatePath("/admin/workers");
    revalidatePath(`/admin/workers/${workerId}`);
    return { success: true };
  } catch (err) {
    if (err instanceof TaskError) return { success: false, error: err.message };
    console.error(err);
    return { success: false, error: "Something went wrong updating this worker." };
  }
}
