export async function sendAvailableTasksNotification(availableTasks: number) {
  const channelId = process.env.DISCORD_TASKS_CHANNEL_ID;
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (availableTasks < 1 || !channelId || !botToken) {
    return { sent: false, reason: availableTasks < 1 ? "no-tasks" : "not-configured" } as const;
  }

  const appUrl = (process.env.AUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const noun = availableTasks === 1 ? "Task" : "Tasks";
  const content = `🚨 **${availableTasks} ${noun} Available!** 🚨\n\nThere are currently ${availableTasks} available tasks on TaskHorizon.\n\n${appUrl}/dashboard`;
  const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bot ${botToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
  });
  if (!response.ok) throw new Error(`Discord task notification failed (${response.status}).`);
  return { sent: true } as const;
}
