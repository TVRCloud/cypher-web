import type { RoleKey } from "@/lib/constants/auth";

type RouteRule = {
  pattern: string;
  match: "exact" | "prefix";
  roles?: RoleKey[];
  permissions?: string[];
};

const routeRules: RouteRule[] = [
  { pattern: "/", match: "exact" },
  { pattern: "/dashboard", match: "prefix" },

  // Bot module pages
  { pattern: "/bot", match: "prefix", permissions: ["analytics.read"] },

  // Admin tools
  {
    pattern: "/dashboard/admin/sessions",
    match: "prefix",
    roles: ["SUPER_ADMIN", "ADMIN", "MODERATOR", "OPERATOR"],
    permissions: ["sessions.read"],
  },

  // Users page
  {
    pattern: "/dashboard/users",
    match: "prefix",
    roles: ["SUPER_ADMIN", "ADMIN", "MODERATOR", "OPERATOR"],
    permissions: ["users.read"],
  },

  // Analytics/system pages (read-focused)
  { pattern: "/dashboard/messages", match: "prefix", permissions: ["analytics.read"] },
  { pattern: "/dashboard/logs", match: "prefix", permissions: ["analytics.read"] },
  { pattern: "/dashboard/analytics", match: "prefix", permissions: ["analytics.read"] },
  { pattern: "/dashboard/webhooks", match: "prefix", permissions: ["analytics.read"] },
  { pattern: "/dashboard/settings", match: "prefix", permissions: ["analytics.read"] },
];

export const defaultAuthorizedPath = "/";

function matches(pathname: string, rule: RouteRule) {
  if (rule.match === "exact") return pathname === rule.pattern;
  return pathname === rule.pattern || pathname.startsWith(`${rule.pattern}/`);
}

function findRule(pathname: string) {
  return routeRules.find((rule) => matches(pathname, rule));
}

export function canAccessPath(pathname: string, role?: string | null, permissions: string[] = []) {
  const rule = findRule(pathname);
  if (!rule) return true;

  if (rule.roles?.length) {
    const roleAllowed = !!role && rule.roles.includes(role as RoleKey);
    if (!roleAllowed) return false;
  }

  if (rule.permissions?.length) {
    const permissionAllowed = rule.permissions.every((key) => permissions.includes(key));
    if (!permissionAllowed) return false;
  }

  return true;
}

export function getFirstAllowedPath(role?: string | null, permissions: string[] = []) {
  const priority = [
    "/",
    "/dashboard/users",
    "/dashboard/admin/sessions",
    "/bot/files",
  ];

  const first = priority.find((path) => canAccessPath(path, role, permissions));
  return first ?? defaultAuthorizedPath;
}
