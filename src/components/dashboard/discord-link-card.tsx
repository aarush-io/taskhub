"use client";

import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function DiscordLinkCard({ username, avatar, returnTo = "/dashboard/settings" }: { username: string | null; avatar: string | null; returnTo?: string }) {
  const params = useSearchParams();
  const status = params.get("discord");
  const message = status === "linked" ? "Discord account linked successfully." : status === "already-linked" ? "That Discord account is already linked to another TaskHorizon account." : status === "failed" ? "Discord linking could not be completed. Please try again." : status === "unconfigured" ? "Discord OAuth is not configured yet." : null;
  return <div className="space-y-3">
    {message && <p className={status === "linked" ? "text-sm text-success" : "text-sm text-danger"}>{message}</p>}
    {username ? <div className="flex items-center gap-3">{avatar && <Image src={avatar} alt="" width={36} height={36} unoptimized className="h-9 w-9 rounded-full" />}<span className="text-sm">Linked as <strong>@{username}</strong></span></div> : <p className="text-sm text-muted">Link Discord to verify your account and use Discord sign-in.</p>}
    {!username && <Button asChild variant="outline" size="sm"><a href={`/api/discord/link?returnTo=${encodeURIComponent(returnTo)}`}>Link Discord</a></Button>}
  </div>;
}
