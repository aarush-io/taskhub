import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type DiscordUser = { id: string; username: string; avatar: string | null };
const stateCookie = "desk_discord_link_state";
const returnCookie = "desk_discord_link_return";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const savedReturn = (await cookies()).get(returnCookie)?.value;
  const returnTo = savedReturn?.startsWith("/dashboard") ? savedReturn : "/dashboard/settings";
  const done = (status: string) => NextResponse.redirect(new URL(`${returnTo}?discord=${status}`, origin));
  const session = await auth();
  const query = new URL(request.url).searchParams;
  const expectedState = (await cookies()).get(stateCookie)?.value;
  if (!session?.user?.id || !expectedState || query.get("state") !== expectedState || !query.get("code")) return done("failed");

  const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "authorization_code", code: query.get("code")!, redirect_uri: `${origin}/api/discord/callback`, client_id: process.env.DISCORD_CLIENT_ID!, client_secret: process.env.DISCORD_CLIENT_SECRET! }),
  });
  if (!tokenResponse.ok) return done("failed");
  const token = await tokenResponse.json() as { access_token: string };
  const discordResponse = await fetch("https://discord.com/api/users/@me", { headers: { Authorization: `Bearer ${token.access_token}` } });
  if (!discordResponse.ok) return done("failed");
  const discord = await discordResponse.json() as DiscordUser;
  const owner = await prisma.user.findUnique({ where: { discordId: discord.id }, select: { id: true } });
  if (owner && owner.id !== session.user.id) return done("already-linked");
  const avatar = discord.avatar ? `https://cdn.discordapp.com/avatars/${discord.id}/${discord.avatar}.png?size=128` : `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(discord.id) >> 22n) % 6}.png`;
  await prisma.user.update({ where: { id: session.user.id }, data: { discordId: discord.id, discordUsername: discord.username, discordAvatar: avatar, discordLinkedAt: new Date(), discordUnlinkedAt: null } });
  const response = done("linked");
  response.cookies.delete(stateCookie);
  response.cookies.delete(returnCookie);
  return response;
}
