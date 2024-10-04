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
exports.UserRepository = void 0;
const User_1 = require("../models/User");
const RoleRepository_1 = require("./RoleRepository");
const permissions_1 = require("../types/permissions");
class UserRepository {
    constructor() {
        this.userModel = (0, User_1.getUserModel)();
        this.roleRepository = new RoleRepository_1.RoleRepository();
    }
    getUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userModel.findOne({ email }).exec();
        });
    }
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userModel
                .findById(id)
                .select("-hashedPassword -salt")
                .populate("role")
                .populate("city")
                .populate("country")
                .exec();
        });
    }
    getUserByObjectId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userModel
                .findById(id)
                .select("-hashedPassword -salt")
                .populate("role")
                .populate("city")
                .populate("country")
                .exec();
        });
    }
    createUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const newUser = yield this.userModel.create(user);
            return this.getUserById(newUser._id.toString());
        });
    }
    updateUser(id, update) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userModel
                .findByIdAndUpdate(id, update, { new: true })
                .select("-hashedPassword -salt")
                .exec();
        });
    }
    updateProfile(id, update) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, phoneNumber, address, zip, cityId, countryId } = update;
            return this.userModel
                .findByIdAndUpdate(id, { username, phoneNumber, address, zip, cityId, countryId }, { new: true })
                .select("-hashedPassword -salt")
                .exec();
        });
    }
    updateUserPassword(id, hashedPassword, salt) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userModel
                .findByIdAndUpdate(id, { hashedPassword, salt }, { new: true })
                .select("-hashedPassword -salt")
                .exec();
        });
    }
    deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.userModel.findByIdAndDelete(id).exec();
        });
    }
    getAllUsers(page, limit, query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const searchQuery = {
                    username: new RegExp(query, "i"),
                };
                const usersQuery = this.userModel
                    .find(searchQuery)
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .select("-hashedPassword -salt")
                    .populate("role")
                    .populate("city")
                    .populate("country")
                    .exec();
                const totalQuery = this.userModel.countDocuments(searchQuery).exec();
                const [users, total] = yield Promise.all([usersQuery, totalQuery]);
                return { users, total };
            }
            catch (error) {
                console.error("Error fetching users:", error);
                throw new Error("Failed to fetch users");
            }
        });
    }
    getShippers(page, limit, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const roles = yield this.roleRepository.getRolesWithPermission(permissions_1.PermissionsList.getShipperInventory);
            const roleIds = roles.map((role) => role._id);
            const usersQuery = this.userModel
                .find({
                username: new RegExp(query, "i"),
                roleId: { $in: roleIds },
            })
                .skip((page - 1) * limit)
                .limit(limit)
                .select("-hashedPassword -salt")
                .populate("role")
                .populate("city")
                .populate("country")
                .exec();
            const totalQuery = this.userModel
                .countDocuments({
                username: new RegExp(query, "i"),
                roleId: { $in: roleIds },
            })
                .exec();
            const [users, total] = yield Promise.all([usersQuery, totalQuery]);
            return { users, total };
        });
    }
    findUserByResetToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userModel
                .findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() },
            })
                .exec();
        });
    }
}
exports.UserRepository = UserRepository;
