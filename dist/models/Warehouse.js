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
exports.getWarehouseModel = exports.WarehouseModel = exports.warehouseModelName = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const City_1 = require("./City");
const Country_1 = require("./Country");
exports.warehouseModelName = "Warehouses";
const warehouseSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    location: {
        address: { type: String, required: true },
        cityId: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: City_1.cityModelName,
            required: true,
        },
        countryId: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: Country_1.countryModelName,
            required: true,
        },
    },
    capacity: { type: Number, required: true },
}, { timestamps: true, collection: exports.warehouseModelName });
warehouseSchema.virtual("location.city", {
    ref: City_1.cityModelName,
    localField: "location.cityId",
    foreignField: "_id",
    justOne: true,
});
warehouseSchema.virtual("location.country", {
    ref: Country_1.countryModelName,
    localField: "location.countryId",
    foreignField: "_id",
    justOne: true,
});
warehouseSchema.set("toObject", { virtuals: true });
warehouseSchema.set("toJSON", { virtuals: true });
exports.WarehouseModel = mongoose_1.default.models[exports.warehouseModelName] ||
    mongoose_1.default.model(exports.warehouseModelName, warehouseSchema);
function getWarehouseModel() {
    return exports.WarehouseModel;
}
exports.getWarehouseModel = getWarehouseModel;
