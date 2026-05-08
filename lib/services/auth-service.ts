import crypto from "node:crypto";
import { Types } from "mongoose";
import { DEFAULT_ROLE_KEY } from "@/lib/constants/auth";
import { HttpError } from "@/lib/http/errors";
import { clearAccessCookie, clearRefreshCookie, setAccessCookie, setRefreshCookie } from "@/lib/auth/cookies";
import { comparePassword, hashPassword } from "@/lib/auth/password";
import {
  createAccessToken,
  createRefreshToken,
  hashToken,
  verifyRefreshToken,
  type AccessTokenPayload,
} from "@/lib/auth/tokens";
import { connectPrimaryDb } from "@/lib/db/mongoose";
import { RefreshTokenModel } from "@/lib/models/refresh-token";
import { RoleModel } from "@/lib/models/role";
import { SessionModel } from "@/lib/models/session";
import { UserModel } from "@/lib/models/user";
import { ensureRbacSeeded } from "@/lib/services/rbac-service";

type ClientMeta = { ip: string; userAgent: string; device: string };

function buildAccessPayload(input: { userId: string; email: string; role: string; tokenVersion: number }): AccessTokenPayload {
  return {
    userId: input.userId,
    email: input.email,
    role: input.role,
    tokenVersion: input.tokenVersion,
  };
}

export async function signUp(payload: { email: string; password: string }, meta: ClientMeta) {
  await connectPrimaryDb();
  await ensureRbacSeeded();

  const existing = await UserModel.findOne({ email: payload.email });
  if (existing) throw new HttpError(409, "Email already registered");

  const role = await RoleModel.findOne({ key: DEFAULT_ROLE_KEY });
  if (!role) throw new HttpError(500, "Default role not found");

  const passwordHash = await hashPassword(payload.password);
  const user = await UserModel.create({ email: payload.email, passwordHash, roleId: role._id });

  return issueSession(user._id.toString(), user.email, role.key, user.tokenVersion, meta);
}

export async function signIn(payload: { email: string; password: string }, meta: ClientMeta) {
  await connectPrimaryDb();

  const user = await UserModel.findOne({ email: payload.email });
  if (!user) throw new HttpError(401, "Invalid credentials");

  const matched = await comparePassword(payload.password, user.passwordHash);
  if (!matched) throw new HttpError(401, "Invalid credentials");

  const role = await RoleModel.findById(user.roleId);
  if (!role) throw new HttpError(401, "Role not found");

  return issueSession(user._id.toString(), user.email, role.key, user.tokenVersion, meta);
}

export async function refreshSession(rawRefreshToken: string, meta: ClientMeta) {
  await connectPrimaryDb();

  const payload = verifyRefreshToken(rawRefreshToken);
  const tokenHash = hashToken(rawRefreshToken);

  const existingToken = await RefreshTokenModel.findOne({ tokenHash, revoked: false });
  if (!existingToken) throw new HttpError(401, "Refresh token revoked or missing");

  if (existingToken.expiresAt.getTime() <= Date.now()) throw new HttpError(401, "Refresh token expired");

  const user = await UserModel.findById(payload.userId);
  if (!user || user.tokenVersion !== payload.tokenVersion) throw new HttpError(401, "Session invalid");

  const role = await RoleModel.findById(user.roleId);
  if (!role) throw new HttpError(401, "Role not found");

  existingToken.revoked = true;

  const accessPayload = buildAccessPayload({
    userId: user._id.toString(),
    email: user.email,
    role: role.key,
    tokenVersion: user.tokenVersion,
  });

  const { token: rotatedRefreshToken, tokenHash: rotatedHash, expiresAt } = createRefreshToken({
    userId: user._id.toString(),
    tokenVersion: user.tokenVersion,
    tokenId: crypto.randomUUID(),
  });

  existingToken.replacedByTokenHash = rotatedHash;
  await existingToken.save();

  await RefreshTokenModel.create({
    userId: user._id,
    tokenHash: rotatedHash,
    expiresAt,
    revoked: false,
  });

  await SessionModel.updateOne(
    { refreshTokenHash: tokenHash },
    { $set: { revoked: true, lastUsedAt: new Date() } },
  );

  await SessionModel.create({
    userId: user._id,
    refreshTokenHash: rotatedHash,
    expiresAt,
    revoked: false,
    lastUsedAt: new Date(),
    ip: meta.ip,
    userAgent: meta.userAgent,
    device: meta.device,
  });

  await setRefreshCookie(rotatedRefreshToken, expiresAt);
  await setAccessCookie(createAccessToken(accessPayload));

  return {
    accessToken: createAccessToken(accessPayload),
    refreshToken: rotatedRefreshToken,
    user: { id: user._id.toString(), email: user.email, role: role.key },
  };
}

export async function revokeSessionById(sessionId: string) {
  await connectPrimaryDb();

  const session = await SessionModel.findById(sessionId);
  if (!session) throw new HttpError(404, "Session not found");

  session.revoked = true;
  await session.save();

  await RefreshTokenModel.updateOne({ tokenHash: session.refreshTokenHash }, { $set: { revoked: true } });
  return session;
}

export async function logoutAllUserSessions(userId: string) {
  await connectPrimaryDb();

  await SessionModel.updateMany({ userId: new Types.ObjectId(userId), revoked: false }, { $set: { revoked: true } });
  await RefreshTokenModel.updateMany({ userId: new Types.ObjectId(userId), revoked: false }, { $set: { revoked: true } });
  await UserModel.updateOne({ _id: userId }, { $inc: { tokenVersion: 1 } });

  await clearRefreshCookie();
  await clearAccessCookie();
}

async function issueSession(userId: string, email: string, role: string, tokenVersion: number, meta: ClientMeta) {
  const accessPayload = buildAccessPayload({ userId, email, role, tokenVersion });

  const { token: refreshToken, tokenHash, expiresAt } = createRefreshToken({
    userId,
    tokenVersion,
    tokenId: crypto.randomUUID(),
  });

  await RefreshTokenModel.create({ userId, tokenHash, expiresAt, revoked: false });
  await SessionModel.create({
    userId,
    refreshTokenHash: tokenHash,
    expiresAt,
    revoked: false,
    ip: meta.ip,
    userAgent: meta.userAgent,
    device: meta.device,
    lastUsedAt: new Date(),
  });

  await setRefreshCookie(refreshToken, expiresAt);
  await setAccessCookie(createAccessToken(accessPayload));

  return {
    accessToken: createAccessToken(accessPayload),
    refreshToken,
    user: { id: userId, email, role },
  };
}
