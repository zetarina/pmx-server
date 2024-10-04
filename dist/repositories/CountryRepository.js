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
exports.CountryRepository = void 0;
const Country_1 = require("../models/Country");
class CountryRepository {
    constructor() {
        this.countryModel = (0, Country_1.getCountryModel)();
    }
    getAllCountries(page, limit, query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const countriesQuery = this.countryModel
                    .find({ name: new RegExp(query, "i") })
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .exec();
                const totalQuery = this.countryModel
                    .countDocuments({ name: new RegExp(query, "i") })
                    .exec();
                const [countries, total] = yield Promise.all([countriesQuery, totalQuery]);
                return { countries: countries.map((country) => country.toObject()), total };
            }
            catch (error) {
                console.error("Error getting countries:", error);
                throw new Error(`Error getting countries: ${error.message}`);
            }
        });
    }
    createCountry(country) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newCountry = yield this.countryModel.create(country);
                return this.getCountryById(newCountry._id.toString());
            }
            catch (error) {
                throw new Error(`Error creating country: ${error.message}`);
            }
        });
    }
    updateCountry(countryId, countryUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedCountry = yield this.countryModel.findByIdAndUpdate(countryId, countryUpdate, { new: true });
                return updatedCountry ? updatedCountry.toObject() : null;
            }
            catch (error) {
                throw new Error(`Error updating country: ${error.message}`);
            }
        });
    }
    deleteCountry(countryId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.countryModel.findByIdAndDelete(countryId);
                return true;
            }
            catch (error) {
                throw new Error(`Error deleting country: ${error.message}`);
            }
        });
    }
    getCountryById(countryId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const country = yield this.countryModel.findById(countryId);
                return country ? country.toObject() : null;
            }
            catch (error) {
                throw new Error(`Error getting country by ID: ${error.message}`);
            }
        });
    }
    getCountryByCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const country = yield this.countryModel.findOne({ code });
                return country ? country.toObject() : null;
            }
            catch (error) {
                throw new Error(`Error getting country by code: ${error.message}`);
            }
        });
    }
}
exports.CountryRepository = CountryRepository;
