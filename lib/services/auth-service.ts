import { Types } from "mongoose";
import { DEFAULT_ROLE_KEY } from "@/lib/constants/auth";
import { HttpError } from "@/lib/http/errors";
import { comparePassword, hashPassword } from "@/lib/auth/password";
import { connectPrimaryDb } from "@/lib/db/mongoose";
import { RefreshTokenModel } from "@/lib/models/refresh-token";
import { RoleModel } from "@/lib/models/role";
import { SessionModel } from "@/lib/models/session";
import { UserModel } from "@/lib/models/user";
import { ensureRbacSeeded } from "@/lib/services/rbac-service";

export async function signUp(payload: { email: string; password: string }) {
  await connectPrimaryDb();
  await ensureRbacSeeded();

  const existing = await UserModel.findOne({ email: payload.email });
  if (existing) throw new HttpError(409, "Email already registered");

  const role = await RoleModel.findOne({ key: DEFAULT_ROLE_KEY });
  if (!role) throw new HttpError(500, "Default role not found");

  const passwordHash = await hashPassword(payload.password);
  const user = await UserModel.create({ email: payload.email, passwordHash, roleId: role._id });

  return { id: user._id.toString(), email: user.email };
}

export async function revokeSessionById(sessionId: string) {
  await connectPrimaryDb();

  const session = await SessionModel.findById(sessionId);
  if (!session) throw new HttpError(404, "Session not found");

  session.revoked = true;
  await session.save();

  await RefreshTokenModel.updateOne(
    { tokenHash: session.refreshTokenHash },
    { $set: { revoked: true } }
  );
  return session;
}

export async function logoutAllUserSessions(userId: string) {
  await connectPrimaryDb();

  await SessionModel.updateMany(
    { userId: new Types.ObjectId(userId), revoked: false },
    { $set: { revoked: true } }
  );
  await RefreshTokenModel.updateMany(
    { userId: new Types.ObjectId(userId), revoked: false },
    { $set: { revoked: true } }
  );
  await UserModel.updateOne({ _id: userId }, { $inc: { tokenVersion: 1 } });
}

// Kept for backwards-compat with any existing sign-in checks
export async function verifyCredentials(email: string, password: string) {
  await connectPrimaryDb();
  const user = await UserModel.findOne({ email });
  if (!user) return null;
  const valid = await comparePassword(password, user.passwordHash);
  return valid ? user : null;
}
