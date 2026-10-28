import { describe, expect, it } from "vitest";
import {
  isAdminRoute,
  isAuthRoute,
  isProtectedRoute,
  isPublicApiRoute,
  isPublicRoute,
} from "@/lib/route-list";

describe("route-list matchers", () => {
  it("detects auth routes exactly", () => {
    expect(isAuthRoute("/sign-in")).toBe(true);
    expect(isAuthRoute("/sign-in/extra")).toBe(false);
  });

  it("has no public pages by default", () => {
    expect(isPublicRoute("/")).toBe(false);
  });

  it("treats NextAuth and ping as public API", () => {
    expect(isPublicApiRoute("/api/auth/session")).toBe(true);
    expect(isPublicApiRoute("/api/auth/callback/credentials")).toBe(true);
    expect(isPublicApiRoute("/api/ping")).toBe(true);
    expect(isPublicApiRoute("/api/bot/files")).toBe(false);
  });

  it("detects admin routes by prefix", () => {
    expect(isAdminRoute("/dashboard/admin/sessions")).toBe(true);
    expect(isAdminRoute("/api/admin/users")).toBe(true);
    expect(isAdminRoute("/dashboard/users")).toBe(false);
  });

  it("protects everything except auth and public API routes", () => {
    expect(isProtectedRoute("/")).toBe(true);
    expect(isProtectedRoute("/bot/files")).toBe(true);
    expect(isProtectedRoute("/api/bot/files")).toBe(true);
    expect(isProtectedRoute("/sign-in")).toBe(false);
    expect(isProtectedRoute("/api/auth/session")).toBe(false);
    expect(isProtectedRoute("/api/ping")).toBe(false);
  });
});
