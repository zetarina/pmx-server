import express from "express";
import { ParcelModel } from "../models/Parcel";
import { generateWaybillPDF } from "../utils/waybill";



const router = express.Router();

router.post("/generate-waybill", async (req, res) => {
  try {
    const { parcelId } = req.body;
    const parcel = await ParcelModel.findById(parcelId)
      .populate("sender.guest.country")
      .populate("sender.guest.city")
      .populate("sender.shipper.country")
      .populate("sender.shipper.city")
      .populate("receiver.country")
      .populate("receiver.city")
      .exec();

    if (!parcel) {
      return res.status(404).json({ error: "Parcel not found" });
    }

    const pdfBytes = await generateWaybillPDF(parcel);
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdfBytes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
