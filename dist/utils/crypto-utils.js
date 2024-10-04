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
exports.comparePassword = exports.hashPassword = void 0;
const crypto_1 = require("crypto");
// Function to hash the password and return both the salt and hash
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const salt = (0, crypto_1.randomBytes)(16).toString("hex");
            (0, crypto_1.scrypt)(password, salt, 64, (err, derivedKey) => {
                if (err)
                    reject(err);
                resolve({ salt, hash: derivedKey.toString("hex") });
            });
        });
    });
}
exports.hashPassword = hashPassword;
// Function to compare the password using the provided salt and hash
function comparePassword(password, salt, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            (0, crypto_1.scrypt)(password, salt, 64, (err, derivedKey) => {
                if (err) {
                    reject(err);
                    return;
                }
                try {
                    resolve((0, crypto_1.timingSafeEqual)(Buffer.from(hash, "hex"), derivedKey));
                }
                catch (e) {
                    if (e.code === "ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH") {
                        resolve(false); // Return false if buffer lengths do not match
                    }
                    else {
                        reject(e);
                    }
                }
            });
        });
    });
}
exports.comparePassword = comparePassword;
