import { Schema, type InferSchemaType, type Model } from "mongoose";
import { connectBotDb } from "@/lib/db/bot-mongoose";

const botLogSchema = new Schema(
  {
    type: { type: String, required: true, index: true },
    user_id: { type: Number, default: null, index: true },
    meta: { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, required: true, index: true },
    date: { type: String, default: null },
    time: { type: String, default: null },
  },
  { collection: "logs", strict: false, versionKey: false },
);

export type BotLogDocument = InferSchemaType<typeof botLogSchema> & { _id: string };

export async function getBotLogModel(): Promise<Model<BotLogDocument>> {
  const conn = await connectBotDb();
  return (conn.models.BotLog as Model<BotLogDocument>) || conn.model<BotLogDocument>("BotLog", botLogSchema);
}
