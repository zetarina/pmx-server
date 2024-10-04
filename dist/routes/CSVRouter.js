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
const CSVService_1 = require("../services/CSVService");
const router = express_1.default.Router();
const csvService = new CSVService_1.CSVService();
router.get("/download-sample-csv", (req, res) => {
    const sampleCSV = csvService.generateSampleCSV();
    res.header("Content-Type", "text/csv");
    res.attachment("sample.csv");
    res.send(sampleCSV);
});
router.post("/validate-entities", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uniqueValues = req.body;
        const validationResult = yield csvService.validateEntities(uniqueValues);
        res.status(200).json(validationResult);
    }
    catch (error) {
        console.log(error);
        if (error instanceof Error) {
            res.status(500).send(`Error validating entities: ${error.message}`);
        }
        else {
            res.status(500).send("Unknown error occurred while validating entities");
        }
    }
}));
router.post("/create-parcels", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { parcels, shipperId, initialWarehouseId } = req.body;
        if (!parcels || !Array.isArray(parcels)) {
            return res.status(400).send("Invalid parcel data.");
        }
        const { success, errors } = yield csvService.validateEntitiesAndCreateParcels(parcels, shipperId, initialWarehouseId, req.user.id // Assuming `req.user.id` is available
        );
        if (!success) {
            return res
                .status(400)
                .json({ message: "Some parcels could not be created", errors });
        }
        res.status(200).json({ message: "All parcels created successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).send(`Error creating parcels: ${error.message}`);
    }
}));
exports.default = router;
