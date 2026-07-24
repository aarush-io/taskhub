"use server";

import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { revalidateTag } from "next/cache";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { registerSchema, RegisterInput } from "@/lib/validations/auth";
import { changePasswordSchema, ChangePasswordInput, updateProfileSchema, UpdateProfileInput } from "@/lib/validations/auth";

export async function registerWorker(input: RegisterInput) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const { username, email, password, redditUsername, referralCode } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }, ...(redditUsername ? [{ redditUsername: { equals: redditUsername, mode: "insensitive" as const } }] : [])] },
  });
  if (existing) {
    return {
      success: false,
      error: existing.email === email ? "An account with this email already exists" : "That username is taken",
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const referrer = referralCode ? await prisma.user.findUnique({ where: { referralCode } }) : null;
  if (referralCode && !referrer) return { success: false, error: "That referral code is not valid." };
  const ownReferralCode = randomBytes(5).toString("hex").toUpperCase();

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
      username,
      email,
      passwordHash,
      redditUsername: redditUsername || null,
      role: "WORKER",
      referralCode: ownReferralCode,
      },
    });
    if (referrer && referrer.id !== user.id) {
      await tx.referral.create({ data: { referrerId: referrer.id, referredId: user.id } });
    }
  });

  revalidateTag("admin-analytics");

  return { success: true };
}

async function requireWorker() {
  const session = await auth();
  if (!session?.user) throw new Error("Sign in to update your account.");
  return session.user;
}

export async function updateProfileAction(input: UpdateProfileInput) {
  try {
    const user = await requireWorker();
    const parsed = updateProfileSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid profile" };
    const conflict = await prisma.user.findFirst({ where: { id: { not: user.id }, OR: [{ username: parsed.data.username }, { email: parsed.data.email }] }, select: { id: true } });
    if (conflict) return { success: false, error: "That username or email is already in use." };
    await prisma.user.update({ where: { id: user.id }, data: parsed.data });
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unable to update your profile." };
  }
}

export async function changePasswordAction(input: ChangePasswordInput) {
  try {
    const user = await requireWorker();
    const parsed = changePasswordSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid password" };
    const account = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { passwordHash: true } });
    if (!(await bcrypt.compare(parsed.data.currentPassword, account.passwordHash))) return { success: false, error: "Your current password is incorrect." };
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 12) } });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unable to change your password." };
  }
}
