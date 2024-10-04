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
const Parcel_1 = require("../models/Parcel");
const waybill_1 = require("../utils/waybill");
const router = express_1.default.Router();
router.post("/generate-waybill", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { parcelId } = req.body;
        const parcel = yield Parcel_1.ParcelModel.findById(parcelId)
            .populate("sender.guest.country")
            .populate("sender.guest.city")
            .populate("sender.shipper.country")
            .populate("sender.shipper.city")
            .populate("receiver.country")
            .populate("receiver.city")
            .exec();
        if (!parcel) {
            return res.status(404).json({ error: "Parcel not found" });
        }
        const pdfBytes = yield (0, waybill_1.generateWaybillPDF)(parcel);
        res.setHeader("Content-Type", "application/pdf");
        res.send(pdfBytes);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
exports.default = router;
