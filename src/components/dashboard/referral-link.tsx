"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ReferralLink({ link }: { link: string }) {
  return <div className="flex gap-2"><code className="min-w-0 flex-1 truncate rounded-md border border-border bg-surface-2 px-3 py-2 text-sm">{link}</code><Button size="sm" onClick={async () => { await navigator.clipboard.writeText(link); toast.success("Referral link copied."); }}>Copy</Button></div>;
}
