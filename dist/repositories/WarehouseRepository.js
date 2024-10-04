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
exports.WarehouseRepository = void 0;
const Warehouse_1 = require("../models/Warehouse");
class WarehouseRepository {
    constructor() {
        this.warehouseModel = (0, Warehouse_1.getWarehouseModel)();
    }
    getAllWarehouses(page, limit, query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const warehousesQuery = this.warehouseModel
                    .find({ name: new RegExp(query, "i") }) // Adjust the field for filtering if needed
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .populate("location.city")
                    .populate("location.country");
                const totalQuery = this.warehouseModel.countDocuments({
                    name: new RegExp(query, "i"),
                });
                const [warehouses, total] = yield Promise.all([warehousesQuery, totalQuery]);
                return { warehouses: warehouses.map((warehouse) => warehouse.toObject()), total };
            }
            catch (error) {
                throw new Error(`Error getting warehouses: ${error.message}`);
            }
        });
    }
    createWarehouse(warehouse) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newWarehouse = yield this.warehouseModel.create(warehouse);
                return this.getWarehouseById(newWarehouse._id.toString());
            }
            catch (error) {
                throw new Error(`Error creating warehouse: ${error.message}`);
            }
        });
    }
    updateWarehouse(warehouseId, warehouseUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedWarehouse = yield this.warehouseModel
                    .findByIdAndUpdate(warehouseId, warehouseUpdate, { new: true })
                    .populate("location.city")
                    .populate("location.country");
                return updatedWarehouse ? updatedWarehouse.toObject() : null;
            }
            catch (error) {
                throw new Error(`Error updating warehouse: ${error.message}`);
            }
        });
    }
    deleteWarehouse(warehouseId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.warehouseModel.findByIdAndDelete(warehouseId);
                return true;
            }
            catch (error) {
                throw new Error(`Error deleting warehouse: ${error.message}`);
            }
        });
    }
    getWarehouseById(warehouseId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const warehouse = yield this.warehouseModel
                    .findById(warehouseId);
                return warehouse ? warehouse.toObject() : null;
            }
            catch (error) {
                throw new Error(`Error getting warehouse by ID: ${error.message}`);
            }
        });
    }
    getWarehousesByCity(cityId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const warehouses = yield this.warehouseModel
                    .find({ "location.cityId": cityId })
                    .populate("location.city")
                    .populate("location.country");
                return warehouses.map((warehouse) => warehouse.toObject());
            }
            catch (error) {
                throw new Error(`Error getting warehouses by city: ${error.message}`);
            }
        });
    }
}
exports.WarehouseRepository = WarehouseRepository;
