import { Schema, model, models, type InferSchemaType } from "mongoose";

const sessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    refreshTokenHash: { type: String, required: true, index: true },
    device: { type: String, default: "unknown" },
    ip: { type: String, default: "unknown" },
    userAgent: { type: String, default: "unknown" },
    createdAt: { type: Date, default: Date.now },
    lastUsedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    revoked: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, collection: "sessions" },
);

export type SessionDocument = InferSchemaType<typeof sessionSchema> & { _id: string };
export const SessionModel = models.Session || model("Session", sessionSchema);
