"use server";

import { revalidatePath, revalidateTag } from "next/cache";
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
    revalidateTag("available-tasks");
    revalidateTag("admin-tasks");
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
    revalidateTag("admin-analytics");
    revalidateTag("admin-reviews");
    revalidateTag("admin-tasks");
    revalidateTag("worker-overview");
    revalidateTag("available-tasks");
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

export async function unlinkWorkerDiscordAction(workerId: string) {
  try {
    await requireAdmin();
    await prisma.user.update({
      where: { id: workerId },
      data: { discordId: null, discordUsername: null, discordAvatar: null, discordLinkedAt: null, discordUnlinkedAt: new Date() },
    });
    revalidatePath("/admin/workers");
    revalidatePath(`/admin/workers/${workerId}`);
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Unable to unlink this Discord account." };
  }
}

export async function setWorkerClaimBanAction(workerId: string, claimBanned: boolean) {
  try {
    await requireAdmin();
    await prisma.user.update({ where: { id: workerId }, data: { claimBanned, claimBannedAt: claimBanned ? new Date() : null } });
    revalidatePath("/admin/workers");
    revalidatePath(`/admin/workers/${workerId}`);
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Unable to update claim access." };
  }
}

export async function setTaskPausedAction(taskId: string, isPaused: boolean) {
  try {
    await requireAdmin();
    await prisma.task.update({ where: { id: taskId }, data: { isPaused } });
    revalidateTag("available-tasks");
    revalidateTag("admin-tasks");
    revalidatePath("/admin/tasks");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Unable to update task campaign." };
  }
}

export async function removeTaskFromWorkerAction(taskId: string) {
  try {
    await requireAdmin();
    const task = await prisma.task.findUnique({ where: { id: taskId }, select: { status: true } });
    if (!task || !["CLAIMED", "SUBMITTED"].includes(task.status)) return { success: false, error: "Only active claimed tasks can be removed from a worker." };
    await prisma.$transaction([
      prisma.submission.deleteMany({ where: { taskId } }),
      prisma.task.update({ where: { id: taskId }, data: { status: "AVAILABLE", claimedById: null, claimedAt: null, claimExpiresAt: null } }),
    ]);
    revalidateTag("available-tasks");
    revalidateTag("admin-tasks");
    revalidateTag("worker-overview");
    revalidatePath("/admin/tasks");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Unable to remove the task from this worker." };
  }
}
