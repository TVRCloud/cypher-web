import { Schema, model, models, type Model, type InferSchemaType, Types } from "mongoose"

const RefreshTokenSchema = new Schema(
  {
    jti: { type: String, required: true, unique: true, index: true },
    user: { type: Types.ObjectId, ref: "User", required: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: { type: Date, default: null },
    replacedBy: { type: String, default: null },
  },
  { timestamps: true },
)

export type RefreshTokenType = InferSchemaType<typeof RefreshTokenSchema> & { _id: string }

export const RefreshToken: Model<RefreshTokenType> =
  models.RefreshToken || model<RefreshTokenType>("RefreshToken", RefreshTokenSchema)
