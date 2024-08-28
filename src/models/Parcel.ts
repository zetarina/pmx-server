import mongoose, { Document, Model, Schema } from "mongoose";
import { countryModelName, Country } from "./Country";
import { cityModelName, City } from "./City";
import { Warehouse, warehouseModelName } from "./Warehouse";
import { ExchangeRate, exchangeRateModelName } from "./ExchangeRate";
import { User, userModelName } from "./User";
import {
  BasicContactInfo,
  BasicContactInfoSchemaDefinition,
} from "./BasicContactInfo";

export enum PaymentType {
  PayBySender = "Pay by Sender",
  PayByRecipients = "Pay by Recipients",
  CreditTerms = "B2B (Credit Terms)",
}

export enum ParcelStatus {
  ParcelCreated = "Parcel Created",

  InWarehouse = "In Warehouse",

  OutForDelivery = "Out for Delivery",
  OnVehicle = "On Vehicle",

  Border = "Border",

  Delivered = "Delivered",
  Rescheduled = "Rescheduled",
  Cancelled = "Cancelled",

  Completed = "Completed",
}

export enum PaymentStatus {
  Pending = "Pending",
  Completed = "Completed",
}

export enum SenderType {
  Shipper = "Shipper",
  Guest = "Guest",
}

export enum DiscountType {
  Flat = "Flat",
  Percentage = "Percentage",
}

export enum TaxType {
  Flat = "Flat",
  Percentage = "Percentage",
}

export interface Guest extends BasicContactInfo {
  name: string;
}

export interface Receiver extends BasicContactInfo {
  name: string;
}

export interface Sender {
  type: SenderType;
  shipper_id?: mongoose.Types.ObjectId;
  guest?: Guest;
  shipper?: User;
}

export interface TrackingHistory {
  status: string;
  timestamp: Date;
  driverId?: mongoose.Types.ObjectId;
  driver?: User;
  warehouseId?: mongoose.Types.ObjectId;
  warehouse?: Warehouse;
}

export interface Parcel {
  _id?: mongoose.Types.ObjectId;
  parcelId: string;
  sender: Sender;
  receiver: Receiver;
  deliveryFees: number;
  weight: number;
  size: number;
  discountValue?: number;
  discountType?: DiscountType;
  taxValue?: number;
  taxType?: TaxType;
  paymentType: PaymentType;
  creditDueDate?: Date;
  status: ParcelStatus;
  trackingHistory: TrackingHistory[];
  currentDriverId?: mongoose.Types.ObjectId;
  currentDriver?: User;
  remark?: string;
  exchangeRateId?: mongoose.Types.ObjectId;
  exchangeRate?: ExchangeRate;
  paymentStatus: PaymentStatus;
  createdById: mongoose.Types.ObjectId;
  createdBy?: User;
  createdAt?: Date;

  subTotal?: number; 
  totalFee?: number; 
  totalFeeIfPaid?: number;
}

export const parcelModelName: string = "Parcels";

const parcelSchema = new Schema(
  {
    parcelId: { type: String, required: true, unique: true },
    sender: {
      type: { type: String, enum: Object.values(SenderType), required: true },
      shipper_id: {
        type: Schema.Types.ObjectId,
        ref: userModelName,
        required: false,
      },
      guest: {
        name: { type: String, required: false },
        phoneNumber: { type: String, required: false },
        cityId: {
          type: Schema.Types.ObjectId,
          ref: cityModelName,
          required: false,
        },
        countryId: {
          type: Schema.Types.ObjectId,
          ref: countryModelName,
          required: false,
        },
        address: { type: String, required: false },
        zip: { type: String, required: false },
      },
    },
    receiver: {
      name: { type: String, required: true },
      ...BasicContactInfoSchemaDefinition,
    },
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
        driverId: { type: Schema.Types.ObjectId, ref: userModelName },
        warehouseId: { type: Schema.Types.ObjectId, ref: warehouseModelName },
      },
    ],
    currentDriverId: { type: Schema.Types.ObjectId, ref: userModelName },
    remark: String,
    exchangeRateId: { type: Schema.Types.ObjectId, ref: exchangeRateModelName },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.Pending,
    },
    createdById: {
      type: Schema.Types.ObjectId,
      ref: userModelName,
      required: true,
    },
  },
  { timestamps: true, collection: parcelModelName }
);

