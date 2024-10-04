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
exports.CSVService = void 0;
const CSVRepository_1 = require("../repositories/CSVRepository");
const Parcel_1 = require("../models/Parcel");
const mongoose_1 = __importDefault(require("mongoose"));
class CSVService {
    constructor() {
        this.csvRepo = new CSVRepository_1.CSVRepository();
    }
    generateSampleCSV() {
        return this.csvRepo.generateSampleCSV();
    }
    validateEntities(uniqueValues) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.csvRepo.validateEntities(uniqueValues);
        });
    }
    validateShipperAndWarehouse(shipperId, warehouseId) {
        return __awaiter(this, void 0, void 0, function* () {
            const shipper = yield this.csvRepo.validateShipper(shipperId);
            if (!shipper) {
                throw new Error("Shipper not found.");
            }
            const warehouse = yield this.csvRepo.validateWarehouse(warehouseId);
            if (!warehouse) {
                throw new Error("Initial warehouse not found.");
            }
            return { shipper, warehouse };
        });
    }
    createTrackingHistory(newStatus, warehouseId, driverId) {
        return {
            status: newStatus,
            timestamp: new Date(),
            warehouseId: warehouseId
                ? new mongoose_1.default.Types.ObjectId(warehouseId)
                : undefined,
            driverId: driverId ? new mongoose_1.default.Types.ObjectId(driverId) : undefined,
        };
    }
    generateParcelId(senderName) {
        return __awaiter(this, void 0, void 0, function* () {
            senderName = senderName.replace(/\s+/g, "").slice(0, 4).toUpperCase();
            const randomPartLength = 8 - senderName.length;
            let parcelId = "";
            while (true) {
                const randomNumbers = Math.random()
                    .toString()
                    .slice(2, 2 + randomPartLength);
                parcelId = `${senderName}${randomNumbers}`;
                if (!(yield this.csvRepo.isParcelIdExists(parcelId))) {
                    break;
                }
            }
            return parcelId;
        });
    }
    validateEntitiesAndCreateParcels(parcels, shipperId, initialWarehouseId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = [];
            try {
                const { shipper } = yield this.validateShipperAndWarehouse(shipperId, initialWarehouseId);
                const countryIdsOrNames = parcels.map((parcel) => parcel.receiver.countryId);
                const cityIdsOrNames = parcels.map((parcel) => parcel.receiver.cityId);
                const { countries, cities } = yield this.csvRepo.validateEntities({
                    countries: countryIdsOrNames,
                    cities: cityIdsOrNames,
                });
                const validatedParcels = yield Promise.all(parcels.map((parcel, index) => __awaiter(this, void 0, void 0, function* () {
                    const country = countries.find((c) => (c._id && c._id.toString() === parcel.receiver.countryId) ||
                        c.name === parcel.receiver.countryId);
                    const city = cities.find((c) => (c._id && c._id.toString() === parcel.receiver.cityId) ||
                        c.name === parcel.receiver.cityId);
                    if (!country) {
                        errors.push(`Country not found for parcel at index ${index}`);
                    }
                    if (!city) {
                        errors.push(`City not found for parcel at index ${index}`);
                    }
                    if (country && country._id) {
                        parcel.receiver.countryId = country._id.toString();
                    }
                    if (city && city._id) {
                        parcel.receiver.cityId = city._id.toString();
                    }
                    const parcelId = yield this.generateParcelId(shipper.username);
                    const trackingHistory = [
                        this.createTrackingHistory(Parcel_1.ParcelStatus.ParcelCreated, initialWarehouseId),
                        this.createTrackingHistory(Parcel_1.ParcelStatus.InWarehouse, initialWarehouseId),
                    ];
                    return Object.assign(Object.assign({}, parcel), { sender: {
                            type: Parcel_1.SenderType.Shipper,
                            shipper_id: shipperId,
                        }, parcelId,
                        trackingHistory, paymentStatus: parcel.paymentType === Parcel_1.PaymentType.PayBySender
                            ? Parcel_1.PaymentStatus.Completed
                            : Parcel_1.PaymentStatus.Pending, createdById: new mongoose_1.default.Types.ObjectId(userId), status: Parcel_1.ParcelStatus.InWarehouse });
                })));
                if (errors.length > 0) {
                    return { success: false, errors };
                }
                yield this.csvRepo.createParcels(validatedParcels);
                return { success: true, errors: [] };
            }
            catch (error) {
                console.error("Error occurred during parcel creation:", error);
                errors.push(error.message);
                return { success: false, errors };
            }
        });
    }
}
exports.CSVService = CSVService;
