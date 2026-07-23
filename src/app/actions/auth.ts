"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema, RegisterInput } from "@/lib/validations/auth";

export async function registerWorker(input: RegisterInput) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const { username, email, password, redditUsername } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    return {
      success: false,
      error: existing.email === email ? "An account with this email already exists" : "That username is taken",
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      redditUsername: redditUsername || null,
      role: "WORKER",
    },
  });

  return { success: true };
}
