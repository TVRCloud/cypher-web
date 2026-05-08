import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function BotLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardShell>{children}</DashboardShell>
    </div>
  );
}
