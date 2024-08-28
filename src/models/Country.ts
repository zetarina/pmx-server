import mongoose, { Document, Model, Schema } from "mongoose";

export interface Country {
  _id?: mongoose.Types.ObjectId;
  code: string;
  name: string;
}
export const countryModelName: string = "Countries";
const countrySchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
  },
  { timestamps: true, collection: countryModelName }
);

export const CountryModel: Model<Country> =
  mongoose.models[countryModelName] ||
  mongoose.model<Country>(countryModelName, countrySchema);

export function getCountryModel(): Model<Country> {
  return CountryModel;
}
