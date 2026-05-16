import { Schema, model, models } from "mongoose";

const pushSubscriptionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    enabled: { type: Boolean, default: true },
    endpoint: { type: String, required: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
  },
  { timestamps: true, collection: "push_subscriptions" },
);

export const PushSubscriptionModel =
  models.PushSubscription || model("PushSubscription", pushSubscriptionSchema);