parcelSchema.virtual("subTotal").get(function (this: Parcel) {
  return this.deliveryFees;
});

parcelSchema.virtual("totalFee").get(function (this: Parcel) {
  let total = this.deliveryFees;

  if (this.discountType === DiscountType.Percentage && this.discountValue) {
    total -= (total * this.discountValue) / 100;
  } else if (this.discountType === DiscountType.Flat && this.discountValue) {
    total -= this.discountValue;
  }

  if (this.taxType === TaxType.Percentage && this.taxValue) {
    total += (total * this.taxValue) / 100;
  } else if (this.taxType === TaxType.Flat && this.taxValue) {
    total += this.taxValue;
  }

  return total;
});

parcelSchema.virtual("totalFeeIfPaid").get(function (this: Parcel) {
  let total = this.deliveryFees;

  if (this.discountType === DiscountType.Percentage && this.discountValue) {
    total -= (total * this.discountValue) / 100;
  } else if (this.discountType === DiscountType.Flat && this.discountValue) {
    total -= this.discountValue;
  }

  if (this.taxType === TaxType.Percentage && this.taxValue) {
    total += (total * this.taxValue) / 100;
  } else if (this.taxType === TaxType.Flat && this.taxValue) {
    total += this.taxValue;
  }

  return this.paymentStatus === PaymentStatus.Completed ? 0 : total;
});

parcelSchema.virtual("sender.guest.country", {
  ref: countryModelName,
  localField: "sender.guest.countryId",
  foreignField: "_id",
  justOne: true,
});

parcelSchema.virtual("sender.guest.city", {
  ref: cityModelName,
  localField: "sender.guest.cityId",
  foreignField: "_id",
  justOne: true,
});

parcelSchema.virtual("sender.shipper", {
  ref: userModelName,
  localField: "sender.shipper_id",
  foreignField: "_id",
  justOne: true,
});

parcelSchema.virtual("receiver.country", {
  ref: countryModelName,
  localField: "receiver.countryId",
  foreignField: "_id",
  justOne: true,
});

parcelSchema.virtual("receiver.city", {
  ref: cityModelName,
  localField: "receiver.cityId",
  foreignField: "_id",
  justOne: true,
});

parcelSchema.virtual("currentDriver", {
  ref: userModelName,
  localField: "currentDriverId",
  foreignField: "_id",
  justOne: true,
  options: { select: "username email city country" },
});

parcelSchema.virtual("createdBy", {
  ref: userModelName,
  localField: "createdById",
  foreignField: "_id",
  justOne: true,
  options: { select: "username email city country" },
});

parcelSchema.virtual("trackingHistory.driver", {
  ref: userModelName,
  localField: "trackingHistory.driverId",
  foreignField: "_id",
  justOne: true,
  options: { select: "username email city country" },
});

parcelSchema.virtual("trackingHistory.warehouse", {
  ref: warehouseModelName,
  localField: "trackingHistory.warehouseId",
  foreignField: "_id",
  justOne: true,
});

parcelSchema.virtual("exchangeRate", {
  ref: exchangeRateModelName,
  localField: "exchangeRateId",
  foreignField: "_id",
  justOne: true,
});

parcelSchema.set("toObject", { virtuals: true });
parcelSchema.set("toJSON", { virtuals: true });

export const ParcelModel: Model<Parcel> =
  mongoose.models[parcelModelName] ||
  mongoose.model<Parcel>(parcelModelName, parcelSchema);

export function getParcelModel(): Model<Parcel> {
  return ParcelModel;
}
