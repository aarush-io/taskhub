"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateSettingsSchema, UpdateSettingsInput } from "@/lib/validations/task";
import { updateSettingsAction } from "@/app/actions/admin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type Defaults = {
  postReward: number;
  commentReward: number;
  replyReward: number;
  claimCooldownMin: number;
  claimTimeoutMin: number;
  maxActiveTasks: number;
  referralReward: number;
  referredWorkerBonus: number;
  discordSupportUrl: string;
};

export function SettingsForm({ defaults }: { defaults: Defaults }) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateSettingsInput>({
    resolver: zodResolver(updateSettingsSchema),
    defaultValues: defaults,
  });

  const onSubmit = async (data: UpdateSettingsInput) => {
    const result = await updateSettingsAction(data);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Settings saved. New tasks will use these values.");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rewards</CardTitle>
          <CardDescription>Changing these only affects tasks created from now on — existing tasks keep their snapshot.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Field label="Post reward ($)" error={errors.postReward?.message} {...register("postReward")} />
          <Field label="Comment reward ($)" error={errors.commentReward?.message} {...register("commentReward")} />
          <Field label="Reply reward ($)" error={errors.replyReward?.message} {...register("replyReward")} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Worker support</CardTitle>
          <CardDescription>Workers see this link only while they have an active task, so help stays attached to the work they need help with.</CardDescription>
        </CardHeader>
        <CardContent>
          <TextField label="Discord support channel or invite URL" error={errors.discordSupportUrl?.message} placeholder="https://discord.gg/your-server" {...register("discordSupportUrl")} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Referrals</CardTitle>
          <CardDescription>Rewards are issued only after a referred worker&apos;s first approved task.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Referrer reward ($)" error={errors.referralReward?.message} {...register("referralReward")} />
          <Field label="Referred worker bonus ($)" error={errors.referredWorkerBonus?.message} {...register("referredWorkerBonus")} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Claiming</CardTitle>
          <CardDescription>Controls how tasks flow through the pool.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Field label="Claim cooldown (min)" error={errors.claimCooldownMin?.message} {...register("claimCooldownMin")} />
          <Field label="Claim timeout (min)" error={errors.claimTimeoutMin?.message} {...register("claimTimeoutMin")} />
          <Field label="Max active tasks" error={errors.maxActiveTasks?.message} {...register("maxActiveTasks")} />
        </CardContent>
      </Card>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}

function Field({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type="number" step="0.01" {...props} />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

function TextField({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type="url" {...props} />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
