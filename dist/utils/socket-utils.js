"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitParcelInventoryChange = exports.emitBulkParcelStatusChanged = exports.emitParcelStatusChanged = void 0;
const app_1 = require("../app");
const Events_1 = require("../models/Events");
const Enums_1 = require("../models/Enums");
const emitParcelStatusChanged = (parcel) => {
    app_1.io.emit(Events_1.ParcelEvent.StatusChanged, parcel);
};
exports.emitParcelStatusChanged = emitParcelStatusChanged;
const emitBulkParcelStatusChanged = (parcels) => {
    app_1.io.emit(Events_1.ParcelEvent.BulkStatusChanged, { parcels });
};
exports.emitBulkParcelStatusChanged = emitBulkParcelStatusChanged;
const emitParcelInventoryChange = (action, userId, parcelId, inventoryType) => {
    if (action === Enums_1.InventoryChange.AddedToInventory) {
        app_1.io.emit(Events_1.ParcelEvent.AddedToInventory, {
            userId,
            parcelId,
            inventoryType,
        });
    }
    else if (action === Enums_1.InventoryChange.RemovedFromInventory) {
        app_1.io.emit(Events_1.ParcelEvent.RemovedFromInventory, {
            userId,
            parcelId,
            inventoryType,
        });
    }
};
exports.emitParcelInventoryChange = emitParcelInventoryChange;
