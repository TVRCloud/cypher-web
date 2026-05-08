import { Schema, type InferSchemaType, type Model } from "mongoose";
import { connectBotDb } from "@/lib/db/bot-mongoose";

const botSettingSchema = new Schema(
  {
    _id: { type: String, required: true },
    value: { type: Schema.Types.Mixed, default: null },
  },
  { collection: "settings", strict: false, versionKey: false },
);

export type BotSettingDocument = InferSchemaType<typeof botSettingSchema> & { _id: string };

export async function getBotSettingModel(): Promise<Model<BotSettingDocument>> {
  const conn = await connectBotDb();
  return (conn.models.BotSetting as Model<BotSettingDocument>) || conn.model<BotSettingDocument>("BotSetting", botSettingSchema);
}
