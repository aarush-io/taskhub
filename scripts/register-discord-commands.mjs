const clientId = process.env.DISCORD_CLIENT_ID;
const token = process.env.DISCORD_BOT_TOKEN;
const guildId = process.env.DISCORD_GUILD_ID;

if (!clientId || !token) throw new Error("Set DISCORD_CLIENT_ID and DISCORD_BOT_TOKEN in .env first.");
const endpoint = guildId
  ? `https://discord.com/api/v10/applications/${clientId}/guilds/${guildId}/commands`
  : `https://discord.com/api/v10/applications/${clientId}/commands`;
const commands = [
  { name: "profile", description: "Show your linked Desk profile" },
  { name: "balance", description: "Show your Desk balance" },
  { name: "referral", description: "Show your successful referral count" },
];
const response = await fetch(endpoint, { method: "PUT", headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(commands) });
if (!response.ok) throw new Error(`Discord rejected command registration: ${await response.text()}`);
console.log(`Registered ${commands.length} ${guildId ? "guild" : "global"} command(s).`);
