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
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserRepository_1 = require("../repositories/UserRepository");
const config_1 = require("../config");
const crypto_utils_1 = require("../utils/crypto-utils");
const crypto_1 = require("crypto");
const nodeMailer_1 = require("../utils/nodeMailer");
class AuthService {
    constructor() {
        this.expireTime = "2w";
        this.userRepository = new UserRepository_1.UserRepository();
    }
    login(email, password, deviceId, browser, deviceName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.userRepository.getUserByEmail(email);
                if (!user || !user._id) {
                    return { status: 401, message: "User not found" };
                }
                const isMatch = yield (0, crypto_utils_1.comparePassword)(password, user.salt, user.hashedPassword);
                if (!isMatch) {
                    return { status: 401, message: "Invalid credentials" };
                }
                // Initialize the tokens
                let accessToken;
                let refreshToken;
                // Find the device by deviceId, or initialize a new device if not found
                let deviceIndex = user.devices.findIndex((d) => d.deviceId === deviceId);
                if (deviceIndex === -1) {
                    // If the device is not found, create it and push to the user's devices
                    const newDevice = {
                        deviceId,
                        refreshToken: "", // Will be updated below
                        browser,
                        deviceName,
                        lastUsed: new Date(),
                        tokenVersion: 0,
                    };
                    // Generate tokens for the new device
                    accessToken = this.generateAccessToken(user, deviceId);
                    refreshToken = this.generateRefreshToken(user, newDevice.tokenVersion, deviceId);
                    // Update the device with the generated tokens
                    newDevice.refreshToken = refreshToken;
                    // Push the new device to the user's devices array
                    user.devices.push(newDevice);
                }
                else {
                    // If the device is found, update it
                    const existingDevice = user.devices[deviceIndex];
                    // Generate new tokens
                    accessToken = this.generateAccessToken(user, deviceId);
                    refreshToken = this.generateRefreshToken(user, existingDevice.tokenVersion, deviceId);
                    // Update the existing device with the new tokens and timestamp
                    existingDevice.refreshToken = refreshToken;
                    existingDevice.lastUsed = new Date();
                    // Update the device in the user's devices array
                    user.devices[deviceIndex] = existingDevice;
                }
                // Save the user with updated devices
                yield this.userRepository.updateUser(user._id.toString(), {
                    devices: user.devices,
                });
                return { accessToken, refreshToken, status: 200 };
            }
            catch (error) {
                console.error("Login error:", error);
                return { status: 500, message: "Database error" };
            }
        });
    }
    refreshToken(token, deviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Refreshing Token");
            try {
                const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtRefreshSecret);
                const user = yield this.userRepository.getUserById(decoded.id);
                if (!user || !user._id) {
                    throw new Error("User not found");
                }
                // Find the device by deviceId and ensure it matches the provided refreshToken
                const deviceIndex = user.devices.findIndex((device) => device.deviceId === deviceId && device.refreshToken === token);
                if (deviceIndex === -1) {
                    throw new Error("Invalid refresh token or device ID");
                }
                const device = user.devices[deviceIndex];
                // Check token version
                if (decoded.tokenVersion !== device.tokenVersion) {
                    throw new Error("Invalid token version");
                }
                // Rotate the refresh token and increment tokenVersion
                const newTokenVersion = device.tokenVersion + 1;
                const accessToken = this.generateAccessToken(user, deviceId);
                const newRefreshToken = this.generateRefreshToken(user, newTokenVersion, deviceId);
                // Update the device information with the new token and token version
                device.refreshToken = newRefreshToken;
                device.lastUsed = new Date();
                device.tokenVersion = newTokenVersion;
                // Explicitly update the device in the user's devices array
                user.devices[deviceIndex] = device;
                yield this.userRepository.updateUser(user._id.toString(), {
                    devices: user.devices,
                });
                return { accessToken, refreshToken: newRefreshToken };
            }
            catch (error) {
                // console.error("Refresh token error:", error);
                throw new Error("Invalid refresh token");
            }
        });
    }
    logout(userId, deviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.getUserById(userId);
            if (!user || !user._id) {
                throw new Error("User not found");
            }
            // Remove the device from the list
            user.devices = user.devices.filter((device) => device.deviceId !== deviceId);
            yield this.userRepository.updateUser(userId, {
                devices: user.devices,
            });
        });
    }
    generateAccessToken(user, deviceId) {
        return jsonwebtoken_1.default.sign({ id: user._id, role: user.roleId, deviceId }, config_1.config.jwtSecret, {
            expiresIn: this.expireTime,
        });
    }
    generateRefreshToken(user, tokenVersion, deviceId) {
        return jsonwebtoken_1.default.sign({ id: user._id, tokenVersion, deviceId }, config_1.config.jwtRefreshSecret, { expiresIn: this.expireTime });
    }
    getProfile(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.getUserById(userId);
        });
    }
    updateProfile(userId, profileData) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.updateProfile(userId, profileData);
        });
    }
    updatePassword(userId, currentPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.getUserById(userId);
            if (!user || !user._id) {
                return { error: "User not found" };
            }
            const isMatch = yield (0, crypto_utils_1.comparePassword)(currentPassword, user.salt, user.hashedPassword);
            if (!isMatch) {
                return { error: "Current password is incorrect" };
            }
            const { salt, hash: hashedPassword } = yield (0, crypto_utils_1.hashPassword)(newPassword);
            yield this.userRepository.updateUserPassword(user._id.toString(), hashedPassword, salt);
            return { message: "Password updated successfully" };
        });
    }
    forgotPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.userRepository.getUserByEmail(email);
                if (!user) {
                    return { error: "User not found" };
                }
                const token = (0, crypto_1.randomBytes)(20).toString("hex");
                user.resetPasswordToken = token;
                user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
                yield this.userRepository.updateUser(user._id.toString(), user);
                const resetUrl = `http://${config_1.config.baseUrl}/reset-password/${token}`;
                yield (0, nodeMailer_1.sendResetPasswordEmail)(user.email, resetUrl);
                return { message: "Password reset link sent to your email" };
            }
            catch (error) {
                console.error("Forgot password error:", error);
                return { error: "Failed to process password reset request" };
            }
        });
    }
    resetPassword(token, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.userRepository.findUserByResetToken(token);
                if (!user) {
                    return { error: "Password reset token is invalid or has expired" };
                }
                const { salt, hash: hashedPassword } = yield (0, crypto_utils_1.hashPassword)(newPassword);
                user.hashedPassword = hashedPassword;
                user.salt = salt;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                yield this.userRepository.updateUser(user._id.toString(), user);
                return { message: "Password has been reset successfully" };
            }
            catch (error) {
                console.error("Reset password error:", error);
                return { error: "Failed to reset password" };
            }
        });
    }
}
exports.AuthService = AuthService;
