"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleRepository = void 0;
const Role_1 = require("../models/Role");
class RoleRepository {
    constructor() {
        this.roleModel = (0, Role_1.getRoleModel)();
    }
    getAllRoles(page, limit, query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rolesQuery = this.roleModel
                    .find({ name: new RegExp(query, "i") })
                    .skip((page - 1) * limit)
                    .limit(limit);
                const totalQuery = this.roleModel.countDocuments({
                    name: new RegExp(query, "i"),
                });
                const [roles, total] = yield Promise.all([rolesQuery, totalQuery]);
                return { roles: roles.map((role) => role.toObject()), total };
            }
            catch (error) {
                throw new Error(`Error getting roles: ${error.message}`);
            }
        });
    }
    getRoleById(roleId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const role = yield this.roleModel.findById(roleId);
                return role ? role.toObject() : null;
            }
            catch (error) {
                throw new Error(`Error getting role by ID: ${error.message}`);
            }
        });
    }
    getRoleByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const role = yield this.roleModel.findOne({ name });
                return role ? role.toObject() : null;
            }
            catch (error) {
                throw new Error(`Error getting role by name: ${error.message}`);
            }
        });
    }
    createRole(role) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newRole = yield this.roleModel.create(role);
                return this.getRoleById(newRole._id.toString());
            }
            catch (error) {
                throw new Error(`Error creating role: ${error.message}`);
            }
        });
    }
    updateRole(roleId, roleUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedRole = yield this.roleModel.findByIdAndUpdate(roleId, roleUpdate, { new: true });
                return updatedRole ? updatedRole.toObject() : null;
            }
            catch (error) {
                throw new Error(`Error updating role: ${error.message}`);
            }
        });
    }
    deleteRole(roleId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.roleModel.findByIdAndDelete(roleId);
                return true;
            }
            catch (error) {
                throw new Error(`Error deleting role: ${error.message}`);
            }
        });
    }
    getRolesWithPermission(permission) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const roles = yield this.roleModel.find({
                    [`permissions.${permission}`]: true,
                });
                return roles.map((role) => role.toObject());
            }
            catch (error) {
                throw new Error(`Error getting roles with permission: ${error.message}`);
            }
        });
    }
}
exports.RoleRepository = RoleRepository;
