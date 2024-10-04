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
exports.CityRepository = void 0;
const City_1 = require("../models/City");
class CityRepository {
    constructor() {
        this.cityModel = (0, City_1.getCityModel)();
    }
    getAllCities(page, limit, query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const citiesQuery = this.cityModel
                    .find({ name: new RegExp(query, "i") }).populate("country")
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .exec();
                const totalQuery = this.cityModel
                    .countDocuments({ name: new RegExp(query, "i") })
                    .exec();
                const [cities, total] = yield Promise.all([citiesQuery, totalQuery]);
                return { cities: cities.map((city) => city.toObject()), total };
            }
            catch (error) {
                console.error("Error getting cities:", error);
                throw new Error(`Error getting cities: ${error.message}`);
            }
        });
    }
    createCity(city) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newCity = yield this.cityModel.create(city);
                return this.getCityById(newCity._id.toString());
            }
            catch (error) {
                throw new Error(`Error creating city: ${error.message}`);
            }
        });
    }
    updateCity(cityId, cityUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedCity = yield this.cityModel
                    .findByIdAndUpdate(cityId, cityUpdate, { new: true })
                    .populate("country");
                return updatedCity ? updatedCity.toObject() : null;
            }
            catch (error) {
                throw new Error(`Error updating city: ${error.message}`);
            }
        });
    }
    deleteCity(cityId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.cityModel.findByIdAndDelete(cityId).populate("country");
                return true;
            }
            catch (error) {
                throw new Error(`Error deleting city: ${error.message}`);
            }
        });
    }
    getCityById(cityId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const city = yield this.cityModel.findById(cityId).populate("country");
                return city ? city.toObject() : null;
            }
            catch (error) {
                throw new Error(`Error getting city by ID: ${error.message}`);
            }
        });
    }
    getCitiesByCountry(countryId, page, limit, query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cities = yield this.cityModel
                    .find({ countryId, name: new RegExp(query, "i") })
                    .populate("country")
                    .skip((page - 1) * limit)
                    .limit(limit);
                const total = yield this.cityModel.countDocuments({
                    countryId,
                    name: new RegExp(query, "i"),
                });
                return {
                    cities: cities.map((city) => city.toObject()),
                    total,
                };
            }
            catch (error) {
                throw new Error(`Error getting cities by country: ${error.message}`);
            }
        });
    }
    getCityByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const city = yield this.cityModel.findOne({ name }).populate("country");
                return city ? city.toObject() : null;
            }
            catch (error) {
                throw new Error(`Error getting city by name: ${error.message}`);
            }
        });
    }
}
exports.CityRepository = CityRepository;
