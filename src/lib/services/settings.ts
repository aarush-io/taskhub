import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { UpdateSettingsInput } from "@/lib/validations/task";

const legacySettingsSelect = {
  id: true,
  postReward: true,
  commentReward: true,
  replyReward: true,
  claimCooldownMin: true,
  claimTimeoutMin: true,
  maxActiveTasks: true,
  referralReward: true,
  referredWorkerBonus: true,
  updatedAt: true,
} as const;

function isMissingDiscordSupportColumn(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2022";
}

async function loadSettings() {
  try {
    const existing = await prisma.globalSettings.findUnique({ where: { id: "singleton" } });
    return existing ?? prisma.globalSettings.create({ data: { id: "singleton" } });
  } catch (error) {
    if (!isMissingDiscordSupportColumn(error)) throw error;

    const existing = await prisma.globalSettings.findUnique({ where: { id: "singleton" }, select: legacySettingsSelect });
    const settings = existing ?? await prisma.globalSettings.create({ data: { id: "singleton" }, select: legacySettingsSelect });
    return { ...settings, discordSupportUrl: null };
  }
}

const getCachedSettings = unstable_cache(loadSettings, ["global-settings"], {
  revalidate: 30,
  tags: ["settings"],
});

export function getSettings() {
  return getCachedSettings();
}

export async function updateSettings(input: UpdateSettingsInput) {
  const { revalidateTag } = await import("next/cache");
  try {
    const result = await prisma.globalSettings.upsert({
      where: { id: "singleton" },
      update: input,
      create: { id: "singleton", ...input },
    });
    revalidateTag("settings");
    return result;
  } catch (error) {
    if (!isMissingDiscordSupportColumn(error)) throw error;
    if (input.discordSupportUrl?.trim()) {
      throw new Error("The Discord support setting needs the latest database migration before it can be saved.");
    }

    const { discordSupportUrl: _discordSupportUrl, ...legacyInput } = input;
    const settings = await prisma.globalSettings.upsert({
      where: { id: "singleton" },
      update: legacyInput,
      create: { id: "singleton", ...legacyInput },
      select: legacySettingsSelect,
    });
    revalidateTag("settings");
    return { ...settings, discordSupportUrl: null };
  }
}

export function rewardForCategory(
  category: "POST" | "COMMENT" | "REPLY",
  settings: { postReward: unknown; commentReward: unknown; replyReward: unknown }
) {
  switch (category) {
    case "POST":
      return settings.postReward;
    case "COMMENT":
      return settings.commentReward;
    case "REPLY":
      return settings.replyReward;
  }
}
