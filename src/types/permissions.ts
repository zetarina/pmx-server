export enum PermissionsList {
  CreateUser = "create_user",
  ReadUser = "read_user",
  UpdateUser = "update_user",
  DeleteUser = "delete_user",

  CreateRole = "create_role",
  ReadRole = "read_role",
  UpdateRole = "update_role",
  DeleteRole = "delete_role",

  CreateParcel = "create_parcel",
  ReadParcel = "read_parcel",
  UpdateParcel = "update_parcel",
  DeleteParcel = "delete_parcel",

  CreateWarehouse = "create_warehouse",
  ReadWarehouse = "read_warehouse",
  UpdateWarehouse = "update_warehouse",
  DeleteWarehouse = "delete_warehouse",

  CreateExchangeRate = "create_exchange_rate",
  ReadExchangeRate = "read_exchange_rate",
  UpdateExchangeRate = "update_exchange_rate",
  DeleteExchangeRate = "delete_exchange_rate",

  CreateCity = "create_city",
  ReadCity = "read_city",
  UpdateCity = "update_city",
  DeleteCity = "delete_city",

  CreateCountry = "create_country",
  ReadCountry = "read_country",
  UpdateCountry = "update_country",
  DeleteCountry = "delete_country",

  ScanParcelByDriver = "scan_parcel_by_driver",
  ScanParcelByWarehouse = "scan_parcel_by_warehouse",
  DeliverParcel = "deliver_parcel",
  RescheduleParcel = "reschedule_parcel",
  CancelParcel = "cancel_parcel",

  OfficeAcceptAllParcels = "office_accept_all_parcels",
  CompletePayment = "complete_payment",
  getInventory = "get_inventory",
  getShipperInventory = "get_shipper_inventory",
}
