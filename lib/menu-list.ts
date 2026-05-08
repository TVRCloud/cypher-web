import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Terminal,
  Megaphone,
  BarChart3,
  TrendingUp,
  Webhook,
  ScrollText,
  Settings,
  Fingerprint,
  BotMessageSquare,
} from "lucide-react";
import type { ComponentType } from "react";

export type MenuItem = {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
};

export type MenuGroup = {
  groupLabel: string;
  menus: MenuItem[];
};

export const menuList: MenuGroup[] = [
  {
    groupLabel: "",
    menus: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    groupLabel: "Bot",
    menus: [
      { href: "/dashboard/messages",   label: "Messages",   icon: MessageSquare },
      { href: "/dashboard/users",      label: "Users",      icon: Users },
      { href: "/dashboard/commands",   label: "Commands",   icon: Terminal },
      { href: "/dashboard/broadcasts", label: "Broadcasts", icon: Megaphone },
      { href: "/dashboard/bot",        label: "Bot Config", icon: BotMessageSquare },
    ],
  },
  {
    groupLabel: "Analytics",
    menus: [
      { href: "/dashboard/analytics",        label: "Overview",   icon: BarChart3 },
      { href: "/dashboard/analytics/growth", label: "User Growth", icon: TrendingUp },
    ],
  },
  {
    groupLabel: "System",
    menus: [
      { href: "/dashboard/webhooks", label: "Webhooks", icon: Webhook },
      { href: "/dashboard/logs",     label: "Logs",     icon: ScrollText },
    ],
  },
  {
    groupLabel: "Settings",
    menus: [
      { href: "/dashboard/settings",        label: "Bot Settings", icon: Settings },
      { href: "/dashboard/admin/sessions",  label: "Sessions",     icon: Fingerprint },
    ],
  },
];
