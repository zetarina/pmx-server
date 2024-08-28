import express from "express";
import { ParcelService } from "../services/ParcelService";
import { authorize } from "../middlewares/auth";
import { PermissionsList } from "../types/permissions";
import { ActionType, InventoryChange, InventoryType } from "../models/Enums";
import {
  emitBulkParcelStatusChanged,
  emitParcelInventoryChange,
  emitParcelStatusChanged,
} from "../utils/socket-utils";

const router = express.Router();
const parcelService = new ParcelService();

// GET route to fetch driver parcels
router.get(
  "/driver/:driverId",
  authorize(PermissionsList.UpdateParcel),
  async (req, res) => {
    try {
      const { driverId } = req.params;
      const parcels = await parcelService.getParcelsByDriver(
        driverId,
        ActionType.Local
      );
      res.status(200).json({ parcels });
    } catch (error: any) {
      console.error("Error fetching driver parcels:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// POST route to process driver parcels
router.post(
  "/driver/:driverId/process",
  authorize(PermissionsList.UpdateParcel),
  async (req, res) => {
    try {
      const { driverId } = req.params;
      const { packageIds, warehouseId } = req.body;

      if (!Array.isArray(packageIds) || packageIds.length === 0) {
        return res
          .status(400)
          .json({ error: "No parcels provided for processing" });
      }

      const processedParcels = await parcelService.processDriverParcels(
        driverId,
        packageIds,
        warehouseId
      );

      emitBulkParcelStatusChanged(processedParcels);

      res.status(200).json({
        message: "Parcels processed successfully",
        parcels: processedParcels,
      });
    } catch (error: any) {
      console.error("Error processing driver parcels:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// POST route to process long-haul parcels
router.post(
  "/long-haul-parcels",
  authorize(PermissionsList.UpdateParcel),
  async (req, res) => {
    try {
      const { parcels, warehouseId } = req.body;

      if (!Array.isArray(parcels) || parcels.length === 0) {
        return res
          .status(400)
          .json({ error: "No parcels provided for processing" });
      }

      const processedParcels = await parcelService.processParcelsForLongHaul(
        parcels,
        warehouseId
      );

      emitBulkParcelStatusChanged(processedParcels);

      res.status(200).json({
        message: "Parcels processed for long-haul successfully",
        parcels: processedParcels,
      });
    } catch (error: any) {
      console.error("Error processing long-haul parcels:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
