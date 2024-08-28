import express from "express";
import { City } from "../models/City";
import { CityRepository } from "../repositories/CityRepository";
import {  authorize } from "../middlewares/auth";
import { PermissionsList } from "../types/permissions";

import { CityEvent } from "../models/Events";
import { io } from "../app";
import { handleError } from "../error";

const router = express.Router();
const cityRepository = new CityRepository();

router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, query = "" } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    const { cities, total } = await cityRepository.getAllCities(
      pageNumber,
      limitNumber,
      query as string
    );
    res.status(200).json({ cities, total });
  } catch (error: any) {
    handleError(res, error);
  }
});

router.get(
  "/:cityId",
  authorize(PermissionsList.ReadCity),
  async (req, res) => {
    try {
      const { cityId } = req.params;
      const city = await cityRepository.getCityById(cityId);
      res.status(200).json(city);
    } catch (error: any) {
      handleError(res, error);
    }
  }
);
router.get(
  "/country/:countryId",
  authorize(PermissionsList.ReadCity),
  async (req, res) => {
    try {
      const { countryId } = req.params;
      const { page = "1", limit = "10", query = "" } = req.query;

      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);

      const { cities, total } = await cityRepository.getCitiesByCountry(
        countryId,
        pageNumber,
        limitNumber,
        query as string
      );
      res.status(200).json({ cities, total });
    } catch (error: any) {
      handleError(res, error);
    }
  }
);

router.post("/", authorize(PermissionsList.CreateCity), async (req, res) => {
  try {
    const city: City = req.body;
    const newCity = await cityRepository.createCity(city);
    res.status(201).json(newCity);
    io.emit(CityEvent.Created, newCity);
  } catch (error: any) {
    handleError(res, error);
  }
});

router.put(
  "/:cityId",
  authorize(PermissionsList.UpdateCity),
  async (req, res) => {
    try {
      const { cityId } = req.params;
      const cityUpdate: Partial<City> = req.body;
      const updatedCity = await cityRepository.updateCity(cityId, cityUpdate);
      res.status(200).json(updatedCity);
      io.emit(CityEvent.Updated, updatedCity);
    } catch (error: any) {
      handleError(res, error);
    }
  }
);

router.delete(
  "/:cityId",
  authorize(PermissionsList.DeleteCity),
  async (req, res) => {
    try {
      const { cityId } = req.params;
      await cityRepository.deleteCity(cityId);
      res.status(200).json({ message: "City deleted successfully" });
      io.emit(CityEvent.Deleted, cityId);
    } catch (error: any) {
      handleError(res, error);
    }
  }
);

export default router;
