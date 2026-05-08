import { PERMISSIONS, ROLE_KEYS, type RoleKey } from "@/lib/constants/auth";
import { connectPrimaryDb } from "@/lib/db/mongoose";
import { PermissionModel } from "@/lib/models/permission";
import { RolePermissionModel } from "@/lib/models/role-permission";
import { RoleModel } from "@/lib/models/role";

const rolePermissionSeed: Record<RoleKey, string[]> = {
  SUPER_ADMIN: [...PERMISSIONS],
  ADMIN: ["users.read", "users.create", "users.update", "sessions.read", "sessions.revoke", "analytics.read", "roles.read"],
  MODERATOR: ["users.read", "users.update", "sessions.read"],
  OPERATOR: ["users.read", "sessions.read"],
  USER: [],
};

export async function ensureRbacSeeded() {
  await connectPrimaryDb();

  for (const key of ROLE_KEYS) {
    await RoleModel.updateOne(
      { key },
      {
        $setOnInsert: {
          key,
          name: key.replaceAll("_", " "),
          description: `${key} role`,
        },
      },
      { upsert: true },
    );
  }

  for (const key of PERMISSIONS) {
    await PermissionModel.updateOne(
      { key },
      {
        $setOnInsert: {
          key,
          description: `Permission for ${key}`,
        },
      },
      { upsert: true },
    );
  }

  const roles = await RoleModel.find({ key: { $in: ROLE_KEYS } }).lean();
  const permissions = await PermissionModel.find({ key: { $in: PERMISSIONS } }).lean();
  const permissionByKey = new Map(permissions.map((permission) => [permission.key, permission._id]));

  for (const role of roles) {
    const allowed = rolePermissionSeed[role.key as RoleKey] ?? [];
    for (const permissionKey of allowed) {
      const permissionId = permissionByKey.get(permissionKey);
      if (!permissionId) continue;
      await RolePermissionModel.updateOne(
        { roleId: role._id, permissionId },
        { $setOnInsert: { roleId: role._id, permissionId } },
        { upsert: true },
      );
    }
  }
}

export async function getPermissionKeysByRoleId(roleId: string) {
  await connectPrimaryDb();

  const links = await RolePermissionModel.find({ roleId }).lean();
  if (!links.length) return [];

  const permissionIds = links.map((link) => link.permissionId);
  const permissions = await PermissionModel.find({ _id: { $in: permissionIds } }).lean();

  return permissions.map((permission) => permission.key);
}
