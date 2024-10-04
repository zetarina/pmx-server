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
const AuthService_1 = require("../services/AuthService");
const auth_1 = require("../middlewares/auth");
const csurf_1 = __importDefault(require("csurf"));
const error_1 = require("../error");
const router = express_1.default.Router();
const authService = new AuthService_1.AuthService();
const csrfProtection = (0, csurf_1.default)({ cookie: true });
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, deviceId, browser, deviceName } = req.body;
    if (!email || !password || !deviceId || !browser || !deviceName) {
        return res.status(400).json({ error: "All fields are required" });
    }
    try {
        const result = yield authService.login(email, password, deviceId, browser, deviceName);
        if (result.status && result.message) {
            return res.status(result.status).json({ error: result.message });
        }
        const { accessToken, refreshToken } = result;
        res.cookie("accessToken", accessToken, { httpOnly: true, secure: false });
        res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: false });
        res.status(200).json({ accessToken, refreshToken });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "An unexpected error occurred" });
    }
}));
router.post("/refreshToken", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken, deviceId } = req.body;
    if (!refreshToken || !deviceId) {
        return res
            .status(400)
            .json({ error: "Refresh token and device ID are required" });
    }
    try {
        const tokens = yield authService.refreshToken(refreshToken, deviceId);
        res.status(200).json(tokens);
    }
    catch (error) {
        console.error("Token refresh error:", error);
        res.status(401).json({ error: error.message });
    }
}));
// Logout endpoint
router.post("/logout", auth_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { deviceId } = req.body;
    try {
        yield authService.logout(req.user.id, deviceId);
        res.status(200).json({ message: "Successfully logged out" });
    }
    catch (error) {
        console.error("Logout error:", error);
        (0, error_1.handleError)(res, error);
    }
}));
router.get("/csrf-token", csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});
router.get("/me", auth_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield authService.getProfile(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user });
    }
    catch (error) {
        console.error("Fetch user error:", error);
        (0, error_1.handleError)(res, error);
    }
}));
router.post("/forgot-password", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const response = yield authService.forgotPassword(email);
        if (response.error) {
            return res.status(400).json({ error: response.error });
        }
        res.status(200).json({ message: response.message });
    }
    catch (error) {
        (0, error_1.handleError)(res, error);
    }
}));
router.post("/reset-password/:token", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;
        const response = yield authService.resetPassword(token, newPassword);
        if (response.error) {
            return res.status(400).json({ error: response.error });
        }
        res.status(200).json({ message: response.message });
    }
    catch (error) {
        (0, error_1.handleError)(res, error);
    }
}));
exports.default = router;
