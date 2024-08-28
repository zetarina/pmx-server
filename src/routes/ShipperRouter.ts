import express from "express";
import { ParcelService } from "../services/ParcelService";
import { authorize } from "../middlewares/auth";
import { PermissionsList } from "../types/permissions";
import { ParcelEvent } from "../models/Events";
import { io } from "../app";
import { ParcelServiceMobile } from "../services/ParcelServiceMobile";

const router = express.Router();
const parcelServiceMobile = new ParcelServiceMobile();

// Get inventory of parcels for a shipper
router.get(
  "/inventory",
  authorize(PermissionsList.getShipperInventory),
  async (req, res) => {
    try {
      const shipperId = req.user.id;
      const inventory = await parcelServiceMobile.getShipperInventory(
        shipperId
      );
      res.status(200).json(inventory);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
