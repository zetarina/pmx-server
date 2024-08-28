import mongoose, { Model } from "mongoose";
import { Parcel, ParcelStatus, getParcelModel } from "../models/Parcel";
import { ActionType } from "../models/Enums";

export class ParcelRepository {
  private parcelModel: Model<Parcel>;

  constructor() {
    this.parcelModel = getParcelModel();
  }

  async createParcel(parcel: Parcel): Promise<Parcel | null> {
    try {
      const newParcel = await this.parcelModel.create(parcel);
      return this.getParcelById(newParcel._id.toString());
    } catch (error: any) {
      throw new Error(`Error creating parcel: ${error.message}`);
    }
  }

  async updateParcelSystem(
    parcelId: mongoose.Types.ObjectId,
    parcelUpdate: Partial<Parcel>
  ): Promise<Parcel | null> {
    try {
      const updatedParcel = await this.parcelModel
        .findByIdAndUpdate(parcelId, parcelUpdate, { new: true })
        .populate({
          path: "sender.shipper",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        })
        .populate({
          path: "sender.guest.country",
        })
        .populate({
          path: "sender.guest.city",
        })
        .populate({
          path: "receiver.country",
        })
        .populate({
          path: "receiver.city",
        })
        .populate({
          path: "trackingHistory.driver",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        })
        .populate({
          path: "trackingHistory.warehouse",
        })
        .populate({
          path: "currentDriver",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        })
        .populate("exchangeRate")
        .populate({
          path: "createdBy",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        });

      return updatedParcel ? updatedParcel.toObject() : null;
    } catch (error: any) {
      throw new Error(`Error updating parcel: ${error.message}`);
    }
  }

  async updateParcelUser(
    parcelId: string,
    parcelUpdate: Partial<Parcel>
  ): Promise<Parcel | null> {
    try {
      const updatedParcel = await this.parcelModel
        .findByIdAndUpdate(parcelId, parcelUpdate, { new: true })
        .populate({
          path: "sender.shipper",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        })
        .populate({
          path: "sender.guest.country",
        })
        .populate({
          path: "sender.guest.city",
        })
        .populate({
          path: "receiver.country",
        })
        .populate({
          path: "receiver.city",
        })
        .populate({
          path: "trackingHistory.driver",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        })
        .populate({
          path: "trackingHistory.warehouse",
        })
        .populate({
          path: "currentDriver",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        })
        .populate("exchangeRate")
        .populate({
          path: "createdBy",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        });

      return updatedParcel ? updatedParcel.toObject() : null;
    } catch (error: any) {
      throw new Error(`Error updating parcel: ${error.message}`);
    }
  }

  async deleteParcel(parcelId: string): Promise<boolean> {
    try {
      await this.parcelModel.findByIdAndDelete(parcelId);
      return true;
    } catch (error: any) {
      throw new Error(`Error deleting parcel: ${error.message}`);
    }
  }

  async getParcelById(_id: string): Promise<Parcel | null> {
    try {
      const parcel = await this.parcelModel
        .findById(_id)
        .populate({
          path: "sender.shipper",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        })
        .populate({
          path: "sender.guest.country",
        })
        .populate({
          path: "sender.guest.city",
        })
        .populate({
          path: "receiver.country",
        })
        .populate({
          path: "receiver.city",
        })
        .populate({
          path: "trackingHistory.driver",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        })
        .populate({
          path: "trackingHistory.warehouse",
        })
        .populate({
          path: "currentDriver",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        })
        .populate("exchangeRate")
        .populate({
          path: "createdBy",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        });
      return parcel ? parcel.toObject() : null;
    } catch (error: any) {
      throw new Error(`Error getting parcel by ID: ${error.message}`);
    }
  }

  async getSimpleParcelByParcelId(parcelId: string): Promise<Parcel | null> {
    try {
      const parcel = await this.parcelModel.findOne({ parcelId });
      return parcel;
    } catch (error: any) {
      throw new Error(
        `Error getting parcel by custom parcel ID: ${error.message}`
      );
    }
  }

  async getParcelByParcelId(parcelId: string): Promise<Parcel | null> {
    try {
      const parcel = await this.parcelModel
        .findOne({ parcelId })
        .populate({
          path: "sender.shipper",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        })
        .populate({
          path: "sender.guest.country",
        })
        .populate({
          path: "sender.guest.city",
        })
        .populate({
          path: "receiver.country",
        })
        .populate({
          path: "receiver.city",
        })
        .populate({
          path: "trackingHistory.driver",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        })
        .populate({
          path: "trackingHistory.warehouse",
        })
        .populate({
          path: "currentDriver",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        })
        .populate("exchangeRate")
        .populate({
          path: "createdBy",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        });
      return parcel ? parcel.toObject() : null;
    } catch (error: any) {
      throw new Error(
        `Error getting parcel by custom parcel ID: ${error.message}`
      );
    }
  }

  async getParcelsByUser(userId: string): Promise<Parcel[]> {
    try {
      const parcels = await this.parcelModel
        .find({ createdById: userId })
        .populate({
          path: "sender.shipper",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        })
        .populate({
          path: "sender.guest.country",
        })
        .populate({
          path: "sender.guest.city",
        })
        .populate({
          path: "receiver.country",
        })
        .populate({
          path: "receiver.city",
        })
        .populate({
          path: "trackingHistory.driver",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        })
        .populate({
          path: "trackingHistory.warehouse",
        })
        .populate({
          path: "currentDriver",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        })
        .populate("exchangeRate")
        .populate({
          path: "createdBy",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        });

      return parcels.map((parcel) => parcel.toObject());
    } catch (error: any) {
      throw new Error(`Error getting parcels by user: ${error.message}`);
    }
  }

