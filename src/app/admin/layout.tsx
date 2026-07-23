import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/shared/sidebar";
import { Topbar } from "@/components/shared/topbar";
import { MobileNav } from "@/components/shared/mobile-nav";
import { adminNav } from "@/components/shared/nav-items";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar items={adminNav} label="Admin panel" />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar
          title="Admin"
          username={session.user.name ?? "Admin"}
          email={session.user.email ?? ""}
          navItems={adminNav}
        />
        <main className="flex-1 px-5 py-6 pb-24 md:pb-6">{children}</main>
      </div>
      <MobileNav items={adminNav} />
    </div>
  );
}
