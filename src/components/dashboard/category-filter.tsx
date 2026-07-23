"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export function CategoryFilter() {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("category") ?? "ALL";

  return (
    <Select
      value={current}
      onValueChange={(value) => {
        const url = new URL(window.location.href);
        if (value === "ALL") url.searchParams.delete("category");
        else url.searchParams.set("category", value);
        router.push(url.pathname + url.search);
      }}
    >
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">All categories</SelectItem>
        <SelectItem value="POST">Post</SelectItem>
        <SelectItem value="COMMENT">Comment</SelectItem>
        <SelectItem value="REPLY">Reply</SelectItem>
      </SelectContent>
    </Select>
  );
}
