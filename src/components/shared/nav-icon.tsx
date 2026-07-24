"use client";

import {
  ClipboardCheck,
  ClipboardPlus,
  Gift,
  History,
  LayoutDashboard,
  ListChecks,
  Radio,
  Settings,
  Users,
} from "lucide-react";
import type { NavIconName } from "@/components/shared/nav-items";

const icons = {
  "layout-dashboard": LayoutDashboard,
  "list-checks": ListChecks,
  history: History,
  gift: Gift,
  "clipboard-plus": ClipboardPlus,
  "clipboard-check": ClipboardCheck,
  users: Users,
  settings: Settings,
  radio: Radio,
} satisfies Record<NavIconName, typeof LayoutDashboard>;

export function NavIcon({ name, className }: { name: NavIconName; className?: string }) {
  const Icon = icons[name];
  return <Icon className={className} />;
}
