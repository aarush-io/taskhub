import { getCurrentSession } from "@/lib/session";
import { getReferralDashboard } from "@/lib/services/referrals";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReferralLink } from "@/components/dashboard/referral-link";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";

export default async function ReferralsPage() {
  const session = await getCurrentSession();
  const data = await getReferralDashboard(session!.user.id);
  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
  return <div className="space-y-6">
    <div><p className="text-sm text-muted">Referrals</p><h1 className="font-display text-2xl">Invite people you trust</h1><p className="mt-1 text-sm text-muted">Share your link and earn a reward when a referred worker completes their first approved task.</p></div>
    <Card><CardHeader><CardTitle>Your referral link</CardTitle></CardHeader><CardContent className="space-y-3"><p className="text-sm text-muted">Your referral code is built into this link. Send it to people who would enjoy completing Reddit tasks.</p><ReferralLink link={`${baseUrl}/register?ref=${data.user.referralCode}`} /></CardContent></Card>
    <div className="grid gap-4 sm:grid-cols-3">{[{ label: "People invited", value: data.total }, { label: "Qualified referrals", value: data.successful }, { label: "Referral earnings", value: formatCurrency(data.earnings.toString()) }].map((stat) => <Card key={stat.label}><CardContent className="p-5"><p className="text-xs text-muted">{stat.label}</p><p className="mt-2 font-display text-3xl">{stat.value}</p></CardContent></Card>)}</div>
    <Card><CardHeader><CardTitle>Your referrals</CardTitle></CardHeader><CardContent className="p-0">{data.referrals.length ? <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-xs text-muted"><th className="px-5 py-3 font-medium">Worker</th><th className="px-5 py-3 font-medium">Joined</th><th className="px-5 py-3 font-medium">Status</th></tr></thead><tbody className="divide-y divide-border">{data.referrals.map((referral) => <tr key={referral.id}><td className="px-5 py-3"><p className="font-medium">{referral.username}</p><p className="text-xs text-muted">{referral.email}</p></td><td className="px-5 py-3 text-muted">{timeAgo(referral.createdAt)}</td><td className="px-5 py-3"><Badge variant={referral.status === "SUCCESSFUL" ? "success" : referral.status === "REJECTED" ? "danger" : "accent"}>{referral.status === "SUCCESSFUL" ? "Qualified" : referral.status === "PENDING" ? "In progress" : "Not qualified"}</Badge></td></tr>)}</tbody></table></div> : <div className="px-5 pb-5 text-sm text-muted">No one has joined with your link yet.</div>}</CardContent></Card>
  </div>;
}
