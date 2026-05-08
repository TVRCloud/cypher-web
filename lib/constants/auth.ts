export const DEFAULT_ROLE_KEY = "USER";

export const ROLE_KEYS = ["SUPER_ADMIN", "ADMIN", "MODERATOR", "OPERATOR", "USER"] as const;
export type RoleKey = (typeof ROLE_KEYS)[number];

export const PERMISSIONS = [
  "users.read",
  "users.create",
  "users.update",
  "users.delete",
  "sessions.read",
  "sessions.revoke",
  "analytics.read",
  "roles.read",
  "roles.update",
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number];
