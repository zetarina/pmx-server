// src/models/Role.ts
import mongoose, { Document, Model, Schema } from "mongoose";
import { PermissionsList } from "../types/permissions";

export interface Role {
  _id?: mongoose.Types.ObjectId;
  name: string;
  permissions: PermissionsObject;
  isShipper?: boolean;
  isDriver?: boolean;
}

export type PermissionsObject = Record<PermissionsList, boolean>;

export const roleModelName: string = "Roles";

const initialPermissions: PermissionsObject = Object.values(
  PermissionsList
).reduce((acc, permission) => {
  acc[permission] = false;
  return acc;
}, {} as PermissionsObject);

const roleSchema = new Schema(
  {
    name: { type: String, required: true },
    permissions: { type: Object, default: initialPermissions },
    isShipper: { type: Boolean, default: false },
    isDriver: { type: Boolean, default: false },
  },
  {
    collection: roleModelName,
  }
);

export const RoleModel: Model<Role> =
  mongoose.models[roleModelName] ||
  mongoose.model<Role>(roleModelName, roleSchema);

export function getRoleModel(): Model<Role> {
  return RoleModel;
}
