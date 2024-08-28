import express from "express";
import { authenticateJWT, authorize } from "../middlewares/auth";
import { PermissionsList } from "../types/permissions";
import { ParcelServiceMobile } from "../services/ParcelServiceMobile";

const router = express.Router();
const parcelService = new ParcelServiceMobile();

// Get parcel by parcelId
router.get(
  "/:parcelId",
  async (req, res) => {
    try {
      const { parcelId } = req.params;
      const parcel = await parcelService.getParcelByParcelId(parcelId);
      res.status(200).json(parcel);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
);
router.post(
  "/:parcelId",
  authenticateJWT,
  authorize(PermissionsList.ReadParcel),
  async (req, res) => {
    try {
      const { parcelId } = req.params;
      const parcel = await parcelService.getParcelByParcelId(parcelId);
      res.status(200).json(parcel);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
