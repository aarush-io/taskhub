import { getSettings } from "@/lib/services/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="max-w-2xl">
      <SettingsForm
        defaults={{
          postReward: Number(settings.postReward),
          commentReward: Number(settings.commentReward),
          replyReward: Number(settings.replyReward),
          claimCooldownMin: settings.claimCooldownMin,
          claimTimeoutMin: settings.claimTimeoutMin,
          maxActiveTasks: settings.maxActiveTasks,
        }}
      />
    </div>
  );
}
