import {
  LayoutDashboard,
  Users,
  ScrollText,
  Settings,
  Fingerprint,
  Database,
  MessagesSquare,
  FileText,
  Cog,
  SlidersHorizontal,
  Bell,
} from "lucide-react";
import type { ComponentType } from "react";

export type MenuItem = {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  permission?: string;
};

export type MenuGroup = {
  groupLabel: string;
  menus: MenuItem[];
};

export const menuList: MenuGroup[] = [
  {
    groupLabel: "",
    menus: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    groupLabel: "Bot",
    menus: [
      { href: "/bot/files",      label: "Files",      icon: Database, permission: "analytics.read" },
      { href: "/bot/users",      label: "Users",      icon: Users, permission: "analytics.read" },
      { href: "/bot/groups",     label: "Groups",     icon: MessagesSquare, permission: "analytics.read" },
      { href: "/bot/feedbacks",  label: "Feedbacks",  icon: FileText, permission: "analytics.read" },
      { href: "/bot/config",     label: "Config",     icon: Cog, permission: "analytics.read" },
      { href: "/bot/settings",   label: "Settings",   icon: SlidersHorizontal, permission: "analytics.read" },
    ],
  },
  {
    groupLabel: "System",
    menus: [
      { href: "/dashboard/logs", label: "Logs", icon: ScrollText, permission: "analytics.read" },
    ],
  },
  {
    groupLabel: "Settings",
    menus: [
      { href: "/dashboard/settings",       label: "Site Settings",  icon: Settings },
      { href: "/dashboard/notifications",  label: "Notifications",  icon: Bell },
      { href: "/dashboard/admin/sessions", label: "Sessions",       icon: Fingerprint, permission: "sessions.read" },
    ],
  },
];
