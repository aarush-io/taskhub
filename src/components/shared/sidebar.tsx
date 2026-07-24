"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Feather } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavItem } from "@/components/shared/nav-items";
import { NavIcon } from "@/components/shared/nav-icon";

export function Sidebar({ items, label }: { items: NavItem[]; label: string }) {
  const pathname = usePathname();

  return (
    <aside className="relative hidden w-64 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="absolute right-0 top-0 h-full margin-rule" />
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/10 text-accent">
          <Feather className="h-4 w-4" />
        </div>
        <div>
          <p className="font-display text-base leading-none tracking-tight">TaskHorizon</p>
          <p className="mt-1 text-xs text-muted">{label}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 px-4">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active ? "text-accent" : "text-muted hover:text-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-md bg-accent/10"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative flex items-center gap-3">
                <NavIcon name={item.icon} className="h-4 w-4" />
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-5 text-xs text-muted">TaskHorizon workspace</div>
    </aside>
  );
}
