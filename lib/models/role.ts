import { Schema, model, models, type InferSchemaType } from "mongoose";
import { ROLE_KEYS } from "@/lib/constants/auth";

const roleSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, enum: ROLE_KEYS },
    name: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true, collection: "roles" },
);

export type RoleDocument = InferSchemaType<typeof roleSchema> & { _id: string };
export const RoleModel = models.Role || model("Role", roleSchema);
