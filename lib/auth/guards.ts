import { getServerSession } from "next-auth";
import { authOptions } from "./nextauth";
import { HttpError } from "@/lib/http/errors";

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new HttpError(401, "Unauthorized");
  return session.user;
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) throw new HttpError(403, "Forbidden by role");
  return user;
}

export async function requirePermission(permissionKey: string) {
  const user = await requireAuth();
  if (!user.permissions.includes(permissionKey)) throw new HttpError(403, "Forbidden by permission");
  return user;
}
