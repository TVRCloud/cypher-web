import { beforeEach, describe, expect, it, vi } from "vitest";

const getServerSession = vi.fn();

vi.mock("next-auth", () => ({ getServerSession: (...args: unknown[]) => getServerSession(...args) }));
vi.mock("@/lib/auth/nextauth", () => ({ authOptions: {} }));

import { requireAuth, requirePermission, requireRole } from "@/lib/auth/guards";
import { HttpError } from "@/lib/http/errors";

function sessionFor(user: { role: string; permissions?: string[] } | null) {
  getServerSession.mockResolvedValue(user ? { user } : null);
}

async function statusOf(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (err) {
    expect(err).toBeInstanceOf(HttpError);
    return (err as HttpError).statusCode;
  }
  return null;
}

beforeEach(() => getServerSession.mockReset());

describe("requireAuth", () => {
  it("throws 401 without a session", async () => {
    sessionFor(null);
    expect(await statusOf(requireAuth())).toBe(401);
  });

  it("throws 401 when session has no user", async () => {
    getServerSession.mockResolvedValue({});
    expect(await statusOf(requireAuth())).toBe(401);
  });

  it("returns the session user", async () => {
    sessionFor({ role: "ADMIN" });
    await expect(requireAuth()).resolves.toMatchObject({ role: "ADMIN" });
  });
});

describe("requireRole", () => {
  it("allows a listed role", async () => {
    sessionFor({ role: "ADMIN" });
    await expect(requireRole(["SUPER_ADMIN", "ADMIN"])).resolves.toMatchObject({ role: "ADMIN" });
  });

  it("throws 403 for an unlisted role", async () => {
    sessionFor({ role: "OPERATOR" });
    expect(await statusOf(requireRole(["SUPER_ADMIN"]))).toBe(403);
  });

  it("throws 401 when unauthenticated", async () => {
    sessionFor(null);
    expect(await statusOf(requireRole(["ADMIN"]))).toBe(401);
  });
});

describe("requirePermission", () => {
  it("allows a user holding the permission", async () => {
    sessionFor({ role: "OPERATOR", permissions: ["analytics.read"] });
    await expect(requirePermission("analytics.read")).resolves.toBeTruthy();
  });

  it("throws 403 when permission is missing", async () => {
    sessionFor({ role: "OPERATOR", permissions: ["users.read"] });
    expect(await statusOf(requirePermission("analytics.read"))).toBe(403);
  });

  it("throws 403 when permissions are undefined", async () => {
    sessionFor({ role: "OPERATOR" });
    expect(await statusOf(requirePermission("analytics.read"))).toBe(403);
  });

  it("throws 401 when unauthenticated", async () => {
    sessionFor(null);
    expect(await statusOf(requirePermission("analytics.read"))).toBe(401);
  });
});
