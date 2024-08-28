import mongoose, { Schema } from "mongoose";
import { Country } from "./Country";
import { City } from "./City";

export interface BasicContactInfo {
  phoneNumber: string;
  cityId: mongoose.Types.ObjectId;
  city?: City;
  countryId: mongoose.Types.ObjectId;
  country?: Country;
  address: string;
  zip: string;
}
export const BasicContactInfoSchemaDefinition = {
  phoneNumber: { type: String, required: true },
  cityId: { type: Schema.Types.ObjectId, ref: "City", required: true },
  countryId: { type: Schema.Types.ObjectId, ref: "Country", required: true },
  address: { type: String, required: true },
  zip: { type: String, required: true },
};
