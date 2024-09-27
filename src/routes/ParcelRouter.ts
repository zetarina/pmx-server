import express from "express";
import { ParcelService } from "../services/ParcelService";
import { Parcel } from "../models/Parcel";
import { authorize } from "../middlewares/auth";
import { PermissionsList } from "../types/permissions";
import { ParcelEvent } from "../models/Events";
import { io } from "../app";
import { generateWaybillPDF } from "../utils/waybill";

const router = express.Router();
const parcelService = new ParcelService();

router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, query = "" } = req.query;
    const { parcels, total } = await parcelService.getAllParcels(
      Number(page),
      Number(limit),
      query
    );
    res.status(200).json({ parcels, total });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", authorize(PermissionsList.ReadParcel), async (req, res) => {
  try {
    const { id } = req.params;
    const parcel = await parcelService.getParcelById(id);
    res.status(200).json(parcel);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get(
  "/:id/waybill-pdf",
  authorize(PermissionsList.ReadParcel),
  async (req, res) => {
    try {
      const { id } = req.params;
      const parcel = await parcelService.getParcelById(id);

      if (!parcel) {
        return res.status(404).json({ error: "Parcel not found" });
      }

      const pdfBytes = await generateWaybillPDF(parcel);

      res.setHeader("Content-Disposition", "inline; filename=waybill.pdf");
      res.setHeader("Content-Type", "application/pdf");
      res.send(Buffer.from(pdfBytes));
    } catch (error) {
      console.error("Error generating waybill PDF:", error);
      res.status(500).json({ error: "Failed to generate waybill PDF" });
    }
  }
);

router.get(
  "/parcelId/:parcelId",
  authorize(PermissionsList.ReadParcel),
  async (req, res) => {
    try {
      const { parcelId } = req.params;
      const parcel = await parcelService.getParcelByParcelId(parcelId);
      res.status(200).json(parcel);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.post("/", authorize(PermissionsList.CreateParcel), async (req, res) => {
  try {
    const parcel = req.body;
    const userId = req.user.id;
    const initialWarehouseId = req.body.initialWarehouseId;

    const newParcel = await parcelService.validateAndCreateParcel(
      parcel,
      initialWarehouseId,
      userId
    );

    if (!newParcel) {
      return res.status(500).json({ error: "Failed to create parcel" });
    }

    const pdfBytes = await generateWaybillPDF(newParcel);
    const pdfBase64 = Buffer.from(pdfBytes).toString("base64");

    res.status(201).json({
      parcel: newParcel,
      waybill: pdfBase64,
    });

    io.emit(ParcelEvent.Created, newParcel);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
router.put(
  "/:parcelId",
  authorize(PermissionsList.UpdateParcel),
  async (req, res) => {
    try {
      const { parcelId } = req.params;
      const parcelUpdates: Partial<Parcel> = req.body;
      const updatedParcel = await parcelService.updateParcelUser(
        parcelId,
        parcelUpdates
      );

      if (!updatedParcel) {
        return res.status(500).json({ error: "Failed to update parcel" });
      }

      const pdfBytes = await generateWaybillPDF(updatedParcel);
      const pdfBase64 = Buffer.from(pdfBytes).toString("base64");

      res.status(200).json({
        parcel: updatedParcel,
        waybill: pdfBase64,
      });

      io.emit(ParcelEvent.Updated, updatedParcel);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
);

router.delete(
  "/:parcelId",
  authorize(PermissionsList.DeleteParcel),
  async (req, res) => {
    try {
      const { parcelId } = req.params;
      await parcelService.deleteParcel(parcelId);
      res.status(200).json({ message: "Parcel deleted successfully." });
      io.emit(ParcelEvent.Deleted, parcelId);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
