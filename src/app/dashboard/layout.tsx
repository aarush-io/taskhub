import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/shared/sidebar";
import { Topbar } from "@/components/shared/topbar";
import { MobileNav } from "@/components/shared/mobile-nav";
import { workerNav } from "@/components/shared/nav-items";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar items={workerNav} label="Worker workspace" />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar
          title="Dashboard"
          username={session.user.name ?? "Worker"}
          email={session.user.email ?? ""}
          navItems={workerNav}
        />
        <main className="flex-1 px-5 py-6 pb-24 md:pb-6">{children}</main>
      </div>
      <MobileNav items={workerNav} />
    </div>
  );
}
