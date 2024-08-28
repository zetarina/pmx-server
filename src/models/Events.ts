export enum CityEvent {
  Created = "cityCreated",
  Updated = "cityUpdated",
  Deleted = "cityDeleted",
}

export enum CountryEvent {
  Created = "countryCreated",
  Updated = "countryUpdated",
  Deleted = "countryDeleted",
}

export enum ExchangeRateEvent {
  Created = "exchangeRateCreated",
  Updated = "exchangeRateUpdated",
  Deleted = "exchangeRateDeleted",
}

export enum ParcelEvent {
  Created = "parcelCreated",
  Updated = "parcelUpdated",
  Deleted = "parcelDeleted",
  BulkUpdated = "parcelBulkUpdated",
  StatusChanged = "parcelStatusChanged",
  BulkStatusChanged = "parcelBulkStatusChanged",
  AddedToInventory = "addedToInventory",
  RemovedFromInventory = "removedFromInventory",
}

export enum RoleEvent {
  Created = "roleCreated",
  Updated = "roleUpdated",
  Deleted = "roleDeleted",
}

export enum WarehouseEvent {
  Created = "warehouseCreated",
  Updated = "warehouseUpdated",
  Deleted = "warehouseDeleted",
}

export enum UserEvent {
  Created = "userCreated",
  Updated = "userUpdated",
  Deleted = "userDeleted",
}
