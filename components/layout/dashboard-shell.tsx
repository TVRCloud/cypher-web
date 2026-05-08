"use client";

import { useState, useCallback } from "react";
import { DashboardSidebar } from "./sidebar";
import { DashboardTopbar } from "./topbar";
import { PageGlow } from "./page-glow";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
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
