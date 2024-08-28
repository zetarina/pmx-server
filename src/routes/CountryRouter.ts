import express from "express";
import { Country } from "../models/Country";
import { CountryRepository } from "../repositories/CountryRepository";
import { authorize } from "../middlewares/auth";
import { PermissionsList } from "../types/permissions";
import { CountryEvent } from "../models/Events";
import { io } from "../app";
import { handleError } from "../error";

const router = express.Router();
const countryRepository = new CountryRepository();

router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, query = "" } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    const { countries, total } = await countryRepository.getAllCountries(
      pageNumber,
      limitNumber,
      query as string
    );
    res.status(200).json({ countries, total });
  } catch (error: any) {
    handleError(res, error);
  }
});

router.get(
  "/:countryId",
  authorize(PermissionsList.ReadCountry),
  async (req, res) => {
    try {
      const { countryId } = req.params;
      const country = await countryRepository.getCountryById(countryId);
      res.status(200).json(country);
    } catch (error: any) {
      handleError(res, error);
    }
  }
);

router.post("/", authorize(PermissionsList.CreateCountry), async (req, res) => {
  try {
    const country: Country = req.body;
    const newCountry = await countryRepository.createCountry(country);
    res.status(201).json(newCountry);
    io.emit(CountryEvent.Created, newCountry);
  } catch (error: any) {
    handleError(res, error);
  }
});

router.put(
  "/:countryId",
  authorize(PermissionsList.UpdateCountry),
  async (req, res) => {
    try {
      const { countryId } = req.params;
      const countryUpdate: Partial<Country> = req.body;
      const updatedCountry = await countryRepository.updateCountry(
        countryId,
        countryUpdate
      );
      res.status(200).json(updatedCountry);
      io.emit(CountryEvent.Updated, updatedCountry);
    } catch (error: any) {
      handleError(res, error);
    }
  }
);

router.delete(
  "/:countryId",
  authorize(PermissionsList.DeleteCountry),
  async (req, res) => {
    try {
      const { countryId } = req.params;
      await countryRepository.deleteCountry(countryId);
      res.status(200).json({ message: "Country deleted successfully" });
      io.emit(CountryEvent.Deleted, countryId);
    } catch (error: any) {
      handleError(res, error);
    }
  }
);

router.get(
  "/code/:code",
  authorize(PermissionsList.ReadCountry),
  async (req, res) => {
    try {
      const { code } = req.params;
      const country = await countryRepository.getCountryByCode(code);
      res.status(200).json(country);
    } catch (error: any) {
      handleError(res, error);
    }
  }
);

export default router;
