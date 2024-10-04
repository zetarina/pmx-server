"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = void 0;
const handleError = (res, error) => {
    console.error(error);
    if (error.name === "MongooseServerSelectionError") {
        res
            .status(503)
            .json({ error: "Database connection error. Please try again later." });
    }
    else {
        res.status(500).json({ error: error.message });
    }
};
exports.handleError = handleError;
