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
exports.authenticateSocket = exports.authorize = exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AuthService_1 = require("../services/AuthService");
const config_1 = require("../config");
const authService = new AuthService_1.AuthService();
const authenticateJWT = (req, res, next) => {
    var _a;
    const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    const isRetry = req.header("X-Retry") === "true"; // Custom header to identify retries
    if (!token) {
        console.error("Authorization Null :" + req.header("Authorization"));
        return res.status(401).json({ message: "Access token is missing" });
    }
    jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret, (err, decoded) => {
        if (err) {
            if (isRetry) {
                console.error("Someone accessed with invalid token during a retry");
            }
            return res.status(401).json({ message: "Invalid token" });
        }
        req.user = decoded;
        next();
    });
};
exports.authenticateJWT = authenticateJWT;
const authorize = (permission) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield authService.getProfile(req.user.id);
            if (!user || !user.role || !user.role.permissions[permission]) {
                return res.status(403).json({ message: "Forbidden" });
            }
            next();
        }
        catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    });
};
exports.authorize = authorize;
const authenticateSocket = (socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
        jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret, (err, decoded) => {
            if (err) {
                return next(new Error("Authentication error"));
            }
            socket.data.user = decoded;
            next();
        });
    }
    else {
        next(new Error("Authentication error"));
    }
};
exports.authenticateSocket = authenticateSocket;
