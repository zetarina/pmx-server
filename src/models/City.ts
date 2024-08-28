import mongoose, { Document, Model, Schema } from "mongoose";
import { Country, countryModelName } from "./Country";

export interface City {
  _id?: mongoose.Types.ObjectId;
  name: string;
  country?: Country;
  countryId: mongoose.Types.ObjectId;
}

export const cityModelName: string = "Cities";

const citySchema = new Schema(
  {
    name: { type: String, required: true },
    countryId: {
      type: Schema.Types.ObjectId,
      ref: countryModelName,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: cityModelName,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

citySchema.virtual("country", {
  ref: countryModelName,
  localField: "countryId",
  foreignField: "_id",
  justOne: true,
});

export const CityModel: Model<City> =
  mongoose.models[cityModelName] ||
  mongoose.model<City>(cityModelName, citySchema);

export function getCityModel(): Model<City> {
  return CityModel;
}
