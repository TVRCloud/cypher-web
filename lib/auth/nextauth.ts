import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import crypto from "node:crypto";
import { signInSchema } from "@/lib/validation/auth";
import { connectPrimaryDb } from "@/lib/db/mongoose";
import { comparePassword } from "@/lib/auth/password";
import { UserModel } from "@/lib/models/user";
import { RoleModel } from "@/lib/models/role";
import { SessionModel } from "@/lib/models/session";
import { getPermissionKeysByRoleId } from "@/lib/services/rbac-service";

const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

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

        await connectPrimaryDb();

        const user = await UserModel.findOne({ email: parsed.data.email });
        if (!user) return null;

        const valid = await comparePassword(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        const role = await RoleModel.findById(user.roleId);
        if (!role) return null;

        const permissions = await getPermissionKeysByRoleId(role._id.toString());

        // Track session for admin visibility
        const headers = (req as { headers?: Record<string, string> })?.headers ?? {};
        const userAgent = headers["user-agent"] ?? "unknown";
        const ip = (headers["x-forwarded-for"] ?? "unknown").split(",")[0].trim();
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
