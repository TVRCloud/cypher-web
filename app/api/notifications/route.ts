import { requireAuth } from "@/lib/auth/guards";
import { connectPrimaryDb } from "@/lib/db/mongoose";
import { NotificationModel } from "@/lib/models/notification";
import { ok, fail } from "@/lib/http/response";
import { HttpError } from "@/lib/http/errors";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    await connectPrimaryDb();

    const { searchParams } = new URL(req.url);
    const page = Math.max(0, Number(searchParams.get("page") ?? "0"));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? "20")));

    const userId = new mongoose.Types.ObjectId(user.id);
    const query = { userId };

    const [data, total, unread] = await Promise.all([
      NotificationModel.find(query)
        .sort({ createdAt: -1 })
        .skip(page * limit)
        .limit(limit)
        .select("_id logType message meta read createdAt")
        .lean(),
      NotificationModel.countDocuments(query),
      NotificationModel.countDocuments({ ...query, read: false }),
    ]);

    return ok({ data, total, unread });
  } catch (err) {
    if (err instanceof HttpError) return fail(err.message, err.statusCode);
    return fail("Internal Server Error", 500);
  }
}
