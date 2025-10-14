import {
  Schema,
  model,
  models,
  type Model,
  type InferSchemaType,
} from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["user", "admin", "owner"],
      default: "user",
    },
    username: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export type UserType = InferSchemaType<typeof UserSchema> & { _id: string };

export const User: Model<UserType> =
  models.User || model<UserType>("User", UserSchema);
