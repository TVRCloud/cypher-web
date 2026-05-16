import { Schema, model, models } from "mongoose";

const notificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  logType: { type: String, required: true },
  message: { type: String, required: true },
  meta: { type: Schema.Types.Mixed, default: {} },
  read: { type: Boolean, default: false },
}, { timestamps: true, collection: "notifications" });

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

export const NotificationModel =
  models.Notification || model("Notification", notificationSchema);
