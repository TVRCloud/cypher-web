import { Schema, model, models, type InferSchemaType } from "mongoose";

// Primary-DB record of every admin action issued from the web panel.
const auditLogSchema = new Schema(
  {
    actorId: { type: String, required: true, index: true },
    actorEmail: { type: String, default: null },
    action: { type: String, required: true, index: true }, // e.g. "group.approve"
    targetType: { type: String, required: true }, // "group" | "file"
    targetId: { type: String, required: true },
    commandId: { type: String, default: null },
    meta: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "audit_logs" },
);

auditLogSchema.index({ createdAt: -1 });

export type AuditLogDocument = InferSchemaType<typeof auditLogSchema> & { _id: string };
export const AuditLogModel = models.AuditLog || model("AuditLog", auditLogSchema);
