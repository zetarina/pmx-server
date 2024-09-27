import express from "express";
import { authorize } from "../middlewares/auth";
import { PermissionsList } from "../types/permissions";
import {
  ActionType,
  DeliveryAction,
  InventoryChange,
  InventoryType,
} from "../models/Enums";
import {
  emitBulkParcelStatusChanged,
  emitParcelInventoryChange,
  emitParcelStatusChanged,
} from "../utils/socket-utils";
import { ParcelServiceMobile } from "../services/ParcelServiceMobile";

const router = express.Router();
const parcelServiceMobile = new ParcelServiceMobile();
router.get(
  "/driverParcels/:id/inventory",
  authorize(PermissionsList.getInventory),
  async (req, res) => {
    try {
      // const driverId = req.user.id;
      const driverId = req.params.id;
      const { type } = req.query;
      const inventory = await parcelServiceMobile.getMyInventory(
        driverId,
        type as ActionType
      );
      res.status(200).json(inventory);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
);
router.get(
  "/inventory",
  authorize(PermissionsList.getInventory),
  async (req, res) => {
    try {
      const driverId = req.user.id;
      const { type } = req.query;

      const inventory = await parcelServiceMobile.getMyInventory(
        driverId,
        type as ActionType
      );

      res.status(200).json(inventory);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
);
router.post(
  "/scan/inventory",
  authorize(PermissionsList.ScanParcelByDriver),
  async (req, res) => {
    try {
      const { parcelId, action } = req.body;
      const driverId = req.user.id;
      const updatedParcel = await parcelServiceMobile.scanParcel(
        parcelId,
        driverId,
        action as ActionType
      );
      if (updatedParcel && updatedParcel._id) {
        const successParcel = await parcelServiceMobile.getParcelById(
          updatedParcel._id.toString()
        );
        res.status(200).json(successParcel);
        emitParcelStatusChanged(updatedParcel);
        emitParcelInventoryChange(
          InventoryChange.AddedToInventory,
          driverId,
          updatedParcel._id,
          action === ActionType.Local
            ? InventoryType.Local
            : InventoryType.LongHaul
        );
      } else {
        res.status(400).json({ message: "Parcel not found or update failed." });
      }
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
);

router.post(
  "/submit",
  authorize(PermissionsList.ScanParcelByDriver),
  async (req, res) => {
    try {
      const { id, action } = req.body;

      const driverId = req.user.id;
      const updatedParcel = await parcelServiceMobile.submitDeliveryAction(
        id,
        driverId,
        action as DeliveryAction
      );
      if (updatedParcel) {
        const successParcel = await parcelServiceMobile.getParcelById(id);
        res.status(200).json(successParcel);
        emitParcelStatusChanged(updatedParcel);
        emitParcelInventoryChange(
          InventoryChange.RemovedFromInventory,
          driverId,
          updatedParcel._id,
          action === ActionType.Local
            ? InventoryType.Local
            : InventoryType.LongHaul
        );
      } else {
        res.status(400).json({ message: "Parcel not found or update failed." });
      }
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
);
router.post(
  "/submit-border",
  authorize(PermissionsList.ScanParcelByDriver),
  async (req, res) => {
    try {
      const driverId = req.user.id;
      const updatedParcels = await parcelServiceMobile.markAllParcelsAsBorder(
        driverId
      );
      if (updatedParcels && updatedParcels.length > 0) {
        res
          .status(200)
          .json({ message: "All long-haul parcels marked as border." });
        emitBulkParcelStatusChanged(updatedParcels);
      } else {
        res.status(400).json({ message: "No parcels found or update failed." });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.post(
  "/revert",
  authorize(PermissionsList.ScanParcelByDriver),
  async (req, res) => {
    try {
      const { parcelId, action } = req.body;
      const driverId = req.user.id;
      const updatedParcel = await parcelServiceMobile.revertParcelStatus(
        parcelId
      );
      if (updatedParcel) {
        res.status(200).json(updatedParcel);
        emitParcelStatusChanged(updatedParcel);
        emitParcelInventoryChange(
          InventoryChange.AddedToInventory,
          driverId,
          updatedParcel._id,
          action === ActionType.Local
            ? InventoryType.Local
            : InventoryType.LongHaul
        );
      } else {
        res.status(400).json({ message: "Parcel not found or update failed." });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
