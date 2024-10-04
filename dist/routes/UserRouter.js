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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const permissions_1 = require("../types/permissions");
const UserRepository_1 = require("../repositories/UserRepository");
const RoleRepository_1 = require("../repositories/RoleRepository");
const CityRepository_1 = require("../repositories/CityRepository");
const CountryRepository_1 = require("../repositories/CountryRepository");
const Events_1 = require("../models/Events");
const app_1 = require("../app");
const error_1 = require("../error");
const crypto_utils_1 = require("../utils/crypto-utils");
const router = express_1.default.Router();
const userRepository = new UserRepository_1.UserRepository();
const roleRepository = new RoleRepository_1.RoleRepository();
const cityRepository = new CityRepository_1.CityRepository();
const countryRepository = new CountryRepository_1.CountryRepository();
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, query = "" } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const { users, total } = yield userRepository.getAllUsers(pageNumber, limitNumber, query);
        res.status(200).json({ users, total });
    }
    catch (error) {
        (0, error_1.handleError)(res, error);
    }
}));
router.post("/", (0, auth_1.authorize)(permissions_1.PermissionsList.CreateUser), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { username, email, password, roleId, cityId, countryId } = _a, basicContactInfo = __rest(_a, ["username", "email", "password", "roleId", "cityId", "countryId"]);
        const existingUser = yield userRepository.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }
        const { salt, hash: hashedPassword } = yield (0, crypto_utils_1.hashPassword)(password);
        const userRole = yield roleRepository.getRoleById(roleId);
        if (!userRole || !userRole._id) {
            return res.status(400).json({ error: "Role not found" });
        }
        const city = yield cityRepository.getCityById(cityId);
        if (!city || !city._id) {
            return res.status(400).json({ error: "City not found" });
        }
        const country = yield countryRepository.getCountryById(countryId);
        if (!country || !country._id) {
            return res.status(400).json({ error: "Country not found" });
        }
        const newUser = yield userRepository.createUser(Object.assign({ username,
            email,
            hashedPassword,
            salt, roleId: userRole._id, cityId: city._id, countryId: country._id }, basicContactInfo));
        if (newUser && newUser._id) {
            res
                .status(201)
                .json({ message: "User created successfully", user: newUser });
            app_1.io.emit(Events_1.UserEvent.Created, newUser);
        }
        else {
            res.status(500).json({ error: "Error creating user" });
        }
    }
    catch (error) {
        (0, error_1.handleError)(res, error);
    }
}));
router.get("/shippers", (0, auth_1.authorize)(permissions_1.PermissionsList.ReadUser), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, query = "" } = req.query;
        const { users, total } = yield userRepository.getShippers(Number(page), Number(limit), query.toString());
        res.status(200).json({ users, total });
    }
    catch (error) {
        (0, error_1.handleError)(res, error);
    }
}));
router.put("/:userId", (0, auth_1.authorize)(permissions_1.PermissionsList.UpdateUser), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const userUpdate = req.body;
        if (userUpdate.password) {
            const { salt, hash: hashedPassword } = yield (0, crypto_utils_1.hashPassword)(userUpdate.password);
            userUpdate.hashedPassword = hashedPassword;
            userUpdate.salt = salt;
            delete userUpdate.password;
        }
        const updatedUser = yield userRepository.updateUser(userId, userUpdate);
        res.status(200).json(updatedUser);
        app_1.io.emit(Events_1.UserEvent.Updated, updatedUser);
    }
    catch (error) {
        (0, error_1.handleError)(res, error);
    }
}));
router.put("/:userId/password", (0, auth_1.authorize)(permissions_1.PermissionsList.UpdateUser), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const { newPassword } = req.body;
        const { salt, hash: hashedPassword } = yield (0, crypto_utils_1.hashPassword)(newPassword);
        const updatedUser = yield userRepository.updateUserPassword(userId, hashedPassword, salt);
        res.status(200).json({ message: "Password updated successfully" });
        app_1.io.emit(Events_1.UserEvent.Updated, updatedUser);
    }
    catch (error) {
        (0, error_1.handleError)(res, error);
    }
}));
router.delete("/:userId", (0, auth_1.authorize)(permissions_1.PermissionsList.DeleteUser), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        yield userRepository.deleteUser(userId);
        res.status(200).json({ message: "User deleted successfully" });
        app_1.io.emit(Events_1.UserEvent.Deleted, userId);
    }
    catch (error) {
        (0, error_1.handleError)(res, error);
    }
}));
router.get("/:userId", (0, auth_1.authorize)(permissions_1.PermissionsList.ReadUser), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const user = yield userRepository.getUserById(userId);
        res.status(200).json(user);
    }
    catch (error) {
        (0, error_1.handleError)(res, error);
    }
}));
exports.default = router;
