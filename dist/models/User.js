"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserModel = exports.userModelName = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const Role_1 = require("./Role");
const Country_1 = require("./Country");
const City_1 = require("./City");
const BasicContactInfo_1 = require("./BasicContactInfo");
exports.userModelName = "Users";
const userSchema = new mongoose_1.Schema(Object.assign(Object.assign({ username: { type: String, required: true, unique: true }, email: { type: String, required: true, unique: true } }, BasicContactInfo_1.BasicContactInfoSchemaDefinition), { hashedPassword: { type: String, required: true }, salt: { type: String, required: true }, roleId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: Role_1.roleModelName,
        required: true,
    }, resetPasswordToken: String, resetPasswordExpires: Date, devices: [
        {
            deviceId: { type: String, required: true },
            refreshToken: { type: String, required: true },
            browser: { type: String, required: true },
            deviceName: { type: String, required: true },
            lastUsed: { type: Date, required: true, default: Date.now },
            tokenVersion: { type: Number, default: 0 },
        },
    ] }), {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: exports.userModelName,
});
userSchema.virtual("role", {
    ref: Role_1.roleModelName,
    localField: "roleId",
    foreignField: "_id",
    justOne: true,
});
userSchema.virtual("city", {
    ref: City_1.cityModelName,
    localField: "cityId",
    foreignField: "_id",
    justOne: true,
});
userSchema.virtual("country", {
    ref: Country_1.countryModelName,
    localField: "countryId",
    foreignField: "_id",
    justOne: true,
});
const UserModel = mongoose_1.default.models[exports.userModelName] ||
    mongoose_1.default.model(exports.userModelName, userSchema);
function getUserModel() {
    return UserModel;
}
exports.getUserModel = getUserModel;
