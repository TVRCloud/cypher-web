import { requireAuth } from "@/lib/auth/guards";
import { connectPrimaryDb } from "@/lib/db/mongoose";
import { NotificationModel } from "@/lib/models/notification";
import { ok, fail } from "@/lib/http/response";
import { HttpError } from "@/lib/http/errors";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const user = await requireAuth();
    await connectPrimaryDb();

    const userId = new mongoose.Types.ObjectId(user.id);
    await NotificationModel.updateMany({ userId, read: false }, { $set: { read: true } });

    return ok({ ok: true });
  } catch (err) {
    if (err instanceof HttpError) return fail(err.message, err.statusCode);
    return fail("Internal Server Error", 500);
  }
}
