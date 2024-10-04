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
exports.getRoleModel = exports.RoleModel = exports.roleModelName = void 0;
// src/models/Role.ts
const mongoose_1 = __importStar(require("mongoose"));
const permissions_1 = require("../types/permissions");
exports.roleModelName = "Roles";
const initialPermissions = Object.values(permissions_1.PermissionsList).reduce((acc, permission) => {
    acc[permission] = false;
    return acc;
}, {});
const roleSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    permissions: { type: Object, default: initialPermissions },
    isShipper: { type: Boolean, default: false },
    isDriver: { type: Boolean, default: false },
}, {
    collection: exports.roleModelName,
});
exports.RoleModel = mongoose_1.default.models[exports.roleModelName] ||
    mongoose_1.default.model(exports.roleModelName, roleSchema);
function getRoleModel() {
    return exports.RoleModel;
}
exports.getRoleModel = getRoleModel;
