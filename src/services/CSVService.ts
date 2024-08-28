import { CSVRepository } from "../repositories/CSVRepository";
import {
  Parcel,
  ParcelStatus,
  PaymentStatus,
  PaymentType,
  SenderType,
  TrackingHistory,
} from "../models/Parcel";
import mongoose from "mongoose";
import { Warehouse } from "../models/Warehouse";
import { User } from "../models/User";

export class CSVService {
  private csvRepo: CSVRepository;

  constructor() {
    this.csvRepo = new CSVRepository();
  }

  generateSampleCSV(): string {
    return this.csvRepo.generateSampleCSV();
  }

  async validateEntities(uniqueValues: {
    countries: string[];
    cities: string[];
  }) {
    console.log("Validating countries and cities...");
    return this.csvRepo.validateEntities(uniqueValues);
  }

  private async validateShipperAndWarehouse(
    shipperId: string,
    warehouseId: string
  ): Promise<{ shipper: User; warehouse: Warehouse }> {
    console.log(`Validating shipper with ID: ${shipperId}...`);
    const shipper = await this.csvRepo.validateShipper(shipperId);
    if (!shipper) {
      throw new Error("Shipper not found.");
    }

    console.log(`Validating warehouse with ID: ${warehouseId}...`);
    const warehouse = await this.csvRepo.validateWarehouse(warehouseId);
    if (!warehouse) {
      throw new Error("Initial warehouse not found.");
    }

    return { shipper, warehouse };
  }

  private createTrackingHistory(
    newStatus: ParcelStatus,
    warehouseId: any,
    driverId?: string
  ): TrackingHistory {
    console.log(`Creating tracking history for status: ${newStatus}...`);
    return {
      status: newStatus,
      timestamp: new Date(),
      warehouseId: warehouseId
        ? new mongoose.Types.ObjectId(warehouseId)
        : undefined,
      driverId: driverId ? new mongoose.Types.ObjectId(driverId) : undefined,
    };
  }

  private async generateParcelId(senderName: string): Promise<string> {
    console.log(`Generating parcel ID for sender: ${senderName}...`);
    senderName = senderName.replace(/\s+/g, "").slice(0, 4).toUpperCase();
    const randomPartLength = 8 - senderName.length;
    let parcelId = "";

    while (true) {
      const randomNumbers = Math.random()
        .toString()
        .slice(2, 2 + randomPartLength);
      parcelId = `${senderName}${randomNumbers}`;
      if (!(await this.csvRepo.isParcelIdExists(parcelId))) {
        break;
      }
    }

    console.log(`Generated parcel ID: ${parcelId}`);
    return parcelId;
  }

  async validateEntitiesAndCreateParcels(
    parcels: any[],
    shipperId: string,
    initialWarehouseId: string,
    userId: string
  ): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      console.log("Starting validation of shipper and warehouse...");
      const { shipper } = await this.validateShipperAndWarehouse(
        shipperId,
        initialWarehouseId
      );

      console.log("Collecting and validating country and city IDs...");
      const countryIdsOrNames = parcels.map(
        (parcel) => parcel.receiver.countryId
      );
      const cityIdsOrNames = parcels.map((parcel) => parcel.receiver.cityId);

      const { countries, cities } = await this.csvRepo.validateEntities({
        countries: countryIdsOrNames,
        cities: cityIdsOrNames,
      });

      console.log("Starting parcel validation and creation...");
      const validatedParcels = await Promise.all(
        parcels.map(async (parcel, index) => {
          const country = countries.find(
            (c) =>
              (c._id && c._id.toString() === parcel.receiver.countryId) ||
              c.name === parcel.receiver.countryId
          );
          const city = cities.find(
            (c) =>
              (c._id && c._id.toString() === parcel.receiver.cityId) ||
              c.name === parcel.receiver.cityId
          );

          if (!country) {
            errors.push(`Country not found for parcel at index ${index}`);
          }
          if (!city) {
            errors.push(`City not found for parcel at index ${index}`);
          }

          if (country && country._id) {
            parcel.receiver.countryId = country._id.toString();
          }
          if (city && city._id) {
            parcel.receiver.cityId = city._id.toString();
          }

          const parcelId = await this.generateParcelId(shipper.username);

          const trackingHistory: TrackingHistory[] = [
            this.createTrackingHistory(
              ParcelStatus.ParcelCreated,
              initialWarehouseId
            ),
            this.createTrackingHistory(
              ParcelStatus.InWarehouse,
              initialWarehouseId
            ),
          ];

          return {
            ...parcel,
            sender: {
              type: SenderType.Shipper,
              shipper_id: shipperId,
            },
            parcelId,
            trackingHistory,
            paymentStatus:
              parcel.paymentType === PaymentType.PayBySender
                ? PaymentStatus.Completed
                : PaymentStatus.Pending,
            createdById: new mongoose.Types.ObjectId(userId),
            status: ParcelStatus.InWarehouse,
          };
        })
      );

      if (errors.length > 0) {
        console.log("Validation errors occurred:", errors);
        return { success: false, errors };
      }

      console.log("All parcels validated successfully. Creating parcels...");
      await this.csvRepo.createParcels(validatedParcels);
      console.log("Parcels created successfully.");
      return { success: true, errors: [] };
    } catch (error: any) {
      console.error("Error occurred during parcel creation:", error);
      errors.push(error.message);
      return { success: false, errors };
    }
  }
}
