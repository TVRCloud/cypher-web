import { requireAuth } from "@/lib/auth/guards";
import { connectPrimaryDb } from "@/lib/db/mongoose";
import { PushSubscriptionModel } from "@/lib/models/push-subscription";
import { HttpError } from "@/lib/http/errors";
import { ok, fail } from "@/lib/http/response";
import mongoose from "mongoose";

export async function GET() {
  try {
    const user = await requireAuth();
    await connectPrimaryDb();
    const doc = await PushSubscriptionModel.findOne({
      userId: new mongoose.Types.ObjectId(user.id),
    }).lean();
    return ok({ subscribed: !!doc, enabled: doc ? (doc as { enabled?: boolean }).enabled !== false : false });
  } catch (err) {
    if (err instanceof HttpError) return fail(err.message, err.statusCode);
    return fail("Internal error", 500);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = (await req.json()) as {
      endpoint: string;
      keys: { p256dh: string; auth: string };
    };

    if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      return fail("Invalid subscription payload", 400);
    }

    await connectPrimaryDb();
    await PushSubscriptionModel.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(user.id) },
      {
        userId: new mongoose.Types.ObjectId(user.id),
        enabled: true,
        endpoint: body.endpoint,
        keys: body.keys,
      },
      { upsert: true, new: true },
    );
    return ok({ ok: true });
  } catch (err) {
    if (err instanceof HttpError) return fail(err.message, err.statusCode);
    return fail("Internal error", 500);
  }
}

export async function DELETE() {
  try {
    const user = await requireAuth();
    await connectPrimaryDb();
    await PushSubscriptionModel.deleteOne({
      userId: new mongoose.Types.ObjectId(user.id),
    });
    return ok({ ok: true });
  } catch (err) {
    if (err instanceof HttpError) return fail(err.message, err.statusCode);
    return fail("Internal error", 500);
  }
}
