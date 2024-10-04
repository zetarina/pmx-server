"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryAction = exports.ActionType = exports.InventoryChange = exports.InventoryType = void 0;
var InventoryType;
(function (InventoryType) {
    InventoryType["Local"] = "local";
    InventoryType["LongHaul"] = "longHaul";
    InventoryType["Shipper"] = "shipper";
})(InventoryType || (exports.InventoryType = InventoryType = {}));
var InventoryChange;
(function (InventoryChange) {
    InventoryChange["AddedToInventory"] = "addedToInventory";
    InventoryChange["RemovedFromInventory"] = "removedFromInventory";
})(InventoryChange || (exports.InventoryChange = InventoryChange = {}));
var ActionType;
(function (ActionType) {
    ActionType["Local"] = "local";
    ActionType["LongHaul"] = "longHaul";
})(ActionType || (exports.ActionType = ActionType = {}));
var DeliveryAction;
(function (DeliveryAction) {
    DeliveryAction["Deliver"] = "deliver";
    DeliveryAction["Reschedule"] = "reschedule";
    DeliveryAction["Cancel"] = "cancel";
})(DeliveryAction || (exports.DeliveryAction = DeliveryAction = {}));
