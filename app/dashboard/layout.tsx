import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PushProvider } from "@/components/providers/push-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PushProvider>
      <div className="flex min-h-screen bg-background">
        <DashboardShell>{children}</DashboardShell>
      </div>
    </PushProvider>
  );
}
