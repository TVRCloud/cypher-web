import { Schema, type InferSchemaType, type Model } from "mongoose";
import { connectBotDb } from "@/lib/db/bot-mongoose";

const botDownloadSchema = new Schema(
  {
    uniq_id: { type: String, required: true },
    file_name: { type: String, required: true },
    user_id: { type: Number, required: true },
    file_size: { type: Number, default: 0 },
    timestamp: { type: Date, default: null },
  },
  { collection: "downloads", strict: false, versionKey: false },
);

export type BotDownloadDocument = InferSchemaType<typeof botDownloadSchema>;

export async function getBotDownloadModel(): Promise<Model<BotDownloadDocument>> {
  const conn = await connectBotDb();
  return (
    (conn.models.BotDownload as Model<BotDownloadDocument>) ||
    conn.model<BotDownloadDocument>("BotDownload", botDownloadSchema)
  );
}
