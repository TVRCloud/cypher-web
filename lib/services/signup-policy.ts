import { env } from "@/lib/config/env";
import { connectPrimaryDb } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/models/user";

/**
 * Public sign-up is allowed when ALLOW_PUBLIC_SIGNUP=true, or when no users
 * exist yet (first-user bootstrap).
 */
export async function isSignupAllowed(): Promise<boolean> {
  if (env.ALLOW_PUBLIC_SIGNUP) return true;
  await connectPrimaryDb();
  const anyUser = await UserModel.exists({});
  return !anyUser;
}
