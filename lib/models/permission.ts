import { Schema, model, models, type InferSchemaType } from "mongoose";

const permissionSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
  },
  { timestamps: true, collection: "permissions" },
);

export type PermissionDocument = InferSchemaType<typeof permissionSchema> & { _id: string };
export const PermissionModel = models.Permission || model("Permission", permissionSchema);
