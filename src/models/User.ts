import mongoose, { Model, Schema } from "mongoose";
import { Role, roleModelName } from "./Role";
import { Country, countryModelName } from "./Country";
import { City, cityModelName } from "./City";
import {
  BasicContactInfo,
  BasicContactInfoSchemaDefinition,
} from "./BasicContactInfo";

export interface DeviceInfo {
  deviceId: string;
  refreshToken: string;
  browser: string;
  deviceName: string;
  lastUsed: Date;
  tokenVersion: number;
}

export interface User extends BasicContactInfo {
  _id?: mongoose.Types.ObjectId;
  username: string;
  email: string;
  hashedPassword: string;
  salt: string;
  roleId: mongoose.Types.ObjectId;
  role?: Role;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  devices: DeviceInfo[];
}

export const userModelName = "Users";

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    ...BasicContactInfoSchemaDefinition,
    hashedPassword: { type: String, required: true },
    salt: { type: String, required: true },
    roleId: {
      type: Schema.Types.ObjectId,
      ref: roleModelName,
      required: true,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    devices: [
      {
        deviceId: { type: String, required: true },
        refreshToken: { type: String, required: true },
        browser: { type: String, required: true },
        deviceName: { type: String, required: true },
        lastUsed: { type: Date, required: true, default: Date.now },
        tokenVersion: { type: Number, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: userModelName,
  }
);

userSchema.virtual("role", {
  ref: roleModelName,
  localField: "roleId",
  foreignField: "_id",
  justOne: true,
});

userSchema.virtual("city", {
  ref: cityModelName,
  localField: "cityId",
  foreignField: "_id",
  justOne: true,
});

userSchema.virtual("country", {
  ref: countryModelName,
  localField: "countryId",
  foreignField: "_id",
  justOne: true,
});

const UserModel: Model<User> =
  mongoose.models[userModelName] ||
  mongoose.model<User>(userModelName, userSchema);

export function getUserModel(): Model<User> {
  return UserModel;
}
