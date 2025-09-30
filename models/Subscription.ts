import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    endpoint: { type: String, required: true, unique: true },
    expirationTime: { type: Number, required: false },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    // Optional: link subscription to a user/admin
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "admin" },
  },
  {
    timestamps: true,
    collection: "subscriptions",
  }
);

export default mongoose.models.Subscription ||
  mongoose.model("Subscription", SubscriptionSchema, "subscriptions");
