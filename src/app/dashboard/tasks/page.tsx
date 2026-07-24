import { getCurrentSession } from "@/lib/session";
import { getBrowseTasksData } from "@/lib/services/tasks";
import { BrowseTasksView } from "@/components/dashboard/browse-tasks-view";

export default async function BrowseTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: "POST" | "COMMENT" | "REPLY" }>;
}) {
  const session = await getCurrentSession();
  const workerId = session!.user.id;
  const { category } = await searchParams;

  const data = await getBrowseTasksData(workerId, category);

  return <BrowseTasksView {...data} />;
}
