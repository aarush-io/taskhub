import { LayoutDashboard, ListChecks, History, ClipboardPlus, ClipboardCheck, Users, Settings } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
};

export const workerNav: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Browse tasks", href: "/dashboard/tasks", icon: ListChecks },
  { label: "History", href: "/dashboard/history", icon: History },
];

export const adminNav: NavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Tasks", href: "/admin/tasks", icon: ClipboardPlus },
  { label: "Reviews", href: "/admin/reviews", icon: ClipboardCheck },
  { label: "Workers", href: "/admin/workers", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];
