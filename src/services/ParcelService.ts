import { ParcelRepository } from "../repositories/ParcelRepository";
import {
  Parcel,
  ParcelStatus,
  PaymentStatus,
  PaymentType,
  Sender,
  SenderType,
  TrackingHistory,
} from "../models/Parcel";
import mongoose from "mongoose";
import { UserRepository } from "../repositories/UserRepository";
import { CityRepository } from "../repositories/CityRepository";
import { CountryRepository } from "../repositories/CountryRepository";
import { WarehouseRepository } from "../repositories/WarehouseRepository";
import { ActionType } from "../models/Enums";

export class ParcelService {
  private parcelRepository: ParcelRepository;
  private userRepository: UserRepository;
  private cityRepository: CityRepository;
  private countryRepository: CountryRepository;
  private warehouseRepository: WarehouseRepository;

  constructor() {
    this.parcelRepository = new ParcelRepository();
    this.userRepository = new UserRepository();
    this.cityRepository = new CityRepository();
    this.countryRepository = new CountryRepository();
    this.warehouseRepository = new WarehouseRepository();
  }

  private async generateParcelId(sender: Sender): Promise<string> {
    let senderName =
      (sender.type === SenderType.Shipper && sender.shipper_id
        ? (await this.userRepository.getUserByObjectId(sender.shipper_id))
            ?.username
        : sender.guest?.name) || "";

    senderName = senderName.replace(/\s+/g, "").slice(0, 4).toUpperCase();
    const randomPartLength = 8 - senderName.length;
    let parcelId = "";

    while (true) {
      const randomNumbers = Math.random()
        .toString()
        .slice(2, 2 + randomPartLength);
      parcelId = `${senderName}${randomNumbers}`;
      if (!(await this.parcelRepository.getSimpleParcelByParcelId(parcelId))) {
        break;
      }
    }

    return parcelId;
  }

