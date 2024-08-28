import express from "express";
import { Warehouse } from "../models/Warehouse";
import { WarehouseRepository } from "../repositories/WarehouseRepository";
import { authorize } from "../middlewares/auth";
import { PermissionsList } from "../types/permissions";
import { WarehouseEvent } from "../models/Events";
import { io } from "../app";
import { handleError } from "../error";

const router = express.Router();
const warehouseRepository = new WarehouseRepository();

router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, query = "" } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    const { warehouses, total } = await warehouseRepository.getAllWarehouses(
      pageNumber,
      limitNumber,
      query as string
    );
    res.status(200).json({ warehouses, total });
  } catch (error: any) {
    handleError(res, error);
  }
});

router.post(
  "/",
  authorize(PermissionsList.CreateWarehouse),
  async (req, res) => {
    try {
      const warehouse: Warehouse = req.body;
      const newWarehouse = await warehouseRepository.createWarehouse(warehouse);
      res.status(201).json(newWarehouse);
      io.emit(WarehouseEvent.Created, newWarehouse);
    } catch (error: any) {
      handleError(res, error);
    }
  }
);

router.get(
  "/:warehouseId",
  authorize(PermissionsList.ReadWarehouse),
  async (req, res) => {
    try {
      const { warehouseId } = req.params;
      const warehouse = await warehouseRepository.getWarehouseById(warehouseId);
      res.status(200).json(warehouse);
    } catch (error: any) {
      handleError(res, error);
    }
  }
);

router.put(
  "/:warehouseId",
  authorize(PermissionsList.UpdateWarehouse),
  async (req, res) => {
    try {
      const { warehouseId } = req.params;
      const warehouseUpdate: Partial<Warehouse> = req.body;
      const updatedWarehouse = await warehouseRepository.updateWarehouse(
        warehouseId,
        warehouseUpdate
      );
      res.status(200).json(updatedWarehouse);
      io.emit(WarehouseEvent.Updated, updatedWarehouse);
    } catch (error: any) {
      handleError(res, error);
    }
  }
);

router.delete(
  "/:warehouseId",
  authorize(PermissionsList.DeleteWarehouse),
  async (req, res) => {
    try {
      const { warehouseId } = req.params;
      await warehouseRepository.deleteWarehouse(warehouseId);
      res.status(200).json({ message: "Warehouse deleted successfully" });
      io.emit(WarehouseEvent.Deleted, warehouseId);
    } catch (error: any) {
      handleError(res, error);
    }
  }
);

router.get(
  "/city/:cityId",
  authorize(PermissionsList.ReadWarehouse),
  async (req, res) => {
    try {
      const { cityId } = req.params;
      const warehouses = await warehouseRepository.getWarehousesByCity(cityId);
      res.status(200).json(warehouses);
    } catch (error: any) {
      handleError(res, error);
    }
  }
);

export default router;
