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
const ParcelService_1 = require("../services/ParcelService");
const auth_1 = require("../middlewares/auth");
const permissions_1 = require("../types/permissions");
const Enums_1 = require("../models/Enums");
const socket_utils_1 = require("../utils/socket-utils");
const router = express_1.default.Router();
const parcelService = new ParcelService_1.ParcelService();
// GET route to fetch driver parcels
router.get("/driver/:driverId", (0, auth_1.authorize)(permissions_1.PermissionsList.UpdateParcel), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { driverId } = req.params;
        const parcels = yield parcelService.getParcelsByDriver(driverId, Enums_1.ActionType.Local);
        res.status(200).json({ parcels });
    }
    catch (error) {
        console.error("Error fetching driver parcels:", error);
        res.status(500).json({ error: error.message });
    }
}));
// POST route to process driver parcels
router.post("/driver/:driverId/process", (0, auth_1.authorize)(permissions_1.PermissionsList.UpdateParcel), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { driverId } = req.params;
        const { packageIds, warehouseId } = req.body;
        if (!Array.isArray(packageIds) || packageIds.length === 0) {
            return res
                .status(400)
                .json({ error: "No parcels provided for processing" });
        }
        const processedParcels = yield parcelService.processDriverParcels(driverId, packageIds, warehouseId);
        (0, socket_utils_1.emitBulkParcelStatusChanged)(processedParcels);
        res.status(200).json({
            message: "Parcels processed successfully",
            parcels: processedParcels,
        });
    }
    catch (error) {
        console.error("Error processing driver parcels:", error);
        res.status(500).json({ error: error.message });
    }
}));
// POST route to process long-haul parcels
router.post("/long-haul-parcels", (0, auth_1.authorize)(permissions_1.PermissionsList.UpdateParcel), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { parcels, warehouseId } = req.body;
        if (!Array.isArray(parcels) || parcels.length === 0) {
            return res
                .status(400)
                .json({ error: "No parcels provided for processing" });
        }
        const processedParcels = yield parcelService.processParcelsForLongHaul(parcels, warehouseId);
        (0, socket_utils_1.emitBulkParcelStatusChanged)(processedParcels);
        res.status(200).json({
            message: "Parcels processed for long-haul successfully",
            parcels: processedParcels,
        });
    }
    catch (error) {
        console.error("Error processing long-haul parcels:", error);
        res.status(500).json({ error: error.message });
    }
}));
exports.default = router;
