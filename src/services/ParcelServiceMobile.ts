import { ParcelRepository } from "../repositories/ParcelRepository";
import {
  Parcel,
  ParcelStatus,
  PaymentStatus,
  PaymentType,
  TrackingHistory,
} from "../models/Parcel";
import mongoose from "mongoose";
import { ActionType, DeliveryAction } from "../models/Enums";
import { ParcelStatusChangePayload } from "../utils/socket-utils";

export class ParcelServiceMobile {
  private parcelRepository: ParcelRepository;

  constructor() {
    this.parcelRepository = new ParcelRepository();
  }

  private createTrackingHistory(
    newStatus: ParcelStatus,
    driverId?: string,
    warehouseId?: any
  ): TrackingHistory {
    return {
      status: newStatus,
      timestamp: new Date(),
      driverId: driverId ? new mongoose.Types.ObjectId(driverId) : undefined,
      warehouseId: warehouseId
        ? new mongoose.Types.ObjectId(warehouseId)
        : undefined,
    };
  }

  private buildParcelStatusChangePayload(
    updatedParcel: Parcel
  ): ParcelStatusChangePayload {
    return {
      _id: updatedParcel._id,
      status: updatedParcel.status,
      trackingHistory: updatedParcel.trackingHistory,
      paymentStatus: updatedParcel.paymentStatus,
    };
  }

  async changeParcelStatus(
    id: string,
    newStatus: ParcelStatus,
    driverId?: string,
    warehouseId?: string,
    paymentStatus?: PaymentStatus
  ): Promise<ParcelStatusChangePayload | null> {
    // Determine whether 'id' is a valid ObjectId
    const isObjectId = mongoose.Types.ObjectId.isValid(id);

    // Fetch the parcel using either _id or parcelId
    const parcel = isObjectId
      ? await this.parcelRepository.getParcelById(id) // Use _id
      : await this.parcelRepository.getParcelByParcelId(id); // Use parcelId

    if (!parcel) throw new Error("Parcel not found");

    // Handle the status `InWarehouse` - check for warehouseId change
    if (parcel.status === ParcelStatus.InWarehouse) {
      const lastTrackingEntry =
        parcel.trackingHistory[parcel.trackingHistory.length - 1];
      const lastWarehouseId = lastTrackingEntry?.warehouseId?.toString();

      // If the warehouseId is the same, do not update the tracking history
      if (warehouseId && lastWarehouseId && lastWarehouseId === warehouseId) {
        return this.buildParcelStatusChangePayload(parcel);
      }
    }

    // Handle other statuses that depend on driverId change
    const statusRequiringDriverCheck = [
      ParcelStatus.OutForDelivery,
      ParcelStatus.OnVehicle,
      ParcelStatus.Border,
      ParcelStatus.Delivered,
    ];

    if (statusRequiringDriverCheck.includes(parcel.status)) {
      const lastTrackingEntry =
        parcel.trackingHistory[parcel.trackingHistory.length - 1];
      const lastDriverId = lastTrackingEntry?.driverId?.toString();
      const lastStatus = lastTrackingEntry?.status;

      // If the driverId is the same but the status is different, allow the update
      if (driverId && lastDriverId && lastDriverId === driverId) {
        if (lastStatus !== newStatus) {
          // Allow update if status is different
        } else {
          // If the driverId and status are the same, don't update the tracking history
          return this.buildParcelStatusChangePayload(parcel);
        }
      }
    }

    // Update status and other properties
    parcel.status = newStatus;

    if (driverId) {
      parcel.currentDriverId = new mongoose.Types.ObjectId(driverId);
    } else if (warehouseId) {
      parcel.currentDriverId = undefined;
    }

    if (
      newStatus === ParcelStatus.Delivered &&
      parcel.paymentType === PaymentType.PayByRecipients
    ) {
      parcel.paymentStatus = PaymentStatus.Completed;
    } else if (paymentStatus) {
      parcel.paymentStatus = paymentStatus;
    }

    // Add the new tracking history only if there's a relevant change
    parcel.trackingHistory.push(
      this.createTrackingHistory(newStatus, driverId, warehouseId)
    );

    const updatedParcel = await this.parcelRepository.updateParcelSystem(
      parcel._id!,
      parcel
    );

    return updatedParcel
      ? this.buildParcelStatusChangePayload(updatedParcel)
      : null;
  }

