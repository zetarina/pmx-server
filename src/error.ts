import express from "express";

export const handleError = (res: express.Response, error: any) => {
  console.error(error);
  if (error.name === "MongooseServerSelectionError") {
    res
      .status(503)
      .json({ error: "Database connection error. Please try again later." });
  } else {
    res.status(500).json({ error: error.message });
  }
};
