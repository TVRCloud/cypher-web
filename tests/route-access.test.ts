import { describe, expect, it } from "vitest";
import { canAccessPath, defaultAuthorizedPath, getFirstAllowedPath } from "@/lib/auth/route-access";

describe("canAccessPath", () => {
  it("allows the dashboard root for anyone signed in", () => {
    expect(canAccessPath("/", "OPERATOR", [])).toBe(true);
  });

  it("allows paths without a rule", () => {
    expect(canAccessPath("/something-unknown", null, [])).toBe(true);
  });

  it("requires analytics.read for /bot pages, including nested", () => {
    expect(canAccessPath("/bot/files", "ADMIN", [])).toBe(false);
    expect(canAccessPath("/bot/files", "ADMIN", ["analytics.read"])).toBe(true);
    expect(canAccessPath("/bot", "ADMIN", ["analytics.read"])).toBe(true);
  });

  it("does not match prefix on partial segment", () => {
    expect(canAccessPath("/botany", "ADMIN", [])).toBe(true);
  });

  it("requires both role and permission for users page", () => {
    expect(canAccessPath("/dashboard/users", "ADMIN", ["users.read"])).toBe(true);
    expect(canAccessPath("/dashboard/users", "ADMIN", [])).toBe(false);
    expect(canAccessPath("/dashboard/users", "VIEWER", ["users.read"])).toBe(false);
    expect(canAccessPath("/dashboard/users", null, ["users.read"])).toBe(false);
  });

  it("gates admin sessions by role and sessions.read", () => {
    expect(canAccessPath("/dashboard/admin/sessions", "MODERATOR", ["sessions.read"])).toBe(true);
    expect(canAccessPath("/dashboard/admin/sessions", "MODERATOR", [])).toBe(false);
  });

  it("applies the most specific rule over the broad /dashboard prefix", () => {
    expect(canAccessPath("/dashboard", "USER", [])).toBe(true);
    expect(canAccessPath("/dashboard/queue", "ADMIN", [])).toBe(false);
    expect(canAccessPath("/dashboard/queue", "ADMIN", ["bot.commands.read"])).toBe(true);
    expect(canAccessPath("/dashboard/audit", "ADMIN", [])).toBe(false);
    expect(canAccessPath("/dashboard/audit/anything", "ADMIN", ["audit.read"])).toBe(true);
    expect(canAccessPath("/dashboard/logs/123", "ADMIN", [])).toBe(false);
    expect(canAccessPath("/dashboard/settings", "USER", [])).toBe(true);
  });
});

describe("getFirstAllowedPath", () => {
  it("prefers the dashboard root", () => {
    expect(getFirstAllowedPath("ADMIN", [])).toBe("/");
  });

  it("falls back to the default path", () => {
    expect(defaultAuthorizedPath).toBe("/");
    expect(getFirstAllowedPath(null, [])).toBe(defaultAuthorizedPath);
  });
});
