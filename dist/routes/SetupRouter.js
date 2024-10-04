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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const crypto_utils_1 = require("../utils/crypto-utils");
const UserRepository_1 = require("../repositories/UserRepository");
const RoleRepository_1 = require("../repositories/RoleRepository");
const CityRepository_1 = require("../repositories/CityRepository");
const CountryRepository_1 = require("../repositories/CountryRepository");
const permissions_1 = require("../types/permissions");
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
const router = express_1.default.Router();
const userRepository = new UserRepository_1.UserRepository();
const roleRepository = new RoleRepository_1.RoleRepository();
const cityRepository = new CityRepository_1.CityRepository();
const countryRepository = new CountryRepository_1.CountryRepository();
const predefinedUserId = process.env.PREDEFINED_USER_ID;
if (!predefinedUserId) {
    throw new Error("PREDEFINED_USER_ID is not set in the environment variables");
}
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingUser = yield userRepository.getUserById(predefinedUserId);
        if (existingUser) {
            return res.status(200).json({ setupCompleted: true, existingUser });
        }
        return res.status(200).json({ setupCompleted: false });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { countryCode, countryName, cityName, superAdminUsername, superAdminEmail, superAdminPassword, systemUsername, systemEmail, systemPassword, } = req.body;
    try {
        let country = yield countryRepository.getCountryByCode(countryCode);
        if (!country) {
            country = yield countryRepository.createCountry({
                code: countryCode,
                name: countryName,
            });
        }
        if (!country || !country._id) {
            throw new Error("Failed to create or retrieve country");
        }
        let city = yield cityRepository.getCityByName(cityName);
        if (!city) {
            city = yield cityRepository.createCity({
                name: cityName,
                countryId: country._id,
            });
        }
        if (!city || !city._id) {
            throw new Error("Failed to create or retrieve city");
        }
        const superAdminPermissions = Object.values(permissions_1.PermissionsList).reduce((acc, permission) => {
            acc[permission] = true;
            return acc;
        }, {});
        let superAdminRole = yield roleRepository.getRoleByName("Super Admin");
        if (!superAdminRole) {
            superAdminRole = yield roleRepository.createRole({
                name: "Super Admin",
                permissions: superAdminPermissions,
                isShipper: false,
                isDriver: false,
            });
        }
        if (!superAdminRole || !superAdminRole._id) {
            throw new Error("Failed to create or retrieve Super Admin role");
        }
        const { salt: superAdminSalt, hash: superAdminHashedPassword } = yield (0, crypto_utils_1.hashPassword)(superAdminPassword);
        const { salt: systemSalt, hash: systemHashedPassword } = yield (0, crypto_utils_1.hashPassword)(systemPassword);
        const superAdminUser = yield userRepository.createUser({
            _id: new mongoose_1.default.Types.ObjectId(predefinedUserId),
            username: superAdminUsername,
            email: superAdminEmail,
            hashedPassword: superAdminHashedPassword,
            salt: superAdminSalt,
            roleId: superAdminRole._id,
            cityId: city._id,
            countryId: country._id,
            phoneNumber: "",
            address: "",
            zip: "",
            devices: [],
        });
        if (!superAdminUser || !superAdminUser._id) {
            throw new Error("Failed to create Super Admin user");
        }
        const systemUser = yield userRepository.createUser({
            username: systemUsername,
            email: systemEmail,
            hashedPassword: systemHashedPassword,
            salt: systemSalt,
            roleId: superAdminRole._id,
            cityId: city._id,
            countryId: country._id,
            phoneNumber: "",
            address: "",
            zip: "",
            devices: [],
        });
        if (!systemUser || !systemUser._id) {
            throw new Error("Failed to create System user");
        }
        res.status(201).json({
            message: "Setup completed successfully",
            superAdminUser,
            systemUser,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
exports.default = router;
