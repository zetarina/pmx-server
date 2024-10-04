"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicContactInfoSchemaDefinition = void 0;
const mongoose_1 = require("mongoose");
exports.BasicContactInfoSchemaDefinition = {
    phoneNumber: { type: String, required: true },
    cityId: { type: mongoose_1.Schema.Types.ObjectId, ref: "City", required: true },
    countryId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Country", required: true },
    address: { type: String, required: true },
    zip: { type: String, required: true },
};
