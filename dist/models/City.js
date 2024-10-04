"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCityModel = exports.CityModel = exports.cityModelName = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const Country_1 = require("./Country");
exports.cityModelName = "Cities";
const citySchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    countryId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: Country_1.countryModelName,
        required: true,
    },
}, {
    timestamps: true,
    collection: exports.cityModelName,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
citySchema.virtual("country", {
    ref: Country_1.countryModelName,
    localField: "countryId",
    foreignField: "_id",
    justOne: true,
});
exports.CityModel = mongoose_1.default.models[exports.cityModelName] ||
    mongoose_1.default.model(exports.cityModelName, citySchema);
function getCityModel() {
    return exports.CityModel;
}
exports.getCityModel = getCityModel;
