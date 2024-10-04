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
const auth_1 = require("../middlewares/auth");
const permissions_1 = require("../types/permissions");
const Enums_1 = require("../models/Enums");
const socket_utils_1 = require("../utils/socket-utils");
const ParcelServiceMobile_1 = require("../services/ParcelServiceMobile");
const router = express_1.default.Router();
const parcelServiceMobile = new ParcelServiceMobile_1.ParcelServiceMobile();
router.get("/driverParcels/:id/inventory", (0, auth_1.authorize)(permissions_1.PermissionsList.getInventory), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const driverId = req.user.id;
        const driverId = req.params.id;
        const { type } = req.query;
        const inventory = yield parcelServiceMobile.getMyInventory(driverId, type);
        res.status(200).json(inventory);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}));
router.get("/inventory", (0, auth_1.authorize)(permissions_1.PermissionsList.getInventory), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const driverId = req.user.id;
        const { type } = req.query;
        const inventory = yield parcelServiceMobile.getMyInventory(driverId, type);
        res.status(200).json(inventory);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}));
router.post("/scan/inventory", (0, auth_1.authorize)(permissions_1.PermissionsList.ScanParcelByDriver), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { parcelId, action } = req.body;
        const driverId = req.user.id;
        const updatedParcel = yield parcelServiceMobile.scanParcel(parcelId, driverId, action);
        if (updatedParcel && updatedParcel._id) {
            const successParcel = yield parcelServiceMobile.getParcelById(updatedParcel._id.toString());
            res.status(200).json(successParcel);
            (0, socket_utils_1.emitParcelStatusChanged)(updatedParcel);
            (0, socket_utils_1.emitParcelInventoryChange)(Enums_1.InventoryChange.AddedToInventory, driverId, updatedParcel._id, action === Enums_1.ActionType.Local
                ? Enums_1.InventoryType.Local
                : Enums_1.InventoryType.LongHaul);
        }
        else {
            res.status(400).json({ message: "Parcel not found or update failed." });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}));
router.post("/submit", (0, auth_1.authorize)(permissions_1.PermissionsList.ScanParcelByDriver), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, action } = req.body;
        const driverId = req.user.id;
        const updatedParcel = yield parcelServiceMobile.submitDeliveryAction(id, driverId, action);
        if (updatedParcel) {
            const successParcel = yield parcelServiceMobile.getParcelById(id);
            res.status(200).json(successParcel);
            (0, socket_utils_1.emitParcelStatusChanged)(updatedParcel);
            (0, socket_utils_1.emitParcelInventoryChange)(Enums_1.InventoryChange.RemovedFromInventory, driverId, updatedParcel._id, action === Enums_1.ActionType.Local
                ? Enums_1.InventoryType.Local
                : Enums_1.InventoryType.LongHaul);
        }
        else {
            res.status(400).json({ message: "Parcel not found or update failed." });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}));
router.post("/submit-border", (0, auth_1.authorize)(permissions_1.PermissionsList.ScanParcelByDriver), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const driverId = req.user.id;
        const updatedParcels = yield parcelServiceMobile.markAllParcelsAsBorder(driverId);
        if (updatedParcels && updatedParcels.length > 0) {
            res
                .status(200)
                .json({ message: "All long-haul parcels marked as border." });
            (0, socket_utils_1.emitBulkParcelStatusChanged)(updatedParcels);
        }
        else {
            res.status(400).json({ message: "No parcels found or update failed." });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
router.post("/revert", (0, auth_1.authorize)(permissions_1.PermissionsList.ScanParcelByDriver), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { parcelId, action } = req.body;
        const driverId = req.user.id;
        const updatedParcel = yield parcelServiceMobile.revertParcelStatus(parcelId);
        if (updatedParcel) {
            res.status(200).json(updatedParcel);
            (0, socket_utils_1.emitParcelStatusChanged)(updatedParcel);
            (0, socket_utils_1.emitParcelInventoryChange)(Enums_1.InventoryChange.AddedToInventory, driverId, updatedParcel._id, action === Enums_1.ActionType.Local
                ? Enums_1.InventoryType.Local
                : Enums_1.InventoryType.LongHaul);
        }
        else {
            res.status(400).json({ message: "Parcel not found or update failed." });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
exports.default = router;
