import mongoose, { Document, Model, Schema } from "mongoose";

export interface ExchangeRate {
  _id?: mongoose.Types.ObjectId;
  currencyPair: string;
  rate: number;
  timestamp: Date;
}
export const exchangeRateModelName: string = "ExchangeRates";
const exchangeRateSchema = new Schema(
  {
    currencyPair: { type: String, required: true },
    rate: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: exchangeRateModelName }
);

export const ExchangeRateModel: Model<ExchangeRate> =
  mongoose.models[exchangeRateModelName] ||
  mongoose.model<ExchangeRate>(exchangeRateModelName, exchangeRateSchema);

export function getExchangeRateModel(): Model<ExchangeRate> {
  return ExchangeRateModel;
}