  private async validateCityAndCountryIds(parcel: any) {
    try {
      if (parcel.receiver?.cityId) {
        const receiverCity = await this.cityRepository.getCityById(
          parcel.receiver.cityId
        );
        if (!receiverCity) throw new Error("Receiver city not found");
        parcel.receiver.cityId = receiverCity._id;
      }

      if (parcel.receiver?.countryId) {
        const receiverCountry = await this.countryRepository.getCountryById(
          parcel.receiver.countryId
        );
        if (!receiverCountry) throw new Error("Receiver country not found");
        parcel.receiver.countryId = receiverCountry._id;
      }

      if (parcel.sender?.type === SenderType.Guest) {
        parcel.sender.shipper_id = null;
        const guest = parcel.sender.guest;
        if (guest) {
          if (
            !guest.name ||
            !guest.phoneNumber ||
            !guest.address ||
            !guest.countryId ||
            !guest.cityId ||
            !guest.zip
          ) {
            throw new Error("All guest fields are required");
          }

          const guestCountry = await this.countryRepository.getCountryById(
            guest.countryId
          );
          if (!guestCountry) throw new Error("Guest country not found");

          const guestCity = await this.cityRepository.getCityById(guest.cityId);
          if (!guestCity) throw new Error("Guest city not found");

          guest.countryId = guestCountry._id;
          guest.cityId = guestCity._id;
        }
        delete parcel.sender.shipper_id;
      } else if (parcel.sender?.type === SenderType.Shipper) {
        parcel.sender.guest = null;
        if (!parcel.sender.shipper_id) {
          throw new Error("Shipper ID is required for Shipper sender type");
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  private createTrackingHistory(
    newStatus: ParcelStatus,
    driverId?: string,
    warehouseId?: string
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

  async validateAndCreateParcel(
    parcel: any,
    initialWarehouseId: string,
    userId: string
  ): Promise<Parcel | null> {
    if (!initialWarehouseId)
      throw new Error("Initial warehouse ID is required");

    const initialWarehouse = await this.warehouseRepository.getWarehouseById(
      initialWarehouseId
    );
    if (!initialWarehouse || !initialWarehouse._id)
      throw new Error("Initial warehouse not found");

    await this.validateCityAndCountryIds(parcel);
    return this.createParcel(parcel, initialWarehouse._id, userId);
  }

  async createParcel(
    parcel: Parcel,
    initialWarehouseId: mongoose.Types.ObjectId,
    userId: string
  ): Promise<Parcel | null> {
    const user = await this.userRepository.getUserById(userId);
    if (!user || !user._id) throw new Error("No User");

    parcel.paymentStatus =
      parcel.paymentType === PaymentType.PayBySender
        ? PaymentStatus.Completed
        : PaymentStatus.Pending;
    parcel.createdById = user._id!;
    parcel.parcelId = await this.generateParcelId(parcel.sender);
    parcel.trackingHistory = [
      this.createTrackingHistory(ParcelStatus.ParcelCreated),
      this.createTrackingHistory(
        ParcelStatus.InWarehouse,
        undefined,
        initialWarehouseId.toString()
      ),
    ];
    parcel.status = ParcelStatus.InWarehouse;

    return this.parcelRepository.createParcel(parcel);
  }

  async getAllParcels(
    page: number,
    limit: number,
    query: any
  ): Promise<{ parcels: Parcel[]; total: number }> {
    return this.parcelRepository.getAllParcels(page, limit, query);
  }

  async updateParcelUser(
    parcelId: string,
    parcelUpdate: Partial<Parcel>
  ): Promise<Parcel | null> {
    await this.validateCityAndCountryIds(parcelUpdate);
    delete parcelUpdate.parcelId;
    delete parcelUpdate.createdById;
    delete parcelUpdate.status;
    delete parcelUpdate.trackingHistory;
    delete parcelUpdate.currentDriverId;
    delete parcelUpdate.currentDriver;
    delete parcelUpdate.exchangeRateId;
    delete parcelUpdate.exchangeRate;
    delete parcelUpdate.paymentStatus;
    delete parcelUpdate.createdBy;

    return this.parcelRepository.updateParcelUser(parcelId, parcelUpdate);
  }

  async deleteParcel(parcelId: string): Promise<boolean | null> {
    return this.parcelRepository.deleteParcel(parcelId);
  }

  async getParcelByParcelId(parcelId: string): Promise<Parcel | null> {
    return this.parcelRepository.getParcelByParcelId(parcelId);
  }

  async getParcelById(_id: string): Promise<Parcel | null> {
    return this.parcelRepository.getParcelById(_id);
  }
  async processParcelsForLongHaul(
    parcelIds: string[],
    warehouseId: string
  ): Promise<Parcel[]> {
    const parcels = await this.parcelRepository.getParcelsByIds(parcelIds);

    if (!parcels || parcels.length === 0) {
      throw new Error("No parcels found with the provided IDs");
    }

    const processedParcels = parcels.map((parcel) => {
      if (!parcel || !parcel._id) {
        throw new Error(`Parcel with ID ${parcel.parcelId} not found`);
      }

      // Check if the parcel was incorrectly marked as Delivered
      if (parcel.status === ParcelStatus.Delivered) {
        // Remove the Delivered status from tracking history
        parcel.trackingHistory = parcel.trackingHistory.filter(
          (history) => history.status !== ParcelStatus.Delivered
        );
      }

      // Check if the parcel is already in the warehouse with the given warehouseId
      const lastTrackingHistory =
        parcel.trackingHistory[parcel.trackingHistory.length - 1];

      if (
        lastTrackingHistory.status !== ParcelStatus.InWarehouse ||
        lastTrackingHistory.warehouseId?.toString() !== warehouseId
      ) {
        // Add a new history entry indicating the parcel is now in the warehouse
        parcel.status = ParcelStatus.InWarehouse;
        parcel.trackingHistory.push(
          this.createTrackingHistory(
            ParcelStatus.InWarehouse,
            undefined,
            warehouseId
          )
        );
      }

      return parcel;
    });

    // Update the parcels in the repository and return the updated parcels
    const updatedParcels = await this.parcelRepository.updateParcelsSystem(
      processedParcels
    );
    return updatedParcels;
  }

  async getParcelsByDriver(
    driverId: string,
    type: ActionType
  ): Promise<Parcel[]> {
    return this.parcelRepository.getParcelsByDriver(driverId, type);
  }
  async processDriverParcels(
    driverId: string,
    packageIds: string[],
    warehouseId: string
  ): Promise<Parcel[]> {
    const parcels = await this.parcelRepository.getParcelsByIds(packageIds);

    if (!parcels || parcels.length === 0) {
      throw new Error("No parcels found with the provided IDs");
    }

    const processedParcels = parcels.map((parcel) => {
      if (
        !parcel.currentDriverId ||
        parcel.currentDriverId.toString() !== driverId
      ) {
        throw new Error(
          `Parcel ${parcel.parcelId} is not assigned to this driver`
        );
      }

      switch (parcel.status) {
        case ParcelStatus.OutForDelivery:
          parcel.status = ParcelStatus.InWarehouse;
          parcel.trackingHistory.push({
            status: ParcelStatus.InWarehouse,
            timestamp: new Date(),
            driverId: new mongoose.Types.ObjectId(driverId),
            warehouseId: new mongoose.Types.ObjectId(warehouseId),
          });
          break;

        case ParcelStatus.Delivered:
          parcel.status = ParcelStatus.Completed;
          parcel.trackingHistory.push({
            status: ParcelStatus.Completed,
            timestamp: new Date(),
            driverId: new mongoose.Types.ObjectId(driverId),
            warehouseId: new mongoose.Types.ObjectId(warehouseId),
          });
          break;

        case ParcelStatus.Rescheduled:
        case ParcelStatus.Cancelled:
          parcel.status = ParcelStatus.InWarehouse;
          parcel.trackingHistory.push({
            status: ParcelStatus.InWarehouse,
            timestamp: new Date(),
            driverId: new mongoose.Types.ObjectId(driverId),
            warehouseId: new mongoose.Types.ObjectId(warehouseId),
          });
          break;

        default:
          throw new Error(
            `Parcel ${parcel.parcelId} cannot be processed in its current status: ${parcel.status}`
          );
      }

      return parcel;
    });

    // Update the parcels in the repository and return the updated parcels
    const updatedParcels = await this.parcelRepository.updateParcelsSystem(
      processedParcels
    );
    return updatedParcels;
  }

  async getParcelsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Parcel[]> {
    try {
      // Ensure the startDate and endDate are valid dates
      if (!startDate || !endDate) {
        throw new Error("Start date and end date are required");
      }

      // Fetch parcels from the repository
      return await this.parcelRepository.getParcelsByDateRange(
        startDate,
        endDate
      );
    } catch (error: any) {
      console.error(`Error fetching parcels by date range: ${error.message}`);
      throw new Error(`Error fetching parcels by date range: ${error.message}`);
    }
  }
}
