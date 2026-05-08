import { PageShell } from "@/components/layout/page-shell";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DashboardPage() {
  return (
    <PageShell>
      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <ThemeToggle />
        </div>
        <p className="mt-2 text-muted-foreground">Production-ready auth and RBAC foundation is active.</p>
      </section>
    </PageShell>
  );
}
