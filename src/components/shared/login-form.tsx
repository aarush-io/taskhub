"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { loginSchema, LoginInput } from "@/lib/validations/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    const result = await signIn("credentials", { ...data, redirect: false });
    setLoading(false);

    if (result?.error) {
      toast.error("Invalid email or password.");
      return;
    }

    toast.success("Welcome back.");
    const callbackUrl = params.get("callbackUrl");
    router.replace(callbackUrl && callbackUrl !== "/" ? callbackUrl : "/post-login");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
        {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
        {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </Button>
      <Button type="button" variant="outline" className="w-full" onClick={() => signIn("discord", { callbackUrl: params.get("callbackUrl") ?? "/post-login" })}>
        Sign in with Discord
      </Button>
    </form>
  );
}
