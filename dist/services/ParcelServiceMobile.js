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
exports.ParcelServiceMobile = void 0;
const ParcelRepository_1 = require("../repositories/ParcelRepository");
const Parcel_1 = require("../models/Parcel");
const mongoose_1 = __importDefault(require("mongoose"));
const Enums_1 = require("../models/Enums");
class ParcelServiceMobile {
    constructor() {
        this.parcelRepository = new ParcelRepository_1.ParcelRepository();
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
    buildParcelStatusChangePayload(updatedParcel) {
        return {
            _id: updatedParcel._id,
            status: updatedParcel.status,
            trackingHistory: updatedParcel.trackingHistory,
            paymentStatus: updatedParcel.paymentStatus,
        };
    }
    changeParcelStatus(id, newStatus, driverId, warehouseId, paymentStatus) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            // Determine whether 'id' is a valid ObjectId
            const isObjectId = mongoose_1.default.Types.ObjectId.isValid(id);
            // Fetch the parcel using either _id or parcelId
            const parcel = isObjectId
                ? yield this.parcelRepository.getParcelById(id) // Use _id
                : yield this.parcelRepository.getParcelByParcelId(id); // Use parcelId
            if (!parcel)
                throw new Error("Parcel not found");
            // Handle the status `InWarehouse` - check for warehouseId change
            if (parcel.status === Parcel_1.ParcelStatus.InWarehouse) {
                const lastTrackingEntry = parcel.trackingHistory[parcel.trackingHistory.length - 1];
                const lastWarehouseId = (_a = lastTrackingEntry === null || lastTrackingEntry === void 0 ? void 0 : lastTrackingEntry.warehouseId) === null || _a === void 0 ? void 0 : _a.toString();
                // If the warehouseId is the same, do not update the tracking history
                if (warehouseId && lastWarehouseId && lastWarehouseId === warehouseId) {
                    return this.buildParcelStatusChangePayload(parcel);
                }
            }
            // Handle other statuses that depend on driverId change
            const statusRequiringDriverCheck = [
                Parcel_1.ParcelStatus.OutForDelivery,
                Parcel_1.ParcelStatus.OnVehicle,
                Parcel_1.ParcelStatus.Border,
                Parcel_1.ParcelStatus.Delivered,
            ];
            if (statusRequiringDriverCheck.includes(parcel.status)) {
                const lastTrackingEntry = parcel.trackingHistory[parcel.trackingHistory.length - 1];
                const lastDriverId = (_b = lastTrackingEntry === null || lastTrackingEntry === void 0 ? void 0 : lastTrackingEntry.driverId) === null || _b === void 0 ? void 0 : _b.toString();
                const lastStatus = lastTrackingEntry === null || lastTrackingEntry === void 0 ? void 0 : lastTrackingEntry.status;
                // If the driverId is the same but the status is different, allow the update
                if (driverId && lastDriverId && lastDriverId === driverId) {
                    if (lastStatus !== newStatus) {
                        // Allow update if status is different
                    }
                    else {
                        // If the driverId and status are the same, don't update the tracking history
                        return this.buildParcelStatusChangePayload(parcel);
                    }
                }
            }
            // Update status and other properties
            parcel.status = newStatus;
            if (driverId) {
                parcel.currentDriverId = new mongoose_1.default.Types.ObjectId(driverId);
            }
            else if (warehouseId) {
                parcel.currentDriverId = undefined;
            }
            if (newStatus === Parcel_1.ParcelStatus.Delivered &&
                parcel.paymentType === Parcel_1.PaymentType.PayByRecipients) {
                parcel.paymentStatus = Parcel_1.PaymentStatus.Completed;
            }
            else if (paymentStatus) {
                parcel.paymentStatus = paymentStatus;
            }
            // Add the new tracking history only if there's a relevant change
            parcel.trackingHistory.push(this.createTrackingHistory(newStatus, driverId, warehouseId));
            const updatedParcel = yield this.parcelRepository.updateParcelSystem(parcel._id, parcel);
            return updatedParcel
                ? this.buildParcelStatusChangePayload(updatedParcel)
                : null;
        });
    }
    revertParcelStatus(parcelId) {
        return __awaiter(this, void 0, void 0, function* () {
            const parcel = yield this.parcelRepository.getParcelByParcelId(parcelId);
            if (!parcel)
                throw new Error("Parcel not found");
            if (![Parcel_1.ParcelStatus.OnVehicle, Parcel_1.ParcelStatus.OutForDelivery].includes(parcel.status)) {
                throw new Error("Only parcels that are OnVehicle or OutForDelivery can be reverted");
            }
            parcel.trackingHistory.pop();
            const previousStatus = parcel.trackingHistory[parcel.trackingHistory.length - 1];
            parcel.status = previousStatus.status;
            const updatedParcel = yield this.parcelRepository.updateParcelSystem(parcel._id, parcel);
            return updatedParcel
                ? this.buildParcelStatusChangePayload(updatedParcel)
                : null;
        });
    }
    scanParcel(parcelId, driverId, action) {
        return __awaiter(this, void 0, void 0, function* () {
            const newStatus = action === Enums_1.ActionType.Local
                ? Parcel_1.ParcelStatus.OutForDelivery
                : Parcel_1.ParcelStatus.OnVehicle;
            return this.changeParcelStatus(parcelId, newStatus, driverId);
        });
    }
    submitDeliveryAction(_id, driverId, action) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`submitDeliveryAction called with _id: ${_id}, driverId: ${driverId}, action: ${action}`);
            const parcel = yield this.parcelRepository.getParcelById(_id);
            if (!parcel)
                throw new Error("Parcel not found");
            if ([
                Parcel_1.ParcelStatus.Delivered,
                Parcel_1.ParcelStatus.Rescheduled,
                Parcel_1.ParcelStatus.Cancelled,
            ].includes(parcel.status)) {
                throw new Error("Delivered, Rescheduled, or Cancelled parcels cannot be updated again");
            }
            let newStatus;
            switch (action) {
                case Enums_1.DeliveryAction.Deliver:
                    newStatus = Parcel_1.ParcelStatus.Delivered;
                    break;
                case Enums_1.DeliveryAction.Reschedule:
                    newStatus = Parcel_1.ParcelStatus.Rescheduled;
                    break;
                case Enums_1.DeliveryAction.Cancel:
                    newStatus = Parcel_1.ParcelStatus.Cancelled;
                    break;
                default:
                    throw new Error("Invalid action");
            }
            return this.changeParcelStatus(parcel._id.toString(), newStatus, driverId);
        });
    }
    markAllParcelsAsBorder(driverId) {
        return __awaiter(this, void 0, void 0, function* () {
            const parcels = yield this.parcelRepository.getParcelsByDriver(driverId, Enums_1.ActionType.LongHaul);
            const updatedParcels = [];
            for (const parcel of parcels) {
                if (parcel.status !== Parcel_1.ParcelStatus.Border) {
                    const updatedParcel = yield this.changeParcelStatus(parcel._id.toString(), Parcel_1.ParcelStatus.Border, driverId);
                    if (updatedParcel)
                        updatedParcels.push(updatedParcel);
                }
            }
            return updatedParcels;
        });
    }
    getMyInventory(driverId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.parcelRepository.getParcelsByDriver(driverId, type);
        });
    }
    getShipperInventory(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.parcelRepository.getParcelsByShipper(id);
        });
    }
    getParcelByParcelId(parcelId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.parcelRepository.getParcelByParcelId(parcelId);
        });
    }
    getParcelById(parcelId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.parcelRepository.getParcelById(parcelId);
        });
    }
}
exports.ParcelServiceMobile = ParcelServiceMobile;
