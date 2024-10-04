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
exports.ExchangeRateRepository = void 0;
const ExchangeRate_1 = require("../models/ExchangeRate");
class ExchangeRateRepository {
    constructor() {
        this.exchangeRateModel = (0, ExchangeRate_1.getExchangeRateModel)();
    }
    getAllExchangeRates(page, limit, query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const filter = query ? { currencyPair: new RegExp(query, "i") } : {};
                const exchangeRatesQuery = this.exchangeRateModel
                    .find(filter)
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .exec();
                const totalQuery = this.exchangeRateModel.countDocuments(filter).exec();
                const [exchangeRates, total] = yield Promise.all([
                    exchangeRatesQuery,
                    totalQuery,
                ]);
                return { exchangeRates: exchangeRates.map((rate) => rate.toObject()), total };
            }
            catch (error) {
                throw new Error(`Error getting exchange rates: ${error.message}`);
            }
        });
    }
    getExchangeRatesByDate(date) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const start = new Date(date);
                start.setUTCHours(0, 0, 0, 0);
                const end = new Date(date);
                end.setUTCHours(23, 59, 59, 999);
                const exchangeRates = yield this.exchangeRateModel.find({
                    timestamp: { $gte: start, $lte: end },
                });
                return exchangeRates.map((rate) => rate.toObject());
            }
            catch (error) {
                throw new Error(`Error getting exchange rates by date: ${error.message}`);
            }
        });
    }
    createExchangeRate(exchangeRate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newExchangeRate = yield this.exchangeRateModel.create(exchangeRate);
                return this.getExchangeRateById(newExchangeRate._id.toString());
            }
            catch (error) {
                throw new Error(`Error creating exchange rate: ${error.message}`);
            }
        });
    }
    updateExchangeRate(exchangeRateId, exchangeRateUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedExchangeRate = yield this.exchangeRateModel.findByIdAndUpdate(exchangeRateId, exchangeRateUpdate, { new: true });
                return updatedExchangeRate ? updatedExchangeRate.toObject() : null;
            }
            catch (error) {
                throw new Error(`Error updating exchange rate: ${error.message}`);
            }
        });
    }
    deleteExchangeRate(exchangeRateId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.exchangeRateModel.findByIdAndDelete(exchangeRateId);
                return true;
            }
            catch (error) {
                throw new Error(`Error deleting exchange rate: ${error.message}`);
            }
        });
    }
    getExchangeRateById(exchangeRateId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const exchangeRate = yield this.exchangeRateModel.findById(exchangeRateId);
                return exchangeRate ? exchangeRate.toObject() : null;
            }
            catch (error) {
                throw new Error(`Error getting exchange rate by ID: ${error.message}`);
            }
        });
    }
    getExchangeRateByCurrencyPair(currencyPair) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const exchangeRate = yield this.exchangeRateModel.findOne({
                    currencyPair,
                });
                return exchangeRate ? exchangeRate.toObject() : null;
            }
            catch (error) {
                throw new Error(`Error getting exchange rate by currency pair: ${error.message}`);
            }
        });
    }
}
exports.ExchangeRateRepository = ExchangeRateRepository;
