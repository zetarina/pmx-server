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
exports.ParcelService = void 0;
const ParcelRepository_1 = require("../repositories/ParcelRepository");
const Parcel_1 = require("../models/Parcel");
const mongoose_1 = __importDefault(require("mongoose"));
const UserRepository_1 = require("../repositories/UserRepository");
const CityRepository_1 = require("../repositories/CityRepository");
const CountryRepository_1 = require("../repositories/CountryRepository");
const WarehouseRepository_1 = require("../repositories/WarehouseRepository");
class ParcelService {
    constructor() {
        this.parcelRepository = new ParcelRepository_1.ParcelRepository();
        this.userRepository = new UserRepository_1.UserRepository();
        this.cityRepository = new CityRepository_1.CityRepository();
        this.countryRepository = new CountryRepository_1.CountryRepository();
        this.warehouseRepository = new WarehouseRepository_1.WarehouseRepository();
    }
    generateParcelId(sender) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            let senderName = (sender.type === Parcel_1.SenderType.Shipper && sender.shipper_id
                ? (_a = (yield this.userRepository.getUserByObjectId(sender.shipper_id))) === null || _a === void 0 ? void 0 : _a.username
                : (_b = sender.guest) === null || _b === void 0 ? void 0 : _b.name) || "";
            senderName = senderName.replace(/\s+/g, "").slice(0, 4).toUpperCase();
            const randomPartLength = 8 - senderName.length;
            let parcelId = "";
            while (true) {
                const randomNumbers = Math.random()
                    .toString()
                    .slice(2, 2 + randomPartLength);
                parcelId = `${senderName}${randomNumbers}`;
                if (!(yield this.parcelRepository.getSimpleParcelByParcelId(parcelId))) {
                    break;
                }
            }
            return parcelId;
        });
    }
    validateCityAndCountryIds(parcel) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            try {
                if ((_a = parcel.receiver) === null || _a === void 0 ? void 0 : _a.cityId) {
                    const receiverCity = yield this.cityRepository.getCityById(parcel.receiver.cityId);
                    if (!receiverCity)
                        throw new Error("Receiver city not found");
                    parcel.receiver.cityId = receiverCity._id;
                }
                if ((_b = parcel.receiver) === null || _b === void 0 ? void 0 : _b.countryId) {
                    const receiverCountry = yield this.countryRepository.getCountryById(parcel.receiver.countryId);
                    if (!receiverCountry)
                        throw new Error("Receiver country not found");
                    parcel.receiver.countryId = receiverCountry._id;
                }
                if (((_c = parcel.sender) === null || _c === void 0 ? void 0 : _c.type) === Parcel_1.SenderType.Guest) {
                    parcel.sender.shipper_id = null;
                    const guest = parcel.sender.guest;
                    if (guest) {
                        if (!guest.name ||
                            !guest.phoneNumber ||
                            !guest.address ||
                            !guest.countryId ||
                            !guest.cityId ||
                            !guest.zip) {
                            throw new Error("All guest fields are required");
                        }
                        const guestCountry = yield this.countryRepository.getCountryById(guest.countryId);
                        if (!guestCountry)
                            throw new Error("Guest country not found");
                        const guestCity = yield this.cityRepository.getCityById(guest.cityId);
                        if (!guestCity)
                            throw new Error("Guest city not found");
                        guest.countryId = guestCountry._id;
                        guest.cityId = guestCity._id;
                    }
                    delete parcel.sender.shipper_id;
                }
                else if (((_d = parcel.sender) === null || _d === void 0 ? void 0 : _d.type) === Parcel_1.SenderType.Shipper) {
                    parcel.sender.guest = null;
                    if (!parcel.sender.shipper_id) {
                        throw new Error("Shipper ID is required for Shipper sender type");
                    }
                }
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    createTrackingHistory(newStatus, driverId, warehouseId) {
        return {
            status: newStatus,
            timestamp: new Date(),
            driverId: driverId ? new mongoose_1.default.Types.ObjectId(driverId) : undefined,
            warehouseId: warehouseId
                ? new mongoose_1.default.Types.ObjectId(warehouseId)
                : undefined,
        };
    }
    validateAndCreateParcel(parcel, initialWarehouseId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!initialWarehouseId)
                throw new Error("Initial warehouse ID is required");
            const initialWarehouse = yield this.warehouseRepository.getWarehouseById(initialWarehouseId);
            if (!initialWarehouse || !initialWarehouse._id)
                throw new Error("Initial warehouse not found");
            yield this.validateCityAndCountryIds(parcel);
            return this.createParcel(parcel, initialWarehouse._id, userId);
        });
    }
    createParcel(parcel, initialWarehouseId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.getUserById(userId);
            if (!user || !user._id)
                throw new Error("No User");
            parcel.paymentStatus =
                parcel.paymentType === Parcel_1.PaymentType.PayBySender
                    ? Parcel_1.PaymentStatus.Completed
                    : Parcel_1.PaymentStatus.Pending;
            parcel.createdById = user._id;
            parcel.parcelId = yield this.generateParcelId(parcel.sender);
            parcel.trackingHistory = [
                this.createTrackingHistory(Parcel_1.ParcelStatus.ParcelCreated),
                this.createTrackingHistory(Parcel_1.ParcelStatus.InWarehouse, undefined, initialWarehouseId.toString()),
            ];
            parcel.status = Parcel_1.ParcelStatus.InWarehouse;
            return this.parcelRepository.createParcel(parcel);
        });
    }
    getAllParcels(page, limit, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.parcelRepository.getAllParcels(page, limit, query);
        });
    }
    updateParcelUser(parcelId, parcelUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.validateCityAndCountryIds(parcelUpdate);
            delete parcelUpdate.parcelId;
            delete parcelUpdate.createdById;
            delete parcelUpdate.status;
            delete parcelUpdate.trackingHistory;
            delete parcelUpdate.currentDriverId;
            delete parcelUpdate.currentDriver;
            delete parcelUpdate.exchangeRateId;
            delete parcelUpdate.exchangeRate;
            delete parcelUpdate.paymentStatus;
            delete parcelUpdate.createdBy;
            return this.parcelRepository.updateParcelUser(parcelId, parcelUpdate);
        });
    }
    deleteParcel(parcelId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.parcelRepository.deleteParcel(parcelId);
        });
    }
    getParcelByParcelId(parcelId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.parcelRepository.getParcelByParcelId(parcelId);
        });
    }
    getParcelById(_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.parcelRepository.getParcelById(_id);
        });
    }
    processParcelsForLongHaul(parcelIds, warehouseId) {
        return __awaiter(this, void 0, void 0, function* () {
            const parcels = yield this.parcelRepository.getParcelsByIds(parcelIds);
            if (!parcels || parcels.length === 0) {
                throw new Error("No parcels found with the provided IDs");
            }
            const processedParcels = parcels.map((parcel) => {
                var _a;
                if (!parcel || !parcel._id) {
                    throw new Error(`Parcel with ID ${parcel.parcelId} not found`);
                }
                // Check if the parcel was incorrectly marked as Delivered
                if (parcel.status === Parcel_1.ParcelStatus.Delivered) {
                    // Remove the Delivered status from tracking history
                    parcel.trackingHistory = parcel.trackingHistory.filter((history) => history.status !== Parcel_1.ParcelStatus.Delivered);
                }
                // Check if the parcel is already in the warehouse with the given warehouseId
                const lastTrackingHistory = parcel.trackingHistory[parcel.trackingHistory.length - 1];
                if (lastTrackingHistory.status !== Parcel_1.ParcelStatus.InWarehouse ||
                    ((_a = lastTrackingHistory.warehouseId) === null || _a === void 0 ? void 0 : _a.toString()) !== warehouseId) {
                    // Add a new history entry indicating the parcel is now in the warehouse
                    parcel.status = Parcel_1.ParcelStatus.InWarehouse;
                    parcel.trackingHistory.push(this.createTrackingHistory(Parcel_1.ParcelStatus.InWarehouse, undefined, warehouseId));
                }
                return parcel;
            });
            // Update the parcels in the repository and return the updated parcels
            const updatedParcels = yield this.parcelRepository.updateParcelsSystem(processedParcels);
            return updatedParcels;
        });
    }
    getParcelsByDriver(driverId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.parcelRepository.getParcelsByDriver(driverId, type);
        });
    }
    processDriverParcels(driverId, packageIds, warehouseId) {
        return __awaiter(this, void 0, void 0, function* () {
            const parcels = yield this.parcelRepository.getParcelsByIds(packageIds);
            if (!parcels || parcels.length === 0) {
                throw new Error("No parcels found with the provided IDs");
            }
            const processedParcels = parcels.map((parcel) => {
                if (!parcel.currentDriverId ||
                    parcel.currentDriverId.toString() !== driverId) {
                    throw new Error(`Parcel ${parcel.parcelId} is not assigned to this driver`);
                }
                switch (parcel.status) {
                    case Parcel_1.ParcelStatus.OutForDelivery:
                        parcel.status = Parcel_1.ParcelStatus.InWarehouse;
                        parcel.trackingHistory.push({
                            status: Parcel_1.ParcelStatus.InWarehouse,
                            timestamp: new Date(),
                            driverId: new mongoose_1.default.Types.ObjectId(driverId),
                            warehouseId: new mongoose_1.default.Types.ObjectId(warehouseId),
                        });
                        break;
                    case Parcel_1.ParcelStatus.Delivered:
                        parcel.status = Parcel_1.ParcelStatus.Completed;
                        parcel.trackingHistory.push({
                            status: Parcel_1.ParcelStatus.Completed,
                            timestamp: new Date(),
                            driverId: new mongoose_1.default.Types.ObjectId(driverId),
                            warehouseId: new mongoose_1.default.Types.ObjectId(warehouseId),
                        });
                        break;
                    case Parcel_1.ParcelStatus.Rescheduled:
                    case Parcel_1.ParcelStatus.Cancelled:
                        parcel.status = Parcel_1.ParcelStatus.InWarehouse;
                        parcel.trackingHistory.push({
                            status: Parcel_1.ParcelStatus.InWarehouse,
                            timestamp: new Date(),
                            driverId: new mongoose_1.default.Types.ObjectId(driverId),
                            warehouseId: new mongoose_1.default.Types.ObjectId(warehouseId),
                        });
                        break;
                    default:
                        throw new Error(`Parcel ${parcel.parcelId} cannot be processed in its current status: ${parcel.status}`);
                }
                return parcel;
            });
            // Update the parcels in the repository and return the updated parcels
            const updatedParcels = yield this.parcelRepository.updateParcelsSystem(processedParcels);
            return updatedParcels;
        });
    }
    getParcelsByDateRange(startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Ensure the startDate and endDate are valid dates
                if (!startDate || !endDate) {
                    throw new Error("Start date and end date are required");
                }
                // Fetch parcels from the repository
                return yield this.parcelRepository.getParcelsByDateRange(startDate, endDate);
            }
            catch (error) {
                console.error(`Error fetching parcels by date range: ${error.message}`);
                throw new Error(`Error fetching parcels by date range: ${error.message}`);
            }
        });
    }
    getAllParcelsForDashboard() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const totals = yield this.parcelRepository.getTotalsForDashboard();
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                const monthlyData = yield this.parcelRepository.getMonthlyDataForDashboard(startOfMonth, endOfMonth);
                return { totals, monthlyData };
            }
            catch (error) {
                console.error("Error fetching all parcels for dashboard:", error);
                throw new Error("Failed to fetch all parcels for dashboard");
            }
        });
    }
}
exports.ParcelService = ParcelService;
