import express from "express";
import { authorize } from "../middlewares/auth";
import { PermissionsList } from "../types/permissions";
import { parseAsync } from "json2csv";

import { Request, Response } from "express";
import { ParcelService } from "../services/ParcelService";

const router = express.Router();
const parcelService = new ParcelService();
// Endpoint to get parcel data for the frontend
router.get(
  "/data",
  authorize(PermissionsList.ReadParcel),
  async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;

      const parcels = await parcelService.getParcelsByDateRange(
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.status(200).json(parcels);
    } catch (error) {
      console.error("Error fetching parcels:", error);
      res.status(500).json({ error: "Failed to fetch parcels" });
    }
  }
);

// Endpoint to download parcel report as CSV
router.get(
  "/download",
  authorize(PermissionsList.ReadParcel),
  async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;

      const parcels = await parcelService.getParcelsByDateRange(
        new Date(startDate as string),
        new Date(endDate as string)
      );

      const csv = await parseAsync(parcels);

      res.header("Content-Type", "text/csv");
      res.attachment(`parcel-report-${startDate}-to-${endDate}.csv`);
      res.send(csv);
    } catch (error) {
      console.error("Error generating CSV:", error);
      res.status(500).json({ error: "Failed to generate CSV" });
    }
  }
);

export default router;
