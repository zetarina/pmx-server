"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/pmx',
    port: parseInt(process.env.PORT || '5000', 10),
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret',
    clientId: process.env.CLIENT_ID || 'your_client_id',
    clientSecret: process.env.CLIENT_SECRET || 'your_client_secret'
};
