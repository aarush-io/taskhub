import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function interactionResponse(content: string) {
  return NextResponse.json({ type: 4, data: { content, flags: 64 } });
}

async function isValidDiscordRequest(request: Request, body: string) {
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");
  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  if (!signature || !timestamp || !publicKey) return false;
  try {
    const keyBytes = Buffer.from(publicKey, "hex");
    const signatureBytes = Buffer.from(signature, "hex");
    const key = await crypto.subtle.importKey("raw", keyBytes, { name: "Ed25519" }, false, ["verify"]);
    return crypto.subtle.verify("Ed25519", key, signatureBytes, new TextEncoder().encode(timestamp + body));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!(await isValidDiscordRequest(request, rawBody))) return new NextResponse("invalid request signature", { status: 401 });
  const interaction = JSON.parse(rawBody) as { type: number; member?: { user?: { id: string } }; user?: { id: string }; data?: { name?: string } };
  if (interaction.type === 1) return NextResponse.json({ type: 1 });
  const discordId = interaction.member?.user?.id ?? interaction.user?.id;
  if (!discordId) return interactionResponse("Unable to identify your Discord account.");
  const user = await prisma.user.findUnique({ where: { discordId }, select: { username: true, suspended: true, transactions: { select: { amount: true, type: true } }, referralsMade: { where: { status: "SUCCESSFUL" }, select: { id: true } } } });
  if (!user || user.suspended) return interactionResponse("Your Discord account is not linked to an active TaskHorizon account.");
  const balance = user.transactions.reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  switch (interaction.data?.name) {
    case "profile": return interactionResponse(`**${user.username}**\nLinked and verified on TaskHorizon.`);
    case "balance": return interactionResponse(`**${user.username}**\nAvailable balance: **$${balance.toFixed(2)}**`);
    case "referral": return interactionResponse(`**${user.username}**\nSuccessful referrals: **${user.referralsMade.length}**`);
    default: return interactionResponse("Unknown command.");
  }
}
