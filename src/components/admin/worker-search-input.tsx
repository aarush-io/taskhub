"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function WorkerSearchInput({ defaultValue }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue ?? "");
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const url = new URL(window.location.href);
        if (value) url.searchParams.set("q", value);
        else url.searchParams.delete("q");
        router.push(url.pathname + url.search);
      }}
      className="relative w-full max-w-sm"
    >
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search username, email, or Reddit username…"
        className="pl-9"
      />
    </form>
  );
}
