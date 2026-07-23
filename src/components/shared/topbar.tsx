"use client";

import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { SignOutItem } from "@/components/shared/sign-out-button";
import { CommandPalette } from "@/components/shared/command-palette";
import { NavItem } from "@/components/shared/nav-items";

export function Topbar({
  title,
  username,
  email,
  navItems,
}: {
  title: string;
  username: string;
  email: string;
  navItems: NavItem[];
}) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 px-5 py-4 backdrop-blur">
      <h1 className="font-display text-xl">{title}</h1>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setPaletteOpen(true)}
          className="hidden items-center gap-2 rounded-md border border-border bg-surface-2 px-3 py-1.5 text-xs text-muted transition-colors hover:text-foreground sm:flex"
        >
          <Search className="h-3.5 w-3.5" />
          Search
          <kbd className="rounded border border-border bg-surface px-1 font-mono text-[10px]">⌘K</kbd>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-xs font-medium text-accent">
              {username.slice(0, 2).toUpperCase()}
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <p className="text-foreground">{username}</p>
              <p className="font-normal text-muted">{email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <SignOutItem />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CommandPalette items={navItems} open={paletteOpen} onOpenChange={setPaletteOpen} />
    </header>
  );
}
