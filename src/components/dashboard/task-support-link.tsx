"use client";

import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function TaskSupportLink({ url, taskId, category }: { url: string; taskId: string; category: string }) {
  const copyContext = async () => {
    await navigator.clipboard.writeText(`TaskHorizon help request\nTask: ${category}\nTask ID: ${taskId}`);
    toast.success("Task details copied. Paste them into Discord so support can help faster.");
  };

  return <div className="flex items-center gap-2 border-t border-border pt-3"><Button asChild size="sm" variant="outline"><a href={url} target="_blank" rel="noreferrer">Get help on Discord <ExternalLink className="h-3.5 w-3.5" /></a></Button><Button size="icon" variant="ghost" className="h-8 w-8" onClick={copyContext} title="Copy task details"><Copy className="h-3.5 w-3.5" /><span className="sr-only">Copy task details</span></Button></div>;
}
