import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0 margin-rule opacity-30" style={{ left: "8%" }} />
      <div className="pointer-events-none absolute inset-0 margin-rule opacity-30" style={{ right: "8%", left: "auto" }} />
      <div className="w-full max-w-sm animate-slide-up">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 text-accent">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="font-display text-2xl font-medium">TaskHorizon</h1>
          <p className="text-sm text-muted">Your workspace for clear tasks and real progress</p>
        </div>
        {children}
      </div>
    </div>
  );
}
