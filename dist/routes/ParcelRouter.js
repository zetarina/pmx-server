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
const Events_1 = require("../models/Events");
const app_1 = require("../app");
const waybill_1 = require("../utils/waybill");
const router = express_1.default.Router();
const parcelService = new ParcelService_1.ParcelService();
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, query = "" } = req.query;
        const { parcels, total } = yield parcelService.getAllParcels(Number(page), Number(limit), query);
        res.status(200).json({ parcels, total });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
router.get("/:id", (0, auth_1.authorize)(permissions_1.PermissionsList.ReadParcel), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const parcel = yield parcelService.getParcelById(id);
        res.status(200).json(parcel);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
router.get("/:id/waybill-pdf", (0, auth_1.authorize)(permissions_1.PermissionsList.ReadParcel), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const parcel = yield parcelService.getParcelById(id);
        if (!parcel) {
            return res.status(404).json({ error: "Parcel not found" });
        }
        const pdfBytes = yield (0, waybill_1.generateWaybillPDF)(parcel);
        res.setHeader("Content-Disposition", "inline; filename=waybill.pdf");
        res.setHeader("Content-Type", "application/pdf");
        res.send(Buffer.from(pdfBytes));
    }
    catch (error) {
        console.error("Error generating waybill PDF:", error);
        res.status(500).json({ error: "Failed to generate waybill PDF" });
    }
}));
router.get("/parcelId/:parcelId", (0, auth_1.authorize)(permissions_1.PermissionsList.ReadParcel), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { parcelId } = req.params;
        const parcel = yield parcelService.getParcelByParcelId(parcelId);
        res.status(200).json(parcel);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
router.post("/", (0, auth_1.authorize)(permissions_1.PermissionsList.CreateParcel), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parcel = req.body;
        const userId = req.user.id;
        const initialWarehouseId = req.body.initialWarehouseId;
        const newParcel = yield parcelService.validateAndCreateParcel(parcel, initialWarehouseId, userId);
        if (!newParcel) {
            return res.status(500).json({ error: "Failed to create parcel" });
        }
        const pdfBytes = yield (0, waybill_1.generateWaybillPDF)(newParcel);
        const pdfBase64 = Buffer.from(pdfBytes).toString("base64");
        res.status(201).json({
            parcel: newParcel,
            waybill: pdfBase64,
        });
        app_1.io.emit(Events_1.ParcelEvent.Created, newParcel);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}));
router.put("/:parcelId", (0, auth_1.authorize)(permissions_1.PermissionsList.UpdateParcel), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { parcelId } = req.params;
        const parcelUpdates = req.body;
        const updatedParcel = yield parcelService.updateParcelUser(parcelId, parcelUpdates);
        if (!updatedParcel) {
            return res.status(500).json({ error: "Failed to update parcel" });
        }
        const pdfBytes = yield (0, waybill_1.generateWaybillPDF)(updatedParcel);
        const pdfBase64 = Buffer.from(pdfBytes).toString("base64");
        res.status(200).json({
            parcel: updatedParcel,
            waybill: pdfBase64,
        });
        app_1.io.emit(Events_1.ParcelEvent.Updated, updatedParcel);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}));
router.delete("/:parcelId", (0, auth_1.authorize)(permissions_1.PermissionsList.DeleteParcel), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { parcelId } = req.params;
        yield parcelService.deleteParcel(parcelId);
        res.status(200).json({ message: "Parcel deleted successfully." });
        app_1.io.emit(Events_1.ParcelEvent.Deleted, parcelId);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
exports.default = router;
