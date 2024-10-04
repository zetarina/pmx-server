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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSVRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Country_1 = require("../models/Country");
const City_1 = require("../models/City");
const Warehouse_1 = require("../models/Warehouse");
const User_1 = require("../models/User");
const Parcel_1 = require("../models/Parcel");
const json2csv_1 = require("json2csv");
class CSVRepository {
    constructor() {
        this.countryModel = (0, Country_1.getCountryModel)();
        this.cityModel = (0, City_1.getCityModel)();
        this.warehouseModel = (0, Warehouse_1.getWarehouseModel)();
        this.userModel = (0, User_1.getUserModel)();
        this.parcelModel = (0, Parcel_1.getParcelModel)();
    }
    isValidObjectId(id) {
        return mongoose_1.default.Types.ObjectId.isValid(id);
    }
    generateSampleCSV() {
        const fields = [
            "Receiver Name",
            "Receiver Phone Number",
            "Receiver Address",
            "Receiver City",
            "Receiver Country",
            "Receiver Zip",
            "Delivery Fees",
            "Weight",
            "Size",
            "Discount Value",
            "Tax Value",
            "Payment Type",
            "Remark",
        ];
        const sampleData = [{}];
        const json2csvParser = new json2csv_1.Parser({ fields });
        return json2csvParser.parse(sampleData);
    }
    validateEntities(uniqueValues) {
        return __awaiter(this, void 0, void 0, function* () {
            const countryNames = uniqueValues.countries.filter((idOrName) => !this.isValidObjectId(idOrName));
            const cityNames = uniqueValues.cities.filter((idOrName) => !this.isValidObjectId(idOrName));
            const validatedCountries = yield this.countryModel
                .find({
                $or: [
                    { _id: { $in: uniqueValues.countries.filter(this.isValidObjectId) } },
                    {
                        name: {
                            $in: countryNames.map((name) => new RegExp(`^${name}$`, "i")),
                        },
                    },
                ],
            })
                .exec();
            const validatedCities = yield this.cityModel
                .find({
                $or: [
                    { _id: { $in: uniqueValues.cities.filter(this.isValidObjectId) } },
                    {
                        name: {
                            $in: cityNames.map((name) => new RegExp(`^${name}$`, "i")),
                        },
                    },
                ],
            })
                .exec();
            return {
                countries: validatedCountries,
                cities: validatedCities,
            };
        });
    }
    validateShipper(shipperId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isValidObjectId(shipperId))
                return null;
            return this.userModel.findById(shipperId).exec();
        });
    }
    validateWarehouse(warehouseId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isValidObjectId(warehouseId))
                return null;
            return this.warehouseModel.findById(warehouseId).exec();
        });
    }
    isParcelIdExists(parcelId) {
        return __awaiter(this, void 0, void 0, function* () {
            const parcel = yield this.parcelModel.findOne({ parcelId }).exec();
            return !!parcel;
        });
    }
    createParcels(parcels) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.parcelModel.insertMany(parcels);
        });
    }
}
exports.CSVRepository = CSVRepository;
