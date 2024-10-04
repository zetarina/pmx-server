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
const express_1 = __importDefault(require("express"));
const CountryRepository_1 = require("../repositories/CountryRepository");
const auth_1 = require("../middlewares/auth");
const permissions_1 = require("../types/permissions");
const Events_1 = require("../models/Events");
const app_1 = require("../app");
const error_1 = require("../error");
const router = express_1.default.Router();
const countryRepository = new CountryRepository_1.CountryRepository();
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, query = "" } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const { countries, total } = yield countryRepository.getAllCountries(pageNumber, limitNumber, query);
        res.status(200).json({ countries, total });
    }
    catch (error) {
        (0, error_1.handleError)(res, error);
    }
}));
router.get("/:countryId", (0, auth_1.authorize)(permissions_1.PermissionsList.ReadCountry), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { countryId } = req.params;
        const country = yield countryRepository.getCountryById(countryId);
        res.status(200).json(country);
    }
    catch (error) {
        (0, error_1.handleError)(res, error);
    }
}));
router.post("/", (0, auth_1.authorize)(permissions_1.PermissionsList.CreateCountry), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const country = req.body;
        const newCountry = yield countryRepository.createCountry(country);
        res.status(201).json(newCountry);
        app_1.io.emit(Events_1.CountryEvent.Created, newCountry);
    }
    catch (error) {
        (0, error_1.handleError)(res, error);
    }
}));
router.put("/:countryId", (0, auth_1.authorize)(permissions_1.PermissionsList.UpdateCountry), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { countryId } = req.params;
        const countryUpdate = req.body;
        const updatedCountry = yield countryRepository.updateCountry(countryId, countryUpdate);
        res.status(200).json(updatedCountry);
        app_1.io.emit(Events_1.CountryEvent.Updated, updatedCountry);
    }
    catch (error) {
        (0, error_1.handleError)(res, error);
    }
}));
router.delete("/:countryId", (0, auth_1.authorize)(permissions_1.PermissionsList.DeleteCountry), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { countryId } = req.params;
        yield countryRepository.deleteCountry(countryId);
        res.status(200).json({ message: "Country deleted successfully" });
        app_1.io.emit(Events_1.CountryEvent.Deleted, countryId);
    }
    catch (error) {
        (0, error_1.handleError)(res, error);
    }
}));
router.get("/code/:code", (0, auth_1.authorize)(permissions_1.PermissionsList.ReadCountry), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code } = req.params;
        const country = yield countryRepository.getCountryByCode(code);
        res.status(200).json(country);
    }
    catch (error) {
        (0, error_1.handleError)(res, error);
    }
}));
exports.default = router;
