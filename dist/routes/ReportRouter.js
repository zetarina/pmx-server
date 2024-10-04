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
const json2csv_1 = require("json2csv");
const ParcelService_1 = require("../services/ParcelService");
const router = express_1.default.Router();
const parcelService = new ParcelService_1.ParcelService();
// Endpoint to get parcel data for the frontend
router.get("/data", (0, auth_1.authorize)(permissions_1.PermissionsList.ReadParcel), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate } = req.query;
        const parcels = yield parcelService.getParcelsByDateRange(new Date(startDate), new Date(endDate));
        res.status(200).json(parcels);
    }
    catch (error) {
        console.error("Error fetching parcels:", error);
        res.status(500).json({ error: "Failed to fetch parcels" });
    }
}));
// Endpoint to download parcel report as CSV
router.get("/download", (0, auth_1.authorize)(permissions_1.PermissionsList.ReadParcel), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate } = req.query;
        const parcels = yield parcelService.getParcelsByDateRange(new Date(startDate), new Date(endDate));
        const csv = yield (0, json2csv_1.parseAsync)(parcels);
        res.header("Content-Type", "text/csv");
        res.attachment(`parcel-report-${startDate}-to-${endDate}.csv`);
        res.send(csv);
    }
    catch (error) {
        console.error("Error generating CSV:", error);
        res.status(500).json({ error: "Failed to generate CSV" });
    }
}));
exports.default = router;
