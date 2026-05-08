import { PageShell } from "@/components/layout/page-shell";

export default function AdminSessionsPage() {
  return (
    <PageShell>
      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold">Session Management</h1>
        <p className="mt-2 text-muted-foreground">Use admin APIs to inspect and revoke active sessions.</p>
      </section>
    </PageShell>
  );
}
