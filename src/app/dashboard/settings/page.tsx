import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AccountSettings } from "@/components/dashboard/account-settings";

export default async function WorkerSettingsPage() {
  const session = await getCurrentSession();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session!.user.id }, select: { username: true, email: true, redditUsername: true, discordUsername: true, discordAvatar: true } });
  return <div className="space-y-6"><div><p className="text-sm text-muted">Account</p><h1 className="font-display text-2xl">Your settings</h1></div><AccountSettings user={user} /></div>;
}
