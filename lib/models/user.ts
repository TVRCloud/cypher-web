import { Schema, model, models, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    roleId: { type: Schema.Types.ObjectId, ref: "Role", required: true },
    tokenVersion: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "users" },
);

export type UserDocument = InferSchemaType<typeof userSchema> & { _id: string };
export const UserModel = models.User || model("User", userSchema);
