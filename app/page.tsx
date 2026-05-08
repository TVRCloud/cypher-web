import { DashboardPageContent } from "@/components/dashboard/dashboard-page";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function HomePage() {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardShell>
        <DashboardPageContent />
      </DashboardShell>
    </div>
  );
}
