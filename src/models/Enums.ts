export enum InventoryType {
  Local = "local",
  LongHaul = "longHaul",
  Shipper = "shipper",
}

export enum InventoryChange {
  AddedToInventory = "addedToInventory",
  RemovedFromInventory = "removedFromInventory",
}

export enum ActionType {
  Local = "local",
  LongHaul = "longHaul",
}

export enum DeliveryAction {
  Deliver = "deliver",
  Reschedule = "reschedule",
  Cancel = "cancel",
}
