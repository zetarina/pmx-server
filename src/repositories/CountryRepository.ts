// CountryRepository.ts
import { Model } from "mongoose";
import { Country, getCountryModel } from "../models/Country";

export class CountryRepository {
  private countryModel: Model<Country>;

  constructor() {
    this.countryModel = getCountryModel();
  }
  async getAllCountries(
    page: number,
    limit: number,
    query: string
  ): Promise<{ countries: Country[]; total: number }> {
    try {
      const countriesQuery = this.countryModel
        .find({ name: new RegExp(query, "i") })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

      const totalQuery = this.countryModel
        .countDocuments({ name: new RegExp(query, "i") })
        .exec();

      const [countries, total] = await Promise.all([countriesQuery, totalQuery]);

      return { countries: countries.map((country) => country.toObject()), total };
    } catch (error: any) {
      console.error("Error getting countries:", error);
      throw new Error(`Error getting countries: ${error.message}`);
    }
  }
  async createCountry(country: Country): Promise<Country | null> {
    try {
      const newCountry = await this.countryModel.create(country);
      return this.getCountryById(newCountry._id.toString());
    } catch (error: any) {
      throw new Error(`Error creating country: ${error.message}`);
    }
  }

  async updateCountry(
    countryId: string,
    countryUpdate: Partial<Country>
  ): Promise<Country | null> {
    try {
      const updatedCountry = await this.countryModel.findByIdAndUpdate(
        countryId,
        countryUpdate,
        { new: true }
      );
      return updatedCountry ? updatedCountry.toObject() : null;
    } catch (error: any) {
      throw new Error(`Error updating country: ${error.message}`);
    }
  }

  async deleteCountry(countryId: string): Promise<boolean> {
    try {
      await this.countryModel.findByIdAndDelete(countryId);
      return true;
    } catch (error: any) {
      throw new Error(`Error deleting country: ${error.message}`);
    }
  }

  async getCountryById(countryId: string): Promise<Country | null> {
    try {
      const country = await this.countryModel.findById(countryId);
      return country ? country.toObject() : null;
    } catch (error: any) {
      throw new Error(`Error getting country by ID: ${error.message}`);
    }
  }

  async getCountryByCode(code: string): Promise<Country | null> {
    try {
      const country = await this.countryModel.findOne({ code });
      return country ? country.toObject() : null;
    } catch (error: any) {
      throw new Error(`Error getting country by code: ${error.message}`);
    }
  }
}