  async revertParcelStatus(
    parcelId: string
  ): Promise<ParcelStatusChangePayload | null> {
    const parcel = await this.parcelRepository.getParcelByParcelId(parcelId);
    if (!parcel) throw new Error("Parcel not found");

    if (
      ![ParcelStatus.OnVehicle, ParcelStatus.OutForDelivery].includes(
        parcel.status
      )
    ) {
      throw new Error(
        "Only parcels that are OnVehicle or OutForDelivery can be reverted"
      );
    }

    parcel.trackingHistory.pop();
    const previousStatus =
      parcel.trackingHistory[parcel.trackingHistory.length - 1];
    parcel.status = previousStatus.status as ParcelStatus;

    const updatedParcel = await this.parcelRepository.updateParcelSystem(
      parcel._id!,
      parcel
    );

    return updatedParcel
      ? this.buildParcelStatusChangePayload(updatedParcel)
      : null;
  }

  async scanParcel(
    parcelId: string,
    driverId: string,
    action: ActionType
  ): Promise<ParcelStatusChangePayload | null> {
    const newStatus =
      action === ActionType.Local
        ? ParcelStatus.OutForDelivery
        : ParcelStatus.OnVehicle;

    return this.changeParcelStatus(parcelId, newStatus, driverId);
  }

  async submitDeliveryAction(
    _id: string,
    driverId: string,
    action: DeliveryAction
  ): Promise<ParcelStatusChangePayload | null> {
    console.log(
      `submitDeliveryAction called with _id: ${_id}, driverId: ${driverId}, action: ${action}`
    );

    const parcel = await this.parcelRepository.getParcelById(_id);
    if (!parcel) throw new Error("Parcel not found");

    if (
      [
        ParcelStatus.Delivered,
        ParcelStatus.Rescheduled,
        ParcelStatus.Cancelled,
      ].includes(parcel.status)
    ) {
      throw new Error(
        "Delivered, Rescheduled, or Cancelled parcels cannot be updated again"
      );
    }

    let newStatus: ParcelStatus;
    switch (action) {
      case DeliveryAction.Deliver:
        newStatus = ParcelStatus.Delivered;
        break;
      case DeliveryAction.Reschedule:
        newStatus = ParcelStatus.Rescheduled;
        break;
      case DeliveryAction.Cancel:
        newStatus = ParcelStatus.Cancelled;
        break;
      default:
        throw new Error("Invalid action");
    }

    return this.changeParcelStatus(parcel._id!.toString(), newStatus, driverId);
  }

  async markAllParcelsAsBorder(
    driverId: string
  ): Promise<ParcelStatusChangePayload[]> {
    const parcels = await this.parcelRepository.getParcelsByDriver(
      driverId,
      ActionType.LongHaul
    );

    const updatedParcels: ParcelStatusChangePayload[] = [];

    for (const parcel of parcels) {
      if (parcel.status !== ParcelStatus.Border) {
        const updatedParcel = await this.changeParcelStatus(
          parcel._id!.toString(),
          ParcelStatus.Border,
          driverId
        );

        if (updatedParcel) updatedParcels.push(updatedParcel);
      }
    }

    return updatedParcels;
  }

  async getMyInventory(driverId: string, type: ActionType): Promise<Parcel[]> {
    return this.parcelRepository.getParcelsByDriver(driverId, type);
  }

  async getShipperInventory(id: string): Promise<Parcel[]> {
    return this.parcelRepository.getParcelsByShipper(id);
  }

  async getParcelByParcelId(parcelId: string): Promise<Parcel | null> {
    return this.parcelRepository.getParcelByParcelId(parcelId);
  }

  async getParcelById(parcelId: string): Promise<Parcel | null> {
    return this.parcelRepository.getParcelById(parcelId);
  }
}
