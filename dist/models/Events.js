"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserEvent = exports.WarehouseEvent = exports.RoleEvent = exports.ParcelEvent = exports.ExchangeRateEvent = exports.CountryEvent = exports.CityEvent = void 0;
var CityEvent;
(function (CityEvent) {
    CityEvent["Created"] = "cityCreated";
    CityEvent["Updated"] = "cityUpdated";
    CityEvent["Deleted"] = "cityDeleted";
})(CityEvent || (exports.CityEvent = CityEvent = {}));
var CountryEvent;
(function (CountryEvent) {
    CountryEvent["Created"] = "countryCreated";
    CountryEvent["Updated"] = "countryUpdated";
    CountryEvent["Deleted"] = "countryDeleted";
})(CountryEvent || (exports.CountryEvent = CountryEvent = {}));
var ExchangeRateEvent;
(function (ExchangeRateEvent) {
    ExchangeRateEvent["Created"] = "exchangeRateCreated";
    ExchangeRateEvent["Updated"] = "exchangeRateUpdated";
    ExchangeRateEvent["Deleted"] = "exchangeRateDeleted";
})(ExchangeRateEvent || (exports.ExchangeRateEvent = ExchangeRateEvent = {}));
var ParcelEvent;
(function (ParcelEvent) {
    ParcelEvent["Created"] = "parcelCreated";
    ParcelEvent["Updated"] = "parcelUpdated";
    ParcelEvent["Deleted"] = "parcelDeleted";
    ParcelEvent["BulkUpdated"] = "parcelBulkUpdated";
    ParcelEvent["StatusChanged"] = "parcelStatusChanged";
    ParcelEvent["BulkStatusChanged"] = "parcelBulkStatusChanged";
    ParcelEvent["AddedToInventory"] = "addedToInventory";
    ParcelEvent["RemovedFromInventory"] = "removedFromInventory";
})(ParcelEvent || (exports.ParcelEvent = ParcelEvent = {}));
var RoleEvent;
(function (RoleEvent) {
    RoleEvent["Created"] = "roleCreated";
    RoleEvent["Updated"] = "roleUpdated";
    RoleEvent["Deleted"] = "roleDeleted";
})(RoleEvent || (exports.RoleEvent = RoleEvent = {}));
var WarehouseEvent;
(function (WarehouseEvent) {
    WarehouseEvent["Created"] = "warehouseCreated";
    WarehouseEvent["Updated"] = "warehouseUpdated";
    WarehouseEvent["Deleted"] = "warehouseDeleted";
})(WarehouseEvent || (exports.WarehouseEvent = WarehouseEvent = {}));
var UserEvent;
(function (UserEvent) {
    UserEvent["Created"] = "userCreated";
    UserEvent["Updated"] = "userUpdated";
    UserEvent["Deleted"] = "userDeleted";
})(UserEvent || (exports.UserEvent = UserEvent = {}));
