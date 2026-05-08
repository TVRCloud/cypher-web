"use client";

import { Bell, LogOut, Menu, Search, Settings, UserCircle2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { menuList } from "@/lib/menu-list";

interface DashboardTopbarProps {
  onMenuClick: () => void;
}

function resolvePageLabel(pathname: string) {
  for (const group of menuList) {
    for (const menu of group.menus) {
      if (pathname === menu.href || (menu.href !== "/dashboard" && pathname.startsWith(menu.href))) {
        return menu.label;
      }
    }
  }

  return "Dashboard";
}

export function DashboardTopbar({ onMenuClick }: DashboardTopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const page = resolvePageLabel(pathname);

  const onLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/sign-in");
      router.refresh();
    }
  };

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border/40 bg-background/60 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <p className="text-xs text-muted-foreground">
            Pages / <span className="text-foreground font-medium">{page}</span>
          </p>
          <h1 className="text-xl font-bold text-foreground leading-tight">{page}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Type here..." className="pl-8 h-9 w-44 bg-muted/50 border-border/50 text-sm" />
        </div>

        <ThemeToggle />

        <button className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Settings">
          <Settings size={17} />
        </button>

        <button className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Notifications">
          <Bell size={17} />
        </button>

        <details className="relative">
          <summary className="list-none cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
            <span className="sr-only">Open profile menu</span>
            <UserCircle2 size={24} />
          </summary>
          <div className="absolute right-0 mt-2 w-44 rounded-md border bg-popover p-1 shadow-md">
            <button
              onClick={onLogout}
              className="w-full rounded-sm px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 inline-flex items-center gap-2"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </details>
      </div>
    </header>
  );
}
