"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
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
        "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-white/5"
      )}
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
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 bg-primary">
          ◈
        </div>
        <span className="font-semibold text-sm flex-1 min-w-0 truncate text-foreground">
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
              <p className="px-4 pb-1.5 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/50">
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

      <div className="pb-4" />
    </aside>
  );
}
