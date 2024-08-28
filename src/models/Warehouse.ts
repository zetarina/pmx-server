import mongoose, { Document, Model, Schema } from "mongoose";
import { City, cityModelName } from "./City";
import { Country, countryModelName } from "./Country";

export interface Warehouse {
  _id?: mongoose.Types.ObjectId;
  name: string;
  location: {
    address: string;
    cityId: mongoose.Types.ObjectId;
    city?: City;
    countryId: mongoose.Types.ObjectId;
    country?: Country;
  };
  capacity: number;
}

export const warehouseModelName: string = "Warehouses";

const warehouseSchema = new Schema(
  {
    name: { type: String, required: true },
    location: {
      address: { type: String, required: true },
      cityId: {
        type: Schema.Types.ObjectId,
        ref: cityModelName,
        required: true,
      },
      countryId: {
        type: Schema.Types.ObjectId,
        ref: countryModelName,
        required: true,
      },
    },
    capacity: { type: Number, required: true },
  },
  { timestamps: true, collection: warehouseModelName }
);

warehouseSchema.virtual("location.city", {
  ref: cityModelName,
  localField: "location.cityId",
  foreignField: "_id",
  justOne: true,
});

warehouseSchema.virtual("location.country", {
  ref: countryModelName,
  localField: "location.countryId",
  foreignField: "_id",
  justOne: true,
});

warehouseSchema.set("toObject", { virtuals: true });
warehouseSchema.set("toJSON", { virtuals: true });

export const WarehouseModel: Model<Warehouse> =
  mongoose.models[warehouseModelName] ||
  mongoose.model<Warehouse>(warehouseModelName, warehouseSchema);

export function getWarehouseModel(): Model<Warehouse> {
  return WarehouseModel;
}
