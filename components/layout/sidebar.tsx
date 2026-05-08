"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { menuList } from "@/lib/menu-list";
import { useAuthStore } from "@/lib/stores/auth-store";
import { canAccessPath } from "@/lib/auth/route-access";

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 px-5 py-3.5 rounded-xl text-sm font-medium transition-all duration-200",
        active
          ? "text-white shadow-lg shadow-blue-900/40"
          : [
              // inactive — light mode: dark navy text on white
              "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
              // inactive — dark mode: muted blue-gray on navy
              "dark:text-[#8f9bba] dark:hover:text-white dark:hover:bg-white/5",
            ].join(" ")
      )}
      style={
        active
          ? { background: "linear-gradient(97.89deg, #4776E6 0%, #8E54E9 100%)" }
          : undefined
      }
    >
      <Icon size={16} />
      {label}
    </Link>
  );
}

interface DashboardSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function DashboardSidebar({ open, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const permissions = useAuthStore((state) => state.permissions);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 z-40 w-64 flex flex-col overflow-y-auto",
        "transition-transform duration-300 ease-in-out",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
      style={{
        background: "var(--sidebar-bg)",
        backdropFilter: "var(--sidebar-backdrop)",
        borderRight: "1px solid var(--sidebar-border-color)",
      }}
    >
      {/* Logo + mobile close */}
      <div className="flex items-center gap-3 px-6 pt-8 pb-6">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0"
          style={{ background: "linear-gradient(97.89deg, #4776E6 0%, #8E54E9 100%)" }}
        >
          ◈
        </div>
        <span
          className="font-bold text-sm tracking-widest uppercase flex-1 min-w-0 truncate text-slate-800 dark:text-white"
        >
          Cypher Admin
        </span>
        <button
          onClick={onClose}
          className="lg:hidden shrink-0 transition-colors text-slate-400 hover:text-slate-700 dark:text-white/50 dark:hover:text-white"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* Divider */}
      <div
        className="mx-5 border-t"
        style={{ borderColor: "var(--sidebar-divider)" }}
      />

      {/* Nav */}
      <nav className="flex-1 px-4 py-5 space-y-4 overflow-y-auto">
        {menuList.map((group) => {
          const visibleMenus = group.menus.filter((menu) =>
            canAccessPath(menu.href, user?.role, permissions),
          );
          if (visibleMenus.length === 0) return null;

          return (
          <div key={group.groupLabel || "root"} className="space-y-1">
            {group.groupLabel ? (
              <p className="px-5 pb-2 text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-[#8f9bba]/60">
                {group.groupLabel}
              </p>
            ) : null}

            {visibleMenus.map(({ href, label, icon }) => (
              <NavItem
                key={href}
                href={href}
                label={label}
                icon={icon}
                active={
                  pathname === href ||
                  (href !== "/" && pathname.startsWith(href))
                }
                onClick={onClose}
              />
            ))}
          </div>
        )})}
      </nav>

      {/* Help card — gradient stays constant in both modes */}
      <div className="px-4 pb-6 shrink-0">
        <div
          className="rounded-2xl p-4"
          style={{ background: "linear-gradient(127.09deg, #4776E6 0%, #8E54E9 100%)" }}
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mb-3">
            <HelpCircle size={15} className="text-white" />
          </div>
          <p className="text-white font-bold text-sm">Need help?</p>
          <p className="text-white/70 text-xs mt-0.5 mb-3">Please check our docs</p>
          <button className="w-full bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold py-2 rounded-lg transition-colors uppercase tracking-widest border border-white/20">
            Documentation
          </button>
        </div>
      </div>
    </aside>
  );
}
