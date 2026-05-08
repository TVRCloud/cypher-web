import { Schema, type InferSchemaType, type Model } from "mongoose";
import { connectBotDb } from "@/lib/db/bot-mongoose";

const botFileSchema = new Schema(
  {
    _id: { type: String, required: true },
    file_link: { type: String, required: true },
    file_name: { type: String, required: true, index: "text" },
    file_size: { type: Number, required: true },
    file_type: { type: String, default: null },
    created_at: { type: Date, default: null },
    language: { type: String, default: null },
    quality: { type: String, default: null },
    year: { type: String, default: null },
  },
  { collection: "files", strict: false, versionKey: false },
);

export type BotFileDocument = InferSchemaType<typeof botFileSchema> & { _id: string };

export async function getBotFileModel(): Promise<Model<BotFileDocument>> {
  const conn = await connectBotDb();
  return (conn.models.BotFile as Model<BotFileDocument>) || conn.model<BotFileDocument>("BotFile", botFileSchema);
}
