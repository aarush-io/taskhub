import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const stateCookie = "desk_discord_link_state";
const returnCookie = "desk_discord_link_return";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.redirect(new URL("/login", request.url));
  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
    return NextResponse.redirect(new URL("/dashboard/referrals?discord=unconfigured", request.url));
  }
  const state = randomBytes(32).toString("hex");
  const requestedReturn = new URL(request.url).searchParams.get("returnTo");
  const returnTo = requestedReturn?.startsWith("/dashboard") ? requestedReturn : "/dashboard/settings";
  const origin = new URL(request.url).origin;
  const url = new URL("https://discord.com/oauth2/authorize");
  url.searchParams.set("client_id", process.env.DISCORD_CLIENT_ID);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", `${origin}/api/discord/callback`);
  url.searchParams.set("scope", "identify");
  url.searchParams.set("state", state);
  const response = NextResponse.redirect(url);
  response.cookies.set(stateCookie, state, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 600, path: "/" });
  response.cookies.set(returnCookie, returnTo, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 600, path: "/" });
  return response;
}
