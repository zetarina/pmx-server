// ExchangeRateRepository.ts
import { Model } from "mongoose";
import { ExchangeRate, getExchangeRateModel } from "../models/ExchangeRate";

export class ExchangeRateRepository {
  private exchangeRateModel: Model<ExchangeRate>;

  constructor() {
    this.exchangeRateModel = getExchangeRateModel();
  }
  async getAllExchangeRates(
    page: number,
    limit: number,
    query: string
  ): Promise<{ exchangeRates: ExchangeRate[]; total: number }> {
    try {
      const filter = query ? { currencyPair: new RegExp(query, "i") } : {};

      const exchangeRatesQuery = this.exchangeRateModel
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

      const totalQuery = this.exchangeRateModel.countDocuments(filter).exec();

      const [exchangeRates, total] = await Promise.all([
        exchangeRatesQuery,
        totalQuery,
      ]);

      return { exchangeRates: exchangeRates.map((rate) => rate.toObject()), total };
    } catch (error: any) {
      throw new Error(`Error getting exchange rates: ${error.message}`);
    }
  }
  async getExchangeRatesByDate(date: Date): Promise<ExchangeRate[]> {
    try {
      const start = new Date(date);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setUTCHours(23, 59, 59, 999);

      const exchangeRates = await this.exchangeRateModel.find({
        timestamp: { $gte: start, $lte: end },
      });

      return exchangeRates.map((rate) => rate.toObject());
    } catch (error: any) {
      throw new Error(`Error getting exchange rates by date: ${error.message}`);
    }
  }

  async createExchangeRate(
    exchangeRate: ExchangeRate
  ): Promise<ExchangeRate | null> {
    try {
      const newExchangeRate = await this.exchangeRateModel.create(exchangeRate);
      return this.getExchangeRateById(newExchangeRate._id.toString());
    } catch (error: any) {
      throw new Error(`Error creating exchange rate: ${error.message}`);
    }
  }

  async updateExchangeRate(
    exchangeRateId: string,
    exchangeRateUpdate: Partial<ExchangeRate>
  ): Promise<ExchangeRate | null> {
    try {
      const updatedExchangeRate =
        await this.exchangeRateModel.findByIdAndUpdate(
          exchangeRateId,
          exchangeRateUpdate,
          { new: true }
        );
      return updatedExchangeRate ? updatedExchangeRate.toObject() : null;
    } catch (error: any) {
      throw new Error(`Error updating exchange rate: ${error.message}`);
    }
  }

  async deleteExchangeRate(exchangeRateId: string): Promise<boolean> {
    try {
      await this.exchangeRateModel.findByIdAndDelete(exchangeRateId);
      return true;
    } catch (error: any) {
      throw new Error(`Error deleting exchange rate: ${error.message}`);
    }
  }

  async getExchangeRateById(
    exchangeRateId: string
  ): Promise<ExchangeRate | null> {
    try {
      const exchangeRate = await this.exchangeRateModel.findById(
        exchangeRateId
      );
      return exchangeRate ? exchangeRate.toObject() : null;
    } catch (error: any) {
      throw new Error(`Error getting exchange rate by ID: ${error.message}`);
    }
  }

  async getExchangeRateByCurrencyPair(
    currencyPair: string
  ): Promise<ExchangeRate | null> {
    try {
      const exchangeRate = await this.exchangeRateModel.findOne({
        currencyPair,
      });
      return exchangeRate ? exchangeRate.toObject() : null;
    } catch (error: any) {
      throw new Error(
        `Error getting exchange rate by currency pair: ${error.message}`
      );
    }
  }
}
