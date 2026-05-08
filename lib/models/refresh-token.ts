import { Schema, model, models, type InferSchemaType } from "mongoose";

const refreshTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    revoked: { type: Boolean, default: false },
    replacedByTokenHash: { type: String, default: null },
  },
  { timestamps: true, collection: "refresh_tokens" },
);

refreshTokenSchema.index({ tokenHash: 1 }, { unique: true });

export type RefreshTokenDocument = InferSchemaType<typeof refreshTokenSchema> & { _id: string };
export const RefreshTokenModel = models.RefreshToken || model("RefreshToken", refreshTokenSchema);
