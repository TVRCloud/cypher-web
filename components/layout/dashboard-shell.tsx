"use client";

import { useState, useCallback, useEffect } from "react";
import { DashboardSidebar } from "./sidebar";
import { DashboardTopbar } from "./topbar";
import { PageGlow } from "./page-glow";
import { useAuthStore } from "@/lib/stores/auth-store";
import { RouteAccessGuard } from "@/components/auth/route-access-guard";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [bootstrapResolved, setBootstrapResolved] = useState(false);
  const hydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);
  const permissions = useAuthStore((state) => state.permissions);
  const setAuth = useAuthStore((state) => state.setAuth);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!hydrated) return;
    if (user && permissions.length > 0) return;

    let cancelled = false;

    void (async () => {
      try {
        // If store lost user on reload, recover from active session first.
        if (!user) {
          const meRes = await fetch("/api/auth/me", { method: "GET" });
          if (meRes.ok && !cancelled) {
            const meData = (await meRes.json()) as {
              user: { id: string; email: string; role: string };
              permissions?: string[];
            };
            setAuth({ user: meData.user, permissions: meData.permissions ?? [] });
            return;
          }
        }

        // If user exists but permissions are missing, hydrate only permissions.
        if (user && permissions.length === 0) {
          const res = await fetch("/api/auth/permissions", { method: "GET" });
          if (!res.ok || cancelled) return;
          const data = (await res.json()) as string[];
          if (!cancelled) setAuth({ user, permissions: data });
        }
      } catch {
        // non-blocking bootstrap fetch
      } finally {
        if (!cancelled) setBootstrapResolved(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, permissions.length, setAuth, user]);

  const authChecked = hydrated && (Boolean(user && permissions.length > 0) || bootstrapResolved);

  return (
    <>
      {authChecked ? <RouteAccessGuard /> : null}
      <PageGlow />

      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <DashboardSidebar open={open} onClose={close} />

      <div className="flex-1 ml-0 lg:ml-64 flex flex-col min-h-screen">
        <DashboardTopbar onMenuClick={toggle} />
        <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
      </div>
    </>
  );
}
