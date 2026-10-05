import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { requireAdmin } from "@/lib/auth";

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();
  return (
    <div className="lg:flex">
      <AdminSidebar email={user.email ?? ""} />
      <main id="main" className="min-w-0 flex-1 px-5 py-10 sm:px-8 lg:px-14 lg:py-14">
        {children}
      </main>
    </div>
  );
}
