"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParcelModel = exports.ParcelModel = exports.parcelModelName = exports.TaxType = exports.DiscountType = exports.SenderType = exports.PaymentStatus = exports.ParcelStatus = exports.PaymentType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const Country_1 = require("./Country");
const City_1 = require("./City");
const Warehouse_1 = require("./Warehouse");
const ExchangeRate_1 = require("./ExchangeRate");
const User_1 = require("./User");
const BasicContactInfo_1 = require("./BasicContactInfo");
var PaymentType;
(function (PaymentType) {
    PaymentType["PayBySender"] = "Pay by Sender";
    PaymentType["PayByRecipients"] = "Pay by Recipients";
    PaymentType["CreditTerms"] = "B2B (Credit Terms)";
})(PaymentType || (exports.PaymentType = PaymentType = {}));
var ParcelStatus;
(function (ParcelStatus) {
    ParcelStatus["ParcelCreated"] = "Parcel Created";
    ParcelStatus["InWarehouse"] = "In Warehouse";
    ParcelStatus["OutForDelivery"] = "Out for Delivery";
    ParcelStatus["OnVehicle"] = "On Vehicle";
    ParcelStatus["Border"] = "Border";
    ParcelStatus["Delivered"] = "Delivered";
    ParcelStatus["Rescheduled"] = "Rescheduled";
    ParcelStatus["Cancelled"] = "Cancelled";
    ParcelStatus["Completed"] = "Completed";
})(ParcelStatus || (exports.ParcelStatus = ParcelStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["Pending"] = "Pending";
    PaymentStatus["Completed"] = "Completed";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var SenderType;
(function (SenderType) {
    SenderType["Shipper"] = "Shipper";
    SenderType["Guest"] = "Guest";
})(SenderType || (exports.SenderType = SenderType = {}));
var DiscountType;
(function (DiscountType) {
    DiscountType["Flat"] = "Flat";
    DiscountType["Percentage"] = "Percentage";
})(DiscountType || (exports.DiscountType = DiscountType = {}));
var TaxType;
(function (TaxType) {
    TaxType["Flat"] = "Flat";
    TaxType["Percentage"] = "Percentage";
})(TaxType || (exports.TaxType = TaxType = {}));
exports.parcelModelName = "Parcels";
const parcelSchema = new mongoose_1.Schema({
    parcelId: { type: String, required: true, unique: true },
    sender: {
        type: { type: String, enum: Object.values(SenderType), required: true },
        shipper_id: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: User_1.userModelName,
            required: false,
        },
        guest: {
            name: { type: String, required: false },
            phoneNumber: { type: String, required: false },
            cityId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: City_1.cityModelName,
                required: false,
            },
            countryId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: Country_1.countryModelName,
                required: false,
            },
            address: { type: String, required: false },
            zip: { type: String, required: false },
        },
    },
    receiver: Object.assign({ name: { type: String, required: true } }, BasicContactInfo_1.BasicContactInfoSchemaDefinition),
    deliveryFees: { type: Number, required: true },
    weight: { type: Number, required: true },
    size: { type: Number, required: true },
    discountValue: { type: Number },
    discountType: { type: String, enum: Object.values(DiscountType) },
    taxValue: { type: Number },
    taxType: { type: String, enum: Object.values(TaxType) },
    paymentType: {
        type: String,
        enum: Object.values(PaymentType),
        required: true,
    },
    creditDueDate: { type: Date },
    status: {
        type: String,
        enum: Object.values(ParcelStatus),
        default: ParcelStatus.ParcelCreated,
    },
    trackingHistory: [
        {
            status: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
            driverId: { type: mongoose_1.Schema.Types.ObjectId, ref: User_1.userModelName },
            warehouseId: { type: mongoose_1.Schema.Types.ObjectId, ref: Warehouse_1.warehouseModelName },
        },
    ],
    currentDriverId: { type: mongoose_1.Schema.Types.ObjectId, ref: User_1.userModelName },
    remark: String,
    exchangeRateId: { type: mongoose_1.Schema.Types.ObjectId, ref: ExchangeRate_1.exchangeRateModelName },
    paymentStatus: {
        type: String,
        enum: Object.values(PaymentStatus),
        default: PaymentStatus.Pending,
    },
    createdById: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: User_1.userModelName,
        required: true,
    },
}, { timestamps: true, collection: exports.parcelModelName });
parcelSchema.virtual("subTotal").get(function () {
    return this.deliveryFees;
});
parcelSchema.virtual("totalFee").get(function () {
    let total = this.deliveryFees;
    if (this.discountType === DiscountType.Percentage && this.discountValue) {
        total -= (total * this.discountValue) / 100;
    }
    else if (this.discountType === DiscountType.Flat && this.discountValue) {
        total -= this.discountValue;
    }
    if (this.taxType === TaxType.Percentage && this.taxValue) {
        total += (total * this.taxValue) / 100;
    }
    else if (this.taxType === TaxType.Flat && this.taxValue) {
        total += this.taxValue;
    }
    return total;
});
parcelSchema.virtual("totalFeeIfPaid").get(function () {
    let total = this.deliveryFees;
    if (this.discountType === DiscountType.Percentage && this.discountValue) {
        total -= (total * this.discountValue) / 100;
    }
    else if (this.discountType === DiscountType.Flat && this.discountValue) {
        total -= this.discountValue;
    }
    if (this.taxType === TaxType.Percentage && this.taxValue) {
        total += (total * this.taxValue) / 100;
    }
    else if (this.taxType === TaxType.Flat && this.taxValue) {
        total += this.taxValue;
    }
    return this.paymentStatus === PaymentStatus.Completed ? 0 : total;
});
parcelSchema.virtual("sender.guest.country", {
    ref: Country_1.countryModelName,
    localField: "sender.guest.countryId",
    foreignField: "_id",
    justOne: true,
});
parcelSchema.virtual("sender.guest.city", {
    ref: City_1.cityModelName,
    localField: "sender.guest.cityId",
    foreignField: "_id",
    justOne: true,
});
parcelSchema.virtual("sender.shipper", {
    ref: User_1.userModelName,
    localField: "sender.shipper_id",
    foreignField: "_id",
    justOne: true,
});
parcelSchema.virtual("receiver.country", {
    ref: Country_1.countryModelName,
    localField: "receiver.countryId",
    foreignField: "_id",
    justOne: true,
});
parcelSchema.virtual("receiver.city", {
    ref: City_1.cityModelName,
    localField: "receiver.cityId",
    foreignField: "_id",
    justOne: true,
});
parcelSchema.virtual("currentDriver", {
    ref: User_1.userModelName,
    localField: "currentDriverId",
    foreignField: "_id",
    justOne: true,
    options: { select: "username email city country" },
});
parcelSchema.virtual("createdBy", {
    ref: User_1.userModelName,
    localField: "createdById",
    foreignField: "_id",
    justOne: true,
    options: { select: "username email city country" },
});
parcelSchema.virtual("trackingHistory.driver", {
    ref: User_1.userModelName,
    localField: "trackingHistory.driverId",
    foreignField: "_id",
    justOne: true,
    options: { select: "username email city country" },
});
parcelSchema.virtual("trackingHistory.warehouse", {
    ref: Warehouse_1.warehouseModelName,
    localField: "trackingHistory.warehouseId",
    foreignField: "_id",
    justOne: true,
});
parcelSchema.virtual("exchangeRate", {
    ref: ExchangeRate_1.exchangeRateModelName,
    localField: "exchangeRateId",
    foreignField: "_id",
    justOne: true,
});
parcelSchema.set("toObject", { virtuals: true });
parcelSchema.set("toJSON", { virtuals: true });
exports.ParcelModel = mongoose_1.default.models[exports.parcelModelName] ||
    mongoose_1.default.model(exports.parcelModelName, parcelSchema);
function getParcelModel() {
    return exports.ParcelModel;
}
exports.getParcelModel = getParcelModel;
