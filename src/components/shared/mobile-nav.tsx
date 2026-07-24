"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { NavItem } from "@/components/shared/nav-items";
import { NavIcon } from "@/components/shared/nav-icon";

export function MobileNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface/95 backdrop-blur md:hidden">
      {items.slice(0, 4).map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
              active ? "text-accent" : "text-muted"
            )}
          >
            {active && (
              <motion.span
                layoutId="mobile-nav-active-dot"
                className="absolute top-0 h-0.5 w-8 rounded-full bg-accent"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <NavIcon name={item.icon} className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
