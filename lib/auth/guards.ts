import { cookies, headers } from "next/headers";
import { HttpError } from "@/lib/http/errors";
import { verifyAccessToken } from "@/lib/auth/tokens";
import { connectPrimaryDb } from "@/lib/db/mongoose";
import { getPermissionKeysByRoleId } from "@/lib/services/rbac-service";
import { RoleModel } from "@/lib/models/role";

export async function requireAuth() {
  const headerList = await headers();
  const cookieStore = await cookies();
  const authHeader = headerList.get("authorization");
  const bearerToken = authHeader?.replace("Bearer ", "");
  const cookieToken = cookieStore.get("access_token")?.value;
  const token = bearerToken ?? cookieToken;

  if (!token) throw new HttpError(401, "Missing access token");
  return verifyAccessToken(token);
}

export async function requireRole(allowedRoles: string[]) {
  const auth = await requireAuth();
  if (!allowedRoles.includes(auth.role)) throw new HttpError(403, "Forbidden by role");
  return auth;
}

export async function requirePermission(permissionKey: string) {
  const auth = await requireAuth();
  await connectPrimaryDb();

  const role = await RoleModel.findOne({ key: auth.role });
  if (!role) throw new HttpError(403, "Role not found");

  const permissions = await getPermissionKeysByRoleId(role._id.toString());
  if (!permissions.includes(permissionKey)) throw new HttpError(403, "Forbidden by permission");

  return auth;
}
