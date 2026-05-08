import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { signInSchema } from "@/lib/validation/auth";
import { connectPrimaryDb } from "@/lib/db/mongoose";
import { comparePassword } from "@/lib/auth/password";
import { UserModel } from "@/lib/models/user";
import { RoleModel } from "@/lib/models/role";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) return null;

        await connectPrimaryDb();
        const user = await UserModel.findOne({ email: parsed.data.email });
        if (!user) return null;

        const valid = await comparePassword(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        const role = await RoleModel.findById(user.roleId);
        return {
          id: user._id.toString(),
          email: user.email,
          role: role?.key ?? "USER",
          tokenVersion: user.tokenVersion,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
