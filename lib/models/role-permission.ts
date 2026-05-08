import { Schema, model, models, type InferSchemaType } from "mongoose";

const rolePermissionSchema = new Schema(
  {
    roleId: { type: Schema.Types.ObjectId, ref: "Role", required: true, index: true },
    permissionId: { type: Schema.Types.ObjectId, ref: "Permission", required: true, index: true },
  },
  { timestamps: true, collection: "role_permissions" },
);

rolePermissionSchema.index({ roleId: 1, permissionId: 1 }, { unique: true });

export type RolePermissionDocument = InferSchemaType<typeof rolePermissionSchema> & { _id: string };
export const RolePermissionModel = models.RolePermission || model("RolePermission", rolePermissionSchema);
