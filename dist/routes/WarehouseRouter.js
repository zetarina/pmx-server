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
const WarehouseRepository_1 = require("../repositories/WarehouseRepository");
const auth_1 = require("../middlewares/auth");
const permissions_1 = require("../types/permissions");
const Events_1 = require("../models/Events");
const app_1 = require("../app");
const error_1 = require("../error");
const router = express_1.default.Router();
const warehouseRepository = new WarehouseRepository_1.WarehouseRepository();
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, query = "" } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const { warehouses, total } = yield warehouseRepository.getAllWarehouses(pageNumber, limitNumber, query);
        res.status(200).json({ warehouses, total });
    }
    catch (error) {
        (0, error_1.handleError)(res, error);
    }
}));
router.post("/", (0, auth_1.authorize)(permissions_1.PermissionsList.CreateWarehouse), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const warehouse = req.body;
        const newWarehouse = yield warehouseRepository.createWarehouse(warehouse);
        res.status(201).json(newWarehouse);
        app_1.io.emit(Events_1.WarehouseEvent.Created, newWarehouse);
    }
    catch (error) {
        (0, error_1.handleError)(res, error);
    }
}));
router.get("/:warehouseId", (0, auth_1.authorize)(permissions_1.PermissionsList.ReadWarehouse), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { warehouseId } = req.params;
        const warehouse = yield warehouseRepository.getWarehouseById(warehouseId);
        res.status(200).json(warehouse);
    }
    catch (error) {
        (0, error_1.handleError)(res, error);
    }
}));
router.put("/:warehouseId", (0, auth_1.authorize)(permissions_1.PermissionsList.UpdateWarehouse), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { warehouseId } = req.params;
        const warehouseUpdate = req.body;
        const updatedWarehouse = yield warehouseRepository.updateWarehouse(warehouseId, warehouseUpdate);
        res.status(200).json(updatedWarehouse);
        app_1.io.emit(Events_1.WarehouseEvent.Updated, updatedWarehouse);
    }
    catch (error) {
        (0, error_1.handleError)(res, error);
    }
}));
router.delete("/:warehouseId", (0, auth_1.authorize)(permissions_1.PermissionsList.DeleteWarehouse), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { warehouseId } = req.params;
        yield warehouseRepository.deleteWarehouse(warehouseId);
        res.status(200).json({ message: "Warehouse deleted successfully" });
        app_1.io.emit(Events_1.WarehouseEvent.Deleted, warehouseId);
    }
    catch (error) {
        (0, error_1.handleError)(res, error);
    }
}));
router.get("/city/:cityId", (0, auth_1.authorize)(permissions_1.PermissionsList.ReadWarehouse), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cityId } = req.params;
        const warehouses = yield warehouseRepository.getWarehousesByCity(cityId);
        res.status(200).json(warehouses);
    }
    catch (error) {
        (0, error_1.handleError)(res, error);
    }
}));
exports.default = router;
