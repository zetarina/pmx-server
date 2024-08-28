import { io } from "../app";
import { ParcelEvent } from "../models/Events";
import {
  Parcel,
  ParcelStatus,
  PaymentStatus,
  TrackingHistory,
} from "../models/Parcel";
import mongoose from "mongoose";
import { InventoryType, InventoryChange } from "../models/Enums";

interface ParcelStatusChangePayload {
  _id?: mongoose.Types.ObjectId;
  status?: ParcelStatus;
  paymentStatus?: PaymentStatus;
  trackingHistory?: TrackingHistory[];
}

interface ParcelInventoryChangePayload {
  userId: mongoose.Types.ObjectId;
  parcelId: mongoose.Types.ObjectId;
  inventoryType: InventoryType;
}

interface ParcelRemovedFromInventoryPayload {
  userId: mongoose.Types.ObjectId;
  parcelId?: mongoose.Types.ObjectId;
  inventoryType: InventoryType;
}

const emitParcelStatusChanged = (parcel: ParcelStatusChangePayload) => {
  io.emit(ParcelEvent.StatusChanged, parcel);
};

const emitBulkParcelStatusChanged = (parcels: ParcelStatusChangePayload[]) => {
  io.emit(ParcelEvent.BulkStatusChanged, { parcels });
};

const emitParcelInventoryChange = (
  action: InventoryChange,
  userId: mongoose.Types.ObjectId,
  parcelId: mongoose.Types.ObjectId | undefined,
  inventoryType: InventoryType
) => {
  if (action === InventoryChange.AddedToInventory) {
    io.emit(ParcelEvent.AddedToInventory, {
      userId,
      parcelId,
      inventoryType,
    } as ParcelInventoryChangePayload);
  } else if (action === InventoryChange.RemovedFromInventory) {
    io.emit(ParcelEvent.RemovedFromInventory, {
      userId,
      parcelId,
      inventoryType,
    } as ParcelRemovedFromInventoryPayload);
  }
};

export {
  ParcelStatusChangePayload,
  emitParcelStatusChanged,
  emitBulkParcelStatusChanged,
  emitParcelInventoryChange,
};
