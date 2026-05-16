import { Schema, model, models } from "mongoose";

const notificationPrefSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  subscribedTypes: { type: [String], default: ["ADMIN_ACTION", "GROUP_ACTION", "BOT_ACTION", "USER_ACTION", "FEEDBACK"] },
}, { timestamps: true, collection: "notification_prefs" });

export const NotificationPrefModel =
  models.NotificationPref || model("NotificationPref", notificationPrefSchema);
