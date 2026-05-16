import { requirePermission } from "@/lib/auth/guards";
import { fail, ok } from "@/lib/http/response";
import { HttpError } from "@/lib/http/errors";
import { connectPrimaryDb } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/models/user";

export async function GET() {
  try {
    await requirePermission("users.read");
    await connectPrimaryDb();

    const users = await UserModel.find(
      { isActive: true },
      { passwordHash: 0, tokenVersion: 1, createdAt: 1, updatedAt: 1, email: 1, roleId: 1, isActive: 1 },
    )
      .populate({ path: "roleId", select: "key name", options: { lean: true } })
      .sort({ createdAt: -1 })
      .lean();
    return ok(users);
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode, error.details);
    return fail("Unable to fetch users", 400);
  }
}
