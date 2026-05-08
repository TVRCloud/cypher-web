import { Schema, type InferSchemaType, type Model } from "mongoose";
import { connectBotDb } from "@/lib/db/bot-mongoose";

const botGroupSchema = new Schema(
  {
    chat_id: { type: Number, required: true, index: true },
    title: { type: String, default: null },
    status: { type: String, default: "pending", index: true },
    member_count: { type: Number, default: null },
    description: { type: String, default: null },
    last_stats_check: { type: Date, default: null },
    added_by: { type: Number, default: null },
    added_by_name: { type: String, default: null },
    added_at: { type: Date, default: null },
    alert_msg_id: { type: Number, default: null },
  },
  { collection: "groups", strict: false, versionKey: false },
);

export type BotGroupDocument = InferSchemaType<typeof botGroupSchema> & { _id: string };

export async function getBotGroupModel(): Promise<Model<BotGroupDocument>> {
  const conn = await connectBotDb();
  return (conn.models.BotGroup as Model<BotGroupDocument>) || conn.model<BotGroupDocument>("BotGroup", botGroupSchema);
}
