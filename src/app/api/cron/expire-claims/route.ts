import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { countAvailableTasks, expireStaleClaims } from "@/lib/services/tasks";
import { sendAvailableTasksNotification } from "@/lib/services/discord";

// Triggered by Vercel Cron (see vercel.json). Protects against a claimed
// task sitting forever if a worker never submits or comes back.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const released = await expireStaleClaims();
  if (released > 0) revalidateTag("available-tasks");
  const availableTasks = await countAvailableTasks();
  try {
    const notification = await sendAvailableTasksNotification(availableTasks);
    return NextResponse.json({ released, availableTasks, notification });
  } catch (error) {
    console.error("Task notification failed", error);
    return NextResponse.json({ released, availableTasks, notification: { sent: false, reason: "delivery-failed" } }, { status: 502 });
  }
}
