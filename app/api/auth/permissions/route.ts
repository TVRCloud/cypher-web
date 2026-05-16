import { requireAuth } from "@/lib/auth/guards";
import { connectPrimaryDb } from "@/lib/db/mongoose";
import { RoleModel } from "@/lib/models/role";
import { getPermissionKeysByRoleId } from "@/lib/services/rbac-service";
import { fail, ok } from "@/lib/http/response";
import { HttpError } from "@/lib/http/errors";

export async function GET() {
  try {
    const auth = await requireAuth();
    await connectPrimaryDb();

    const role = await RoleModel.findOne({ key: auth.role });
    if (!role) return fail("Role not found", 404);

    const permissions = await getPermissionKeysByRoleId(role._id.toString());
    return ok(permissions);
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode, error.details);
    return fail("Unable to fetch permissions", 400);
  }
}
