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
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export type UserType = InferSchemaType<typeof UserSchema> & { _id: string };

export const User: Model<UserType> =
  models.User || model<UserType>("User", UserSchema);
