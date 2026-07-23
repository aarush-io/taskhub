import { getAdminAnalytics } from "@/lib/services/analytics";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Users, Activity, CalendarDays, CalendarRange, Radio, Clock, CheckCircle2, XCircle, Wallet } from "lucide-react";

export default async function AdminOverviewPage() {
  const a = await getAdminAnalytics();

  const cards = [
    { label: "Registered users", value: a.registeredUsers, icon: Users },
    { label: "Active today", value: a.activeToday, icon: Activity },
    { label: "Active this week", value: a.activeThisWeek, icon: CalendarDays },
    { label: "Active this month", value: a.activeThisMonth, icon: CalendarRange },
    { label: "Online now", value: a.onlineUsers, icon: Radio },
    { label: "Pending reviews", value: a.pendingReviews, icon: Clock },
    { label: "Approved tasks", value: a.approvedTasks, icon: CheckCircle2 },
    { label: "Rejected tasks", value: a.rejectedTasks, icon: XCircle },
    { label: "Total payouts", value: formatCurrency(a.totalPayouts.toString()), icon: Wallet },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted">{c.label}</p>
              <c.icon className="h-4 w-4 text-accent" />
            </div>
            <p className="font-display text-2xl">{c.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
