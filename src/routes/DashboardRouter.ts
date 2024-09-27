import express from "express";
import { ParcelService } from "../services/ParcelService";

const router = express.Router();

const parcelService = new ParcelService();

// Route to get dashboard data
router.get("/", async (req, res) => {
  try {
    // Get all the dashboard data (totals and monthly data)
    const dashboardData = await parcelService.getAllParcelsForDashboard();

    // Send the combined response
    res.json(dashboardData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

export default router;
