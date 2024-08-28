import { Model } from "mongoose";
import { Warehouse, getWarehouseModel } from "../models/Warehouse";

export class WarehouseRepository {
  private warehouseModel: Model<Warehouse>;

  constructor() {
    this.warehouseModel = getWarehouseModel();
  }

  async getAllWarehouses(
    page: number,
    limit: number,
    query: string
  ): Promise<{ warehouses: Warehouse[]; total: number }> {
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

      const [warehouses, total] = await Promise.all([warehousesQuery, totalQuery]);

      return { warehouses: warehouses.map((warehouse) => warehouse.toObject()), total };
    } catch (error: any) {
      throw new Error(`Error getting warehouses: ${error.message}`);
    }
  } 

  async createWarehouse(warehouse: Warehouse): Promise<Warehouse | null> {
    try {
      const newWarehouse = await this.warehouseModel.create(warehouse);
      return this.getWarehouseById(newWarehouse._id.toString());
    } catch (error: any) {
      throw new Error(`Error creating warehouse: ${error.message}`);
    }
  }

  async updateWarehouse(
    warehouseId: string,
    warehouseUpdate: Partial<Warehouse>
  ): Promise<Warehouse | null> {
    try {
      const updatedWarehouse = await this.warehouseModel
        .findByIdAndUpdate(warehouseId, warehouseUpdate, { new: true })
        .populate("location.city")
        .populate("location.country");
      return updatedWarehouse ? updatedWarehouse.toObject() : null;
    } catch (error: any) {
      throw new Error(`Error updating warehouse: ${error.message}`);
    }
  }

  async deleteWarehouse(warehouseId: string): Promise<boolean> {
    try {
      await this.warehouseModel.findByIdAndDelete(warehouseId);
      return true;
    } catch (error: any) {
      throw new Error(`Error deleting warehouse: ${error.message}`);
    }
  }

  async getWarehouseById(warehouseId: string): Promise<Warehouse | null> {
    try {
      const warehouse = await this.warehouseModel
        .findById(warehouseId);
      return warehouse ? warehouse.toObject() : null;
    } catch (error: any) {
      throw new Error(`Error getting warehouse by ID: ${error.message}`);
    }
  }

  async getWarehousesByCity(cityId: string): Promise<Warehouse[]> {
    try {
      const warehouses = await this.warehouseModel
        .find({ "location.cityId": cityId })
        .populate("location.city")
        .populate("location.country");
      return warehouses.map((warehouse) => warehouse.toObject());
    } catch (error: any) {
      throw new Error(`Error getting warehouses by city: ${error.message}`);
    }
  }
}
