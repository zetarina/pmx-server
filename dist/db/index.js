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
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const options = {
        dbName: "pmx-database",
        retryWrites: true,
        serverSelectionTimeoutMS: 5000,
    };
    if (!process.env.MONGODB_URI) {
        const errorMsg = "MONGODB_URI environment variable is not defined";
        throw new Error(errorMsg);
    }
    const uri = process.env.MONGODB_URI;
    if (mongoose_1.default.connection.readyState >= 1) {
        console.log("Using existing database connection");
        return;
    }
    try {
        console.log("Attempting to connect to MongoDB...");
        yield mongoose_1.default.connect(uri, options);
        console.log("Database connected successfully to:", uri.split("@").pop());
    }
    catch (error) {
        console.error("Error connecting to MongoDB:", error instanceof Error ? error.message : error);
        throw error;
    }
});
exports.default = connectDB;
