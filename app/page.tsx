import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-white to-amber-100 px-4">
      <div className="w-full max-w-2xl rounded-2xl border bg-white/70 p-8 backdrop-blur">
        <h1 className="text-3xl font-bold tracking-tight">Admin Platform Auth Core</h1>
        <p className="mt-3 text-muted-foreground">
          JWT access/refresh flow, refresh rotation, RBAC permissions, and session governance are ready.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white" href="/sign-in">
            Sign In
          </Link>
          <Link className="rounded-md border px-4 py-2 text-sm font-medium" href="/sign-up">
            Sign Up
          </Link>
          <Link className="rounded-md border px-4 py-2 text-sm font-medium" href="/dashboard">
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
