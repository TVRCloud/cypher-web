import { Schema, type InferSchemaType, type Model } from "mongoose";
import { connectBotDb } from "@/lib/db/bot-mongoose";

const botUserSchema = new Schema(
  {
    _id: { type: Number, required: true },
    first_name: { type: String, default: null },
    last_name: { type: String, default: null },
    username: { type: String, default: null },
    phone: { type: String, default: null },
    lang_code: { type: String, default: null },
    is_premium: { type: Boolean, default: false },
    photo_id: { type: Schema.Types.Mixed, default: null },
    dc_id: { type: Number, default: 0 },
    date: { type: String, default: null },
    time: { type: String, default: null },
    permission: { type: Boolean, default: true },
  },
  { collection: "users", strict: false, versionKey: false },
);

export type BotUserDocument = InferSchemaType<typeof botUserSchema> & { _id: number };

export async function getBotUserModel(): Promise<Model<BotUserDocument>> {
  const conn = await connectBotDb();
  return (conn.models.BotUser as Model<BotUserDocument>) || conn.model<BotUserDocument>("BotUser", botUserSchema);
}
