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
const ExchangeRateRepository_1 = require("../repositories/ExchangeRateRepository");
const auth_1 = require("../middlewares/auth");
const permissions_1 = require("../types/permissions");
const Events_1 = require("../models/Events");
const app_1 = require("../app");
const router = express_1.default.Router();
const exchangeRateRepository = new ExchangeRateRepository_1.ExchangeRateRepository();
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, query = "" } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const { exchangeRates, total } = yield exchangeRateRepository.getAllExchangeRates(pageNumber, limitNumber, query);
        res.status(200).json({ exchangeRates, total });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
router.get("/:exchangeRateId", (0, auth_1.authorize)(permissions_1.PermissionsList.ReadExchangeRate), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { exchangeRateId } = req.params;
        const exchangeRate = yield exchangeRateRepository.getExchangeRateById(exchangeRateId);
        res.status(200).json(exchangeRate);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
router.get("/date/:date", (0, auth_1.authorize)(permissions_1.PermissionsList.ReadExchangeRate), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date } = req.params;
        const exchangeRates = yield exchangeRateRepository.getExchangeRatesByDate(new Date(date));
        res.status(200).json(exchangeRates);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
router.post("/", (0, auth_1.authorize)(permissions_1.PermissionsList.CreateExchangeRate), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const exchangeRate = req.body;
        const newExchangeRate = yield exchangeRateRepository.createExchangeRate(exchangeRate);
        res.status(201).json(newExchangeRate);
        app_1.io.emit(Events_1.ExchangeRateEvent.Created, newExchangeRate);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
router.put("/:exchangeRateId", (0, auth_1.authorize)(permissions_1.PermissionsList.UpdateExchangeRate), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { exchangeRateId } = req.params;
        const exchangeRateUpdate = req.body;
        const updatedExchangeRate = yield exchangeRateRepository.updateExchangeRate(exchangeRateId, exchangeRateUpdate);
        res.status(200).json(updatedExchangeRate);
        app_1.io.emit(Events_1.ExchangeRateEvent.Updated, updatedExchangeRate);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
router.delete("/:exchangeRateId", (0, auth_1.authorize)(permissions_1.PermissionsList.DeleteExchangeRate), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { exchangeRateId } = req.params;
        yield exchangeRateRepository.deleteExchangeRate(exchangeRateId);
        res.status(200).json({ message: "Exchange rate deleted successfully" });
        app_1.io.emit(Events_1.ExchangeRateEvent.Deleted, exchangeRateId);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
router.get("/currency-pair/:currencyPair", (0, auth_1.authorize)(permissions_1.PermissionsList.ReadExchangeRate), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { currencyPair } = req.params;
        const exchangeRate = yield exchangeRateRepository.getExchangeRateByCurrencyPair(currencyPair);
        res.status(200).json(exchangeRate);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
exports.default = router;
