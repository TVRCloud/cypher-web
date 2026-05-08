import { Schema, type InferSchemaType, type Model } from "mongoose";
import { connectBotDb } from "@/lib/db/bot-mongoose";

const botFeedbackSchema = new Schema(
  {
    user_id: { type: Number, required: true, index: true },
    username: { type: String, default: "N/A" },
    feedback: { type: String, required: true },
    ticket_id: { type: String, required: true, index: true },
    status: { type: String, default: "Pending", index: true },
    type: { type: String, default: "feedback", index: true },
    date: { type: String, default: null },
    time: { type: String, default: null },
    timestamp: { type: Date, default: null, index: true },
  },
  { collection: "feedbacks", strict: false, versionKey: false },
);

export type BotFeedbackDocument = InferSchemaType<typeof botFeedbackSchema> & { _id: string };

export async function getBotFeedbackModel(): Promise<Model<BotFeedbackDocument>> {
  const conn = await connectBotDb();
  return (conn.models.BotFeedback as Model<BotFeedbackDocument>) || conn.model<BotFeedbackDocument>("BotFeedback", botFeedbackSchema);
}
