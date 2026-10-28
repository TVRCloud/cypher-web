import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import crypto from "node:crypto";
import { signInSchema } from "@/lib/validation/auth";
import { connectPrimaryDb } from "@/lib/db/mongoose";
import { comparePassword } from "@/lib/auth/password";
import { UserModel } from "@/lib/models/user";
import { RoleModel } from "@/lib/models/role";
import { SessionModel } from "@/lib/models/session";
import { ensureRbacSeededOnce, getPermissionKeysByRoleId } from "@/lib/services/rbac-service";
import { getIpFromHeaders, rateLimit, resetRateLimit } from "@/lib/auth/rate-limit";

const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

// Sign-in throttling (in-memory, per instance): per IP+email and per IP.
const SIGNIN_WINDOW_MS = 15 * 60 * 1000;
const SIGNIN_PER_ACCOUNT_LIMIT = 5;
const SIGNIN_PER_IP_LIMIT = 30;
const SIGNIN_PER_EMAIL_LIMIT = 20;

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE,
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const rawHeaders = (req as { headers?: Record<string, string | string[] | undefined> })?.headers ?? {};
        const headerValue = (name: string) => {
          const value = rawHeaders[name];
          return Array.isArray(value) ? value[0] : value;
        };
        const ipKey = getIpFromHeaders(headerValue);
        const accountKey = `signin:${ipKey}:${parsed.data.email}`;
        const ipLimitKey = `signin-ip:${ipKey}`;
        const emailKey = `signin-email:${parsed.data.email}`;
        // Every attempt counts against the caller's IP.
        if (!rateLimit(ipLimitKey, SIGNIN_PER_IP_LIMIT, SIGNIN_WINDOW_MS).allowed) {
          throw new Error("Too many attempts. Try again later.");
        }
        // Reserve a hit for the account and email buckets BEFORE any await, so concurrent requests
        // can't all pass a check-then-record gap. A successful sign-in refunds both (reset below).
        // rateLimit() also denies when its namespace can't take a new key, so this fails closed.
        const accountHit = rateLimit(accountKey, SIGNIN_PER_ACCOUNT_LIMIT, SIGNIN_WINDOW_MS);
        const emailHit = rateLimit(emailKey, SIGNIN_PER_EMAIL_LIMIT, SIGNIN_WINDOW_MS);
        if (!accountHit.allowed || !emailHit.allowed) {
          throw new Error("Too many attempts. Try again later.");
        }

        await connectPrimaryDb();

        const user = await UserModel.findOne({ email: parsed.data.email });
        if (!user) return null;

        const valid = await comparePassword(parsed.data.password, user.passwordHash);
        if (!valid) return null;
        resetRateLimit(accountKey);
        resetRateLimit(emailKey);

        // Make sure newly added permissions exist and are linked to roles (idempotent, once per process).
        await ensureRbacSeededOnce();

        const role = await RoleModel.findById(user.roleId);
        if (!role) return null;

        const permissions = await getPermissionKeysByRoleId(role._id.toString());

        // Track session for admin visibility
        const userAgent = headerValue("user-agent") ?? "unknown";
        const ip = ipKey;
        const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

        await SessionModel.create({
          userId: user._id,
          refreshTokenHash: crypto.randomUUID(),
          expiresAt,
          revoked: false,
          ip,
          userAgent,
          device: userAgent,
          lastUsedAt: new Date(),
        });

        return {
          id: user._id.toString(),
          email: user.email,
          role: role.key,
          tokenVersion: user.tokenVersion,
          permissions,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = (user as unknown as { role: string }).role;
        token.tokenVersion = (user as unknown as { tokenVersion: number }).tokenVersion;
        token.permissions = (user as unknown as { permissions: string[] }).permissions ?? [];
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userId;
      session.user.role = token.role;
      session.user.permissions = token.permissions ?? [];
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
};
