import { requireAuth } from "@/lib/auth/guards";
import { connectPrimaryDb } from "@/lib/db/mongoose";
import { NotificationPrefModel } from "@/lib/models/notification-pref";
import { ok, fail } from "@/lib/http/response";
import { HttpError } from "@/lib/http/errors";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireAuth();
    await connectPrimaryDb();

    const userId = new mongoose.Types.ObjectId(user.id);
    const pref = await NotificationPrefModel.findOne({ userId }).lean() as
      | { subscribedTypes?: string[] } | null;

    return ok({ subscribedTypes: pref?.subscribedTypes ?? ["error"] });
  } catch (err) {
    if (err instanceof HttpError) return fail(err.message, err.statusCode);
    return fail("Internal Server Error", 500);
  }
}

export async function PUT(req: Request) {
  try {
    const user = await requireAuth();
    await connectPrimaryDb();

    const body = (await req.json()) as { subscribedTypes?: unknown };
    if (!Array.isArray(body.subscribedTypes)) {
      return fail("subscribedTypes must be an array", 400);
    }
    const subscribedTypes = body.subscribedTypes.filter(
      (t): t is string => typeof t === "string"
    );

    const userId = new mongoose.Types.ObjectId(user.id);
    const pref = await NotificationPrefModel.findOneAndUpdate(
      { userId },
      { $set: { subscribedTypes } },
      { upsert: true, new: true }
    ).lean() as { subscribedTypes?: string[] } | null;

    return ok({ subscribedTypes: pref?.subscribedTypes ?? subscribedTypes });
  } catch (err) {
    if (err instanceof HttpError) return fail(err.message, err.statusCode);
    return fail("Internal Server Error", 500);
  }
}
