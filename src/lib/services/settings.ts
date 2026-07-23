import { prisma } from "@/lib/prisma";
import { UpdateSettingsInput } from "@/lib/validations/task";

export async function getSettings() {
  const settings = await prisma.globalSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  return settings;
}

export async function updateSettings(input: UpdateSettingsInput) {
  return prisma.globalSettings.upsert({
    where: { id: "singleton" },
    update: input,
    create: { id: "singleton", ...input },
  });
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
