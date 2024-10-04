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
const ParcelServiceMobile_1 = require("../services/ParcelServiceMobile");
const router = express_1.default.Router();
const parcelService = new ParcelServiceMobile_1.ParcelServiceMobile();
// Get parcel by parcelId
router.get("/:parcelId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { parcelId } = req.params;
        const parcel = yield parcelService.getParcelByParcelId(parcelId);
        res.status(200).json(parcel);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}));
router.post("/:parcelId", auth_1.authenticateJWT, (0, auth_1.authorize)(permissions_1.PermissionsList.ReadParcel), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { parcelId } = req.params;
        const parcel = yield parcelService.getParcelByParcelId(parcelId);
        res.status(200).json(parcel);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}));
exports.default = router;
