export type NavItem = {
  label: string;
  href: string;
  icon: NavIconName;
};

export type NavIconName =
  | "layout-dashboard"
  | "list-checks"
  | "history"
  | "gift"
  | "clipboard-plus"
  | "clipboard-check"
  | "users"
  | "settings"
  | "radio";

export const workerNav: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: "layout-dashboard" },
  { label: "Task tracking", href: "/dashboard/history", icon: "history" },
  { label: "Referrals", href: "/dashboard/referrals", icon: "gift" },
  { label: "Settings", href: "/dashboard/settings", icon: "settings" },
];

export const adminNav: NavItem[] = [
  { label: "Overview", href: "/admin", icon: "layout-dashboard" },
  { label: "Active work", href: "/admin/active", icon: "radio" },
  { label: "Tasks", href: "/admin/tasks", icon: "clipboard-plus" },
  { label: "Reviews", href: "/admin/reviews", icon: "clipboard-check" },
  { label: "Workers", href: "/admin/workers", icon: "users" },
  { label: "Settings", href: "/admin/settings", icon: "settings" },
];
