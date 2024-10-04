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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelRepository = void 0;
const Parcel_1 = require("../models/Parcel");
const Enums_1 = require("../models/Enums");
class ParcelRepository {
    constructor() {
        this.parcelModel = (0, Parcel_1.getParcelModel)();
    }
    createParcel(parcel) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newParcel = yield this.parcelModel.create(parcel);
                return this.getParcelById(newParcel._id.toString());
            }
            catch (error) {
                throw new Error(`Error creating parcel: ${error.message}`);
            }
        });
    }
    updateParcelSystem(parcelId, parcelUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedParcel = yield this.parcelModel
                    .findByIdAndUpdate(parcelId, parcelUpdate, { new: true })
                    .populate({
                    path: "sender.shipper",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                })
                    .populate({
                    path: "sender.guest.country",
                })
                    .populate({
                    path: "sender.guest.city",
                })
                    .populate({
                    path: "receiver.country",
                })
                    .populate({
                    path: "receiver.city",
                })
                    .populate({
                    path: "trackingHistory.driver",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                })
                    .populate({
                    path: "trackingHistory.warehouse",
                })
                    .populate({
                    path: "currentDriver",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                })
                    .populate("exchangeRate")
                    .populate({
                    path: "createdBy",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                });
                return updatedParcel ? updatedParcel.toObject() : null;
            }
            catch (error) {
                throw new Error(`Error updating parcel: ${error.message}`);
            }
        });
    }
    updateParcelUser(parcelId, parcelUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedParcel = yield this.parcelModel
                    .findByIdAndUpdate(parcelId, parcelUpdate, { new: true })
                    .populate({
                    path: "sender.shipper",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                })
                    .populate({
                    path: "sender.guest.country",
                })
                    .populate({
                    path: "sender.guest.city",
                })
                    .populate({
                    path: "receiver.country",
                })
                    .populate({
                    path: "receiver.city",
                })
                    .populate({
                    path: "trackingHistory.driver",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                })
                    .populate({
                    path: "trackingHistory.warehouse",
                })
                    .populate({
                    path: "currentDriver",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                })
                    .populate("exchangeRate")
                    .populate({
                    path: "createdBy",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                });
                return updatedParcel ? updatedParcel.toObject() : null;
            }
            catch (error) {
                throw new Error(`Error updating parcel: ${error.message}`);
            }
        });
    }
    deleteParcel(parcelId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.parcelModel.findByIdAndDelete(parcelId);
                return true;
            }
            catch (error) {
                throw new Error(`Error deleting parcel: ${error.message}`);
            }
        });
    }
    getParcelById(_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const parcel = yield this.parcelModel
                    .findById(_id)
                    .populate({
                    path: "sender.shipper",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                })
                    .populate({
                    path: "sender.guest.country",
                })
                    .populate({
                    path: "sender.guest.city",
                })
                    .populate({
                    path: "receiver.country",
                })
                    .populate({
                    path: "receiver.city",
                })
                    .populate({
                    path: "trackingHistory.driver",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                })
                    .populate({
                    path: "trackingHistory.warehouse",
                })
                    .populate({
                    path: "currentDriver",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                })
                    .populate("exchangeRate")
                    .populate({
                    path: "createdBy",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                });
                return parcel ? parcel.toObject() : null;
            }
            catch (error) {
                throw new Error(`Error getting parcel by ID: ${error.message}`);
            }
        });
    }
    getSimpleParcelByParcelId(parcelId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const parcel = yield this.parcelModel.findOne({ parcelId });
                return parcel;
            }
            catch (error) {
                throw new Error(`Error getting parcel by custom parcel ID: ${error.message}`);
            }
        });
    }
    getParcelByParcelId(parcelId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const parcel = yield this.parcelModel
                    .findOne({ parcelId })
                    .populate({
                    path: "sender.shipper",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                })
                    .populate({
                    path: "sender.guest.country",
                })
                    .populate({
                    path: "sender.guest.city",
                })
                    .populate({
                    path: "receiver.country",
                })
                    .populate({
                    path: "receiver.city",
                })
                    .populate({
                    path: "trackingHistory.driver",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                })
                    .populate({
                    path: "trackingHistory.warehouse",
                })
                    .populate({
                    path: "currentDriver",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                })
                    .populate("exchangeRate")
                    .populate({
                    path: "createdBy",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                });
                return parcel ? parcel.toObject() : null;
            }
            catch (error) {
                throw new Error(`Error getting parcel by custom parcel ID: ${error.message}`);
            }
        });
    }
    getParcelsByUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const parcels = yield this.parcelModel
                    .find({ createdById: userId })
                    .populate({
                    path: "sender.shipper",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                })
                    .populate({
                    path: "sender.guest.country",
                })
                    .populate({
                    path: "sender.guest.city",
                })
                    .populate({
                    path: "receiver.country",
                })
                    .populate({
                    path: "receiver.city",
                })
                    .populate({
                    path: "trackingHistory.driver",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                })
                    .populate({
                    path: "trackingHistory.warehouse",
                })
                    .populate({
                    path: "currentDriver",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                })
                    .populate("exchangeRate")
                    .populate({
                    path: "createdBy",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                });
                return parcels.map((parcel) => parcel.toObject());
            }
            catch (error) {
                throw new Error(`Error getting parcels by user: ${error.message}`);
            }
        });
    }
    getParcelsByDriver(driverId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let query = { currentDriverId: driverId };
                if (type === Enums_1.ActionType.Local) {
                    query.status = {
                        $in: [
                            Parcel_1.ParcelStatus.OutForDelivery,
                            Parcel_1.ParcelStatus.Delivered,
                            Parcel_1.ParcelStatus.Rescheduled,
                            Parcel_1.ParcelStatus.Cancelled,
                        ],
                    };
                }
                else if (type === Enums_1.ActionType.LongHaul) {
                    query.status = {
                        $in: [Parcel_1.ParcelStatus.OnVehicle, Parcel_1.ParcelStatus.Border],
                    };
                }
                const parcels = yield this.parcelModel
                    .find(query)
                    .populate({
                    path: "sender.shipper",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                })
                    .populate("sender.guest.country")
                    .populate("sender.guest.city")
                    .populate("receiver.country")
                    .populate("receiver.city")
                    .populate({
                    path: "trackingHistory.driver",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                })
                    .populate("trackingHistory.warehouse")
                    .populate({
                    path: "currentDriver",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                })
                    .populate("exchangeRate")
                    .populate({
                    path: "createdBy",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                });
                const mappedParcels = parcels.map((parcel) => parcel.toObject());
                return mappedParcels;
            }
            catch (error) {
                throw new Error(`Error getting parcels by driver: ${error.message}`);
            }
        });
    }
    getParcelsByShipper(shipperId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const parcels = yield this.parcelModel
                    .find({ "sender.shipper_id": shipperId })
                    .populate({
                    path: "sender.shipper",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                })
                    .populate({
                    path: "sender.guest.country",
                })
                    .populate({
                    path: "sender.guest.city",
                })
                    .populate({
                    path: "receiver.country",
                })
                    .populate({
                    path: "receiver.city",
                })
                    .populate({
                    path: "trackingHistory.driver",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                })
                    .populate({
                    path: "trackingHistory.warehouse",
                })
                    .populate({
                    path: "currentDriver",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                })
                    .populate("exchangeRate")
                    .populate({
                    path: "createdBy",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                });
                return parcels.map((parcel) => parcel.toObject());
            }
            catch (error) {
                throw new Error(`Error getting parcels by shipper: ${error.message}`);
            }
        });
    }
    getAllParcels(page, limit, query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const filter = query && typeof query === "object" ? query : {};
                const parcelsQuery = this.parcelModel
                    .find(filter)
                    .populate({
                    path: "sender.shipper",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                })
                    .populate({
                    path: "sender.guest.country",
                })
                    .populate({
                    path: "sender.guest.city",
                })
                    .populate({
                    path: "receiver.country",
                })
                    .populate({
                    path: "receiver.city",
                })
                    .populate({
                    path: "trackingHistory.driver",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                })
                    .populate({
                    path: "trackingHistory.warehouse",
                })
                    .populate({
                    path: "currentDriver",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                })
                    .populate("exchangeRate")
                    .populate({
                    path: "createdBy",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                })
                    .skip((page - 1) * limit)
                    .limit(limit);
                const totalQuery = this.parcelModel.countDocuments(filter);
                const [parcels, total] = yield Promise.all([parcelsQuery, totalQuery]);
                return {
                    parcels: parcels.map((parcel) => parcel.toObject()),
                    total,
                };
            }
            catch (error) {
                throw new Error(`Error getting all parcels: ${error.message}`);
            }
        });
    }
    getParcelsByIds(parcelIds) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.parcelModel.find({ _id: { $in: parcelIds } }).exec();
        });
    }
    updateParcelsSystem(parcels) {
        return __awaiter(this, void 0, void 0, function* () {
            const bulkOps = parcels.map((parcel) => ({
                updateOne: {
                    filter: { _id: parcel._id },
                    update: parcel,
                },
            }));
            yield this.parcelModel.bulkWrite(bulkOps);
            // Fetch the updated parcels
            const updatedParcelIds = parcels.map((parcel) => parcel._id);
            const updatedParcels = yield this.parcelModel
                .find({ _id: { $in: updatedParcelIds } })
                .populate({
                path: "sender.shipper",
                select: "-hashedPassword -salt",
                populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
            })
                .populate("sender.guest.country")
                .populate("sender.guest.city")
                .populate("receiver.country")
                .populate("receiver.city")
                .populate({
                path: "trackingHistory.driver",
                select: "-hashedPassword -salt",
                populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
            })
                .populate("trackingHistory.warehouse")
                .populate({
                path: "currentDriver",
                select: "-hashedPassword -salt",
                populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
            })
                .populate("exchangeRate")
                .populate({
                path: "createdBy",
                select: "-hashedPassword -salt",
                populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
            })
                .exec();
            return updatedParcels.map((parcel) => parcel.toObject());
        });
    }
    getParcelsByDateRange(startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const parcels = yield this.parcelModel
                    .find({
                    createdAt: { $gte: startDate, $lte: endDate },
                })
                    .populate({
                    path: "sender.shipper",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                })
                    .populate({
                    path: "sender.guest.country",
                })
                    .populate({
                    path: "sender.guest.city",
                })
                    .populate({
                    path: "receiver.country",
                })
                    .populate({
                    path: "receiver.city",
                })
                    .populate({
                    path: "trackingHistory.driver",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                })
                    .populate({
                    path: "trackingHistory.warehouse",
                })
                    .populate({
                    path: "currentDriver",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                })
                    .populate("exchangeRate")
                    .populate({
                    path: "createdBy",
                    select: "-hashedPassword -salt",
                    populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
                });
                return parcels.map((parcel) => parcel.toObject());
            }
            catch (error) {
                throw new Error(`Error fetching parcels by date range: ${error.message}`);
            }
        });
    }
    getMonthlyDataForDashboard(startOfMonth, endOfMonth) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const monthlyData = yield this.parcelModel.aggregate([
                    {
                        $unwind: "$trackingHistory",
                    },
                    {
                        $match: {
                            "trackingHistory.timestamp": {
                                $gte: startOfMonth,
                                $lte: endOfMonth,
                            },
                        },
                    },
                    {
                        $group: {
                            _id: {
                                day: { $dayOfMonth: "$trackingHistory.timestamp" },
                                status: "$trackingHistory.status",
                            },
                            count: { $sum: 1 },
                        },
                    },
                    {
                        $sort: { "_id.day": 1 },
                    },
                ]);
                const formattedData = this.formatMonthlyData(monthlyData, startOfMonth, endOfMonth);
                return formattedData;
            }
            catch (error) {
                console.error("Error fetching monthly data:", error);
                throw new Error("Failed to fetch monthly data");
            }
        });
    }
    formatMonthlyData(monthlyData, startOfMonth, endOfMonth) {
        const daysInMonth = new Date(endOfMonth.getFullYear(), endOfMonth.getMonth() + 1, 0).getDate();
        const formattedData = Array.from({ length: daysInMonth }, (_, i) => ({
            day: i + 1,
            delivered: 0,
            rescheduled: 0,
            warehouse: 0,
        }));
        monthlyData.forEach(({ _id, count }) => {
            const dayIndex = _id.day - 1; // Convert to zero-based index for array
            const status = _id.status;
            // Increment the count based on the status
            if (status === "Delivered") {
                formattedData[dayIndex].delivered += count;
            }
            else if (status === "Rescheduled") {
                formattedData[dayIndex].rescheduled += count;
            }
            else if (status === "In Warehouse") {
                formattedData[dayIndex].warehouse += count;
            }
        });
        return formattedData;
    }
    getTotalsForDashboard() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const totals = yield this.parcelModel.aggregate([
                    {
                        $group: {
                            _id: null,
                            onTheWay: {
                                $sum: {
                                    $cond: [{ $eq: ["$status", "OutForDelivery"] }, 1, 0],
                                },
                            },
                            delivered: {
                                $sum: {
                                    $cond: [{ $eq: ["$status", "Delivered"] }, 1, 0],
                                },
                            },
                            inWarehouse: {
                                $sum: {
                                    $cond: [{ $eq: ["$status", "In Warehouse"] }, 1, 0],
                                },
                            },
                        },
                    },
                ]);
                return totals.length > 0
                    ? totals[0]
                    : { onTheWay: 0, delivered: 0, inWarehouse: 0 };
            }
            catch (error) {
                console.error("Error fetching totals:", error);
                throw new Error("Failed to fetch totals");
            }
        });
    }
}
exports.ParcelRepository = ParcelRepository;
