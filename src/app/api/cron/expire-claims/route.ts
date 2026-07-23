import { NextResponse } from "next/server";
import { expireStaleClaims } from "@/lib/services/tasks";

// Triggered by Vercel Cron (see vercel.json). Protects against a claimed
// task sitting forever if a worker never submits or comes back.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const released = await expireStaleClaims();
  return NextResponse.json({ released });
}
