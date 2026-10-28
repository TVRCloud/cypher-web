import { Schema, type InferSchemaType, type Model } from "mongoose";
import { connectBotDb } from "@/lib/db/bot-mongoose";

export const COMMAND_STATUSES = ["pending", "processing", "done", "failed"] as const;

// Queue collection consumed by the bot (cypher-v2 modules/admin/admin_commands.py).
const adminCommandSchema = new Schema(
  {
    type: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    status: { type: String, enum: COMMAND_STATUSES, default: "pending", index: true },
    requested_by: { type: String, required: true },
    created_at: { type: Date, default: () => new Date() },
    started_at: { type: Date, default: null },
    finished_at: { type: Date, default: null },
    result: { type: Schema.Types.Mixed, default: null },
    error: { type: String, default: null },
  },
  { collection: "admin_commands", strict: false, versionKey: false },
);

adminCommandSchema.index({ status: 1, created_at: 1 });

export type AdminCommandDocument = InferSchemaType<typeof adminCommandSchema>;

export async function getAdminCommandModel(): Promise<Model<AdminCommandDocument>> {
  const conn = await connectBotDb();
  return (
    (conn.models.AdminCommand as Model<AdminCommandDocument>) ||
    conn.model<AdminCommandDocument>("AdminCommand", adminCommandSchema)
  );
}
