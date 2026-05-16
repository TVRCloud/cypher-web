import { fail, ok } from "@/lib/http/response";
import { HttpError } from "@/lib/http/errors";
import { requirePermission } from "@/lib/auth/guards";
import { getBotUserModel } from "@/lib/bot/models/user";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("analytics.read");
    const { id } = await params;
    const userId = Number(id);
    if (isNaN(userId)) return fail("Invalid user ID", 400);

    const UserModel = await getBotUserModel();
    const [result] = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $limit: 1 },
    ]);

    if (!result) return fail("User not found", 404);
    return ok(result);
  } catch (error) {
    if (error instanceof HttpError) return fail(error.message, error.statusCode, error.details);
    return fail("Unable to fetch user", 400);
  }
}