  async getParcelsByDriver(
    driverId: string,
    type: ActionType
  ): Promise<Parcel[]> {
    try {
      console.log(type);
      console.log(type === ActionType.LongHaul);
      let query: any = { currentDriverId: driverId };
      if (type === ActionType.Local) {
        query.status = {
          $in: [
            ParcelStatus.OutForDelivery,
            ParcelStatus.Delivered,
            ParcelStatus.Rescheduled,
            ParcelStatus.Cancelled,
          ],
        };
      } else if (type === ActionType.LongHaul) {
        query.status = {
          $in: [ParcelStatus.OnVehicle, ParcelStatus.Border],
        };
      }
      const parcels = await this.parcelModel
        .find(query)
        .populate({
          path: "sender.shipper",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        })
        .populate("sender.guest.country")
        .populate("sender.guest.city")
        .populate("receiver.country")
        .populate("receiver.city")
        .populate({
          path: "trackingHistory.driver",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        })
        .populate("trackingHistory.warehouse")
        .populate({
          path: "currentDriver",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        })
        .populate("exchangeRate")
        .populate({
          path: "createdBy",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        });
      console.log(parcels);
      const mappedParcels = parcels.map((parcel) => parcel.toObject());
      return mappedParcels;
    } catch (error: any) {
      throw new Error(`Error getting parcels by driver: ${error.message}`);
    }
  }

  async getParcelsByShipper(shipperId: string): Promise<Parcel[]> {
    try {
      const parcels = await this.parcelModel
        .find({ "sender.shipper_id": shipperId })
        .populate({
          path: "sender.shipper",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        })
        .populate({
          path: "sender.guest.country",
        })
        .populate({
          path: "sender.guest.city",
        })
        .populate({
          path: "receiver.country",
        })
        .populate({
          path: "receiver.city",
        })
        .populate({
          path: "trackingHistory.driver",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        })
        .populate({
          path: "trackingHistory.warehouse",
        })
        .populate({
          path: "currentDriver",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        })
        .populate("exchangeRate")
        .populate({
          path: "createdBy",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        });

      return parcels.map((parcel) => parcel.toObject());
    } catch (error: any) {
      throw new Error(`Error getting parcels by shipper: ${error.message}`);
    }
  }

  async getAllParcels(
    page: number,
    limit: number,
    query: any
  ): Promise<{ parcels: Parcel[]; total: number }> {
    try {
      const filter = query && typeof query === "object" ? query : {};

      const parcelsQuery = this.parcelModel
        .find(filter)
        .populate({
          path: "sender.shipper",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        })
        .populate({
          path: "sender.guest.country",
        })
        .populate({
          path: "sender.guest.city",
        })
        .populate({
          path: "receiver.country",
        })
        .populate({
          path: "receiver.city",
        })
        .populate({
          path: "trackingHistory.driver",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        })
        .populate({
          path: "trackingHistory.warehouse",
        })
        .populate({
          path: "currentDriver",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        })
        .populate("exchangeRate")
        .populate({
          path: "createdBy",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        })
        .skip((page - 1) * limit)
        .limit(limit);

      const totalQuery = this.parcelModel.countDocuments(filter);

      const [parcels, total] = await Promise.all([parcelsQuery, totalQuery]);

      return {
        parcels: parcels.map((parcel) => parcel.toObject()),
        total,
      };
    } catch (error: any) {
      throw new Error(`Error getting all parcels: ${error.message}`);
    }
  }

  async getParcelsByIds(parcelIds: string[]): Promise<Parcel[]> {
    return this.parcelModel.find({ _id: { $in: parcelIds } }).exec();
  }

  async updateParcelsSystem(parcels: Parcel[]): Promise<Parcel[]> {
    const bulkOps = parcels.map((parcel) => ({
      updateOne: {
        filter: { _id: parcel._id },
        update: parcel,
      },
    }));

    await this.parcelModel.bulkWrite(bulkOps);

    // Fetch the updated parcels
    const updatedParcelIds = parcels.map((parcel) => parcel._id);
    const updatedParcels = await this.parcelModel
      .find({ _id: { $in: updatedParcelIds } })
      .populate({
        path: "sender.shipper",
        select: "-hashedPassword -salt",
        populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
      })
      .populate("sender.guest.country")
      .populate("sender.guest.city")
      .populate("receiver.country")
      .populate("receiver.city")
      .populate({
        path: "trackingHistory.driver",
        select: "-hashedPassword -salt",
        populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
      })
      .populate("trackingHistory.warehouse")
      .populate({
        path: "currentDriver",
        select: "-hashedPassword -salt",
        populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
      })
      .populate("exchangeRate")
      .populate({
        path: "createdBy",
        select: "-hashedPassword -salt",
        populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
      })
      .exec();

    return updatedParcels.map((parcel) => parcel.toObject());
  }

  async getParcelsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Parcel[]> {
    try {
      const parcels = await this.parcelModel
        .find({
          createdAt: { $gte: startDate, $lte: endDate },
        })
        .populate({
          path: "sender.shipper",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        })
        .populate({
          path: "sender.guest.country",
        })
        .populate({
          path: "sender.guest.city",
        })
        .populate({
          path: "receiver.country",
        })
        .populate({
          path: "receiver.city",
        })
        .populate({
          path: "trackingHistory.driver",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        })
        .populate({
          path: "trackingHistory.warehouse",
        })
        .populate({
          path: "currentDriver",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        })
        .populate("exchangeRate")
        .populate({
          path: "createdBy",
          select: "-hashedPassword -salt",
          populate: [{ path: "city" }, { path: "country" }, { path: "role" }],
        });

      return parcels.map((parcel) => parcel.toObject());
    } catch (error: any) {
      throw new Error(`Error fetching parcels by date range: ${error.message}`);
    }
  }
}
