import { Badge } from "@/components/ui/badge";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "success" | "danger" | "info" | "accent" | "muted" }> = {
  AVAILABLE: { label: "Available", variant: "muted" },
  CLAIMED: { label: "Claimed", variant: "accent" },
  SUBMITTED: { label: "Pending review", variant: "info" },
  APPROVED: { label: "Approved", variant: "success" },
  REJECTED: { label: "Rejected", variant: "danger" },
  NEEDS_REVISION: { label: "Needs revision", variant: "accent" },
  EXPIRED: { label: "Expired", variant: "muted" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status] ?? { label: status, variant: "default" as const };
  return (
    <Badge variant={config.variant} className="proof-stamp">
      {config.label}
    </Badge>
  );
}
