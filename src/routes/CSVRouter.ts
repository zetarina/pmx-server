import express from "express";
import { CSVService } from "../services/CSVService";

const router = express.Router();
const csvService = new CSVService();

router.get("/download-sample-csv", (req, res) => {
  const sampleCSV = csvService.generateSampleCSV();
  res.header("Content-Type", "text/csv");
  res.attachment("sample.csv");
  res.send(sampleCSV);
});

router.post("/validate-entities", async (req, res) => {
  try {
    const uniqueValues = req.body;
    const validationResult = await csvService.validateEntities(uniqueValues);
    res.status(200).json(validationResult);
  } catch (error: unknown) {
    console.log(error);
    if (error instanceof Error) {
      res.status(500).send(`Error validating entities: ${error.message}`);
    } else {
      res.status(500).send("Unknown error occurred while validating entities");
    }
  }
});

router.post("/create-parcels", async (req, res) => {
  try {
    const { parcels, shipperId, initialWarehouseId } = req.body;
    console.log(req.body)
    if (!parcels || !Array.isArray(parcels)) {
      return res.status(400).send("Invalid parcel data.");
    }

    const { success, errors } =
      await csvService.validateEntitiesAndCreateParcels(
        parcels,
        shipperId,
        initialWarehouseId,
        req.user.id // Assuming `req.user.id` is available
      );

    if (!success) {
      return res
        .status(400)
        .json({ message: "Some parcels could not be created", errors });
    }

    res.status(200).json({ message: "All parcels created successfully" });
  } catch (error: any) {
    console.error(error)
    res.status(500).send(`Error creating parcels: ${error.message}`);
  }
});

export default router;
