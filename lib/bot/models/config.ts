import { Schema, type InferSchemaType, type Model } from "mongoose";
import { connectBotDb } from "@/lib/db/bot-mongoose";

const botConfigSchema = new Schema(
  {
    _id: { type: String, required: true },
    value: { type: Schema.Types.Mixed, default: null },
  },
  { collection: "config", strict: false, versionKey: false },
);

export type BotConfigDocument = InferSchemaType<typeof botConfigSchema> & { _id: string };

export async function getBotConfigModel(): Promise<Model<BotConfigDocument>> {
  const conn = await connectBotDb();
  return (conn.models.BotConfig as Model<BotConfigDocument>) || conn.model<BotConfigDocument>("BotConfig", botConfigSchema);
}
