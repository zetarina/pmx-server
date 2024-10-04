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
const CityRepository_1 = require("../repositories/CityRepository");
const auth_1 = require("../middlewares/auth");
const permissions_1 = require("../types/permissions");
const Events_1 = require("../models/Events");
const app_1 = require("../app");
const error_1 = require("../error");
const router = express_1.default.Router();
const cityRepository = new CityRepository_1.CityRepository();
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, query = "" } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const { cities, total } = yield cityRepository.getAllCities(pageNumber, limitNumber, query);
        res.status(200).json({ cities, total });
    }
    catch (error) {
        (0, error_1.handleError)(res, error);
    }
}));
router.get("/:cityId", (0, auth_1.authorize)(permissions_1.PermissionsList.ReadCity), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cityId } = req.params;
        const city = yield cityRepository.getCityById(cityId);
        res.status(200).json(city);
    }
    catch (error) {
        (0, error_1.handleError)(res, error);
    }
}));
router.get("/country/:countryId", (0, auth_1.authorize)(permissions_1.PermissionsList.ReadCity), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { countryId } = req.params;
        const { page = "1", limit = "10", query = "" } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const { cities, total } = yield cityRepository.getCitiesByCountry(countryId, pageNumber, limitNumber, query);
        res.status(200).json({ cities, total });
    }
    catch (error) {
        (0, error_1.handleError)(res, error);
    }
}));
router.post("/", (0, auth_1.authorize)(permissions_1.PermissionsList.CreateCity), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const city = req.body;
        const newCity = yield cityRepository.createCity(city);
        res.status(201).json(newCity);
        app_1.io.emit(Events_1.CityEvent.Created, newCity);
    }
    catch (error) {
        (0, error_1.handleError)(res, error);
    }
}));
router.put("/:cityId", (0, auth_1.authorize)(permissions_1.PermissionsList.UpdateCity), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cityId } = req.params;
        const cityUpdate = req.body;
        const updatedCity = yield cityRepository.updateCity(cityId, cityUpdate);
        res.status(200).json(updatedCity);
        app_1.io.emit(Events_1.CityEvent.Updated, updatedCity);
    }
    catch (error) {
        (0, error_1.handleError)(res, error);
    }
}));
router.delete("/:cityId", (0, auth_1.authorize)(permissions_1.PermissionsList.DeleteCity), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cityId } = req.params;
        yield cityRepository.deleteCity(cityId);
        res.status(200).json({ message: "City deleted successfully" });
        app_1.io.emit(Events_1.CityEvent.Deleted, cityId);
    }
    catch (error) {
        (0, error_1.handleError)(res, error);
    }
}));
exports.default = router;
