import mongoose, { Model } from "mongoose";
import { getCountryModel, Country } from "../models/Country";
import { getCityModel, City } from "../models/City";
import { getWarehouseModel, Warehouse } from "../models/Warehouse";
import { getUserModel, User } from "../models/User";
import { getParcelModel, Parcel } from "../models/Parcel";
import { Parser } from "json2csv";

export class CSVRepository {
  private countryModel: Model<Country>;
  private cityModel: Model<City>;
  private warehouseModel: Model<Warehouse>;
  private userModel: Model<User>;
  private parcelModel: Model<Parcel>;

  constructor() {
    this.countryModel = getCountryModel();
    this.cityModel = getCityModel();
    this.warehouseModel = getWarehouseModel();
    this.userModel = getUserModel();
    this.parcelModel = getParcelModel();
  }

  private isValidObjectId(id: string): boolean {
    return mongoose.Types.ObjectId.isValid(id);
  }

  generateSampleCSV(): string {
    const fields = [
      "Receiver Name",
      "Receiver Phone Number",
      "Receiver Address",
      "Receiver City",
      "Receiver Country",
      "Receiver Zip",
      "Delivery Fees",
      "Weight",
      "Size",
      "Discount Value",
      "Tax Value",
      "Payment Type",
      "Remark",
    ];
    const sampleData = [{}];
    const json2csvParser = new Parser({ fields });
    return json2csvParser.parse(sampleData);
  }

  async validateEntities(uniqueValues: {
    countries: string[];
    cities: string[];
  }): Promise<{
    countries: Country[];
    cities: City[];
  }> {
    const countryNames = uniqueValues.countries.filter(
      (idOrName) => !this.isValidObjectId(idOrName)
    );
    const cityNames = uniqueValues.cities.filter(
      (idOrName) => !this.isValidObjectId(idOrName)
    );

    const validatedCountries = await this.countryModel
      .find({
        $or: [
          { _id: { $in: uniqueValues.countries.filter(this.isValidObjectId) } },
          {
            name: {
              $in: countryNames.map((name) => new RegExp(`^${name}$`, "i")),
            },
          },
        ],
      })
      .exec();

    const validatedCities = await this.cityModel
      .find({
        $or: [
          { _id: { $in: uniqueValues.cities.filter(this.isValidObjectId) } },
          {
            name: {
              $in: cityNames.map((name) => new RegExp(`^${name}$`, "i")),
            },
          },
        ],
      })
      .exec();

    return {
      countries: validatedCountries,
      cities: validatedCities,
    };
  }

  async validateShipper(shipperId: string): Promise<User | null> {
    if (!this.isValidObjectId(shipperId)) return null;
    return this.userModel.findById(shipperId).exec();
  }

  async validateWarehouse(warehouseId: string): Promise<Warehouse | null> {
    if (!this.isValidObjectId(warehouseId)) return null;
    return this.warehouseModel.findById(warehouseId).exec();
  }

  async isParcelIdExists(parcelId: string): Promise<boolean> {
    const parcel = await this.parcelModel.findOne({ parcelId }).exec();
    return !!parcel;
  }

  async createParcels(parcels: Parcel[]): Promise<void> {
    await this.parcelModel.insertMany(parcels);
  }
}
