"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { registerSchema, RegisterInput } from "@/lib/validations/auth";
import { registerWorker } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema), defaultValues: { referralCode: searchParams.get("ref")?.toUpperCase() ?? "" } });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    const result = await registerWorker(data);
    setLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Account created. Sign in to continue.");
    router.push("/login");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="username">Username</Label>
        <Input id="username" placeholder="jane_writes" {...register("username")} />
        {errors.username && <p className="text-xs text-danger">{errors.username.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
        {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="redditUsername">Reddit username</Label>
        <Input id="redditUsername" placeholder="u/your_reddit_handle" {...register("redditUsername")} />
        {errors.redditUsername && <p className="text-xs text-danger">{errors.redditUsername.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="referralCode">Referral code (optional)</Label>
        <Input id="referralCode" placeholder="ABC123" {...register("referralCode")} />
        {errors.referralCode && <p className="text-xs text-danger">{errors.referralCode.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
        {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input id="confirmPassword" type="password" placeholder="••••••••" {...register("confirmPassword")} />
        {errors.confirmPassword && <p className="text-xs text-danger">{errors.confirmPassword.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
