import express from "express";
import { ExchangeRate } from "../models/ExchangeRate";
import { ExchangeRateRepository } from "../repositories/ExchangeRateRepository";
import { authorize } from "../middlewares/auth";
import { PermissionsList } from "../types/permissions";
import { ExchangeRateEvent } from "../models/Events";
import { io } from "../app";

const router = express.Router();
const exchangeRateRepository = new ExchangeRateRepository();

router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, query = "" } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const { exchangeRates, total } =
      await exchangeRateRepository.getAllExchangeRates(
        pageNumber,
        limitNumber,
        query as string
      );
    res.status(200).json({ exchangeRates, total });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get(
  "/:exchangeRateId",
  authorize(PermissionsList.ReadExchangeRate),
  async (req, res) => {
    try {
      const { exchangeRateId } = req.params;
      const exchangeRate = await exchangeRateRepository.getExchangeRateById(
        exchangeRateId
      );
      res.status(200).json(exchangeRate);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.get(
  "/date/:date",
  authorize(PermissionsList.ReadExchangeRate),
  async (req, res) => {
    try {
      const { date } = req.params;
      const exchangeRates = await exchangeRateRepository.getExchangeRatesByDate(
        new Date(date)
      );
      res.status(200).json(exchangeRates);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.post(
  "/",
  authorize(PermissionsList.CreateExchangeRate),
  async (req, res) => {
    try {
      const exchangeRate: ExchangeRate = req.body;
      const newExchangeRate = await exchangeRateRepository.createExchangeRate(
        exchangeRate
      );
      res.status(201).json(newExchangeRate);
      io.emit(ExchangeRateEvent.Created, newExchangeRate);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.put(
  "/:exchangeRateId",
  authorize(PermissionsList.UpdateExchangeRate),
  async (req, res) => {
    try {
      const { exchangeRateId } = req.params;
      const exchangeRateUpdate: Partial<ExchangeRate> = req.body;
      const updatedExchangeRate =
        await exchangeRateRepository.updateExchangeRate(
          exchangeRateId,
          exchangeRateUpdate
        );
      res.status(200).json(updatedExchangeRate);
      io.emit(ExchangeRateEvent.Updated, updatedExchangeRate);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.delete(
  "/:exchangeRateId",
  authorize(PermissionsList.DeleteExchangeRate),
  async (req, res) => {
    try {
      const { exchangeRateId } = req.params;
      await exchangeRateRepository.deleteExchangeRate(exchangeRateId);
      res.status(200).json({ message: "Exchange rate deleted successfully" });
      io.emit(ExchangeRateEvent.Deleted, exchangeRateId);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.get(
  "/currency-pair/:currencyPair",
  authorize(PermissionsList.ReadExchangeRate),
  async (req, res) => {
    try {
      const { currencyPair } = req.params;
      const exchangeRate =
        await exchangeRateRepository.getExchangeRateByCurrencyPair(
          currencyPair
        );
      res.status(200).json(exchangeRate);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
