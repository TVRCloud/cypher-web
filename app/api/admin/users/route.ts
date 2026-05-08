import { requirePermission } from "@/lib/auth/guards";
import { fail, ok } from "@/lib/http/response";
import { HttpError } from "@/lib/http/errors";
import { connectPrimaryDb } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/models/user";

export async function GET() {
  try {
    await requirePermission("users.read");
    await connectPrimaryDb();

    const users = await UserModel.find({ isActive: true }, { passwordHash: 0 }).sort({ createdAt: -1 }).lean();
    return ok(users);
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode);
    return fail("Unable to fetch users", 400);
  }
}
