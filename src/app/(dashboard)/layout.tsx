import { Sidebar } from "@/components/layout/sidebar";
import { SessionProvider } from "@/components/providers/session-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-gray-50 p-8">{children}</main>
      </div>
    </SessionProvider>
  );
}
