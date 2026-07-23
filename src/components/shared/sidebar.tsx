"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavItem } from "@/components/shared/nav-items";

export function Sidebar({ items, label }: { items: NavItem[]; label: string }) {
  const pathname = usePathname();

  return (
    <aside className="relative hidden w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="absolute right-0 top-0 h-full margin-rule" />
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/10 text-accent">
          <PenLine className="h-4 w-4" />
        </div>
        <div>
          <p className="font-display text-base leading-none">Desk</p>
          <p className="text-xs text-muted">{label}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 px-3">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-accent/10 text-accent" : "text-muted hover:bg-surface-2 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 text-xs text-muted">v0.1 · Internal use only</div>
    </aside>
  );
}
