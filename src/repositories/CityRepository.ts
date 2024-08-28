import { Model } from "mongoose";
import { City, getCityModel } from "../models/City";

export class CityRepository {
  private cityModel: Model<City>;

  constructor() {
    this.cityModel = getCityModel();
  }

  async getAllCities(
    page: number,
    limit: number,
    query: string
  ): Promise<{ cities: City[]; total: number }> {
    try {
      const citiesQuery = this.cityModel
        .find({ name: new RegExp(query, "i") }).populate("country")
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

      const totalQuery = this.cityModel
        .countDocuments({ name: new RegExp(query, "i") })
        .exec();

      const [cities, total] = await Promise.all([citiesQuery, totalQuery]);

      return { cities: cities.map((city) => city.toObject()), total };
    } catch (error: any) {
      console.error("Error getting cities:", error);
      throw new Error(`Error getting cities: ${error.message}`);
    }
  }

  async createCity(city: City): Promise<City | null> {
    try {
      const newCity = await this.cityModel.create(city);
      return this.getCityById(newCity._id.toString());
    } catch (error: any) {
      throw new Error(`Error creating city: ${error.message}`);
    }
  }

  async updateCity(
    cityId: string,
    cityUpdate: Partial<City>
  ): Promise<City | null> {
    try {
      const updatedCity = await this.cityModel
        .findByIdAndUpdate(cityId, cityUpdate, { new: true })
        .populate("country");
      return updatedCity ? updatedCity.toObject() : null;
    } catch (error: any) {
      throw new Error(`Error updating city: ${error.message}`);
    }
  }

  async deleteCity(cityId: string): Promise<boolean> {
    try {
      await this.cityModel.findByIdAndDelete(cityId).populate("country");
      return true;
    } catch (error: any) {
      throw new Error(`Error deleting city: ${error.message}`);
    }
  }

  async getCityById(cityId: string): Promise<City | null> {
    try {
      const city = await this.cityModel.findById(cityId).populate("country");
      return city ? city.toObject() : null;
    } catch (error: any) {
      throw new Error(`Error getting city by ID: ${error.message}`);
    }
  }

  async getCitiesByCountry(
    countryId: string,
    page: number,
    limit: number,
    query: any
  ): Promise<{ cities: City[]; total: number }> {
    try {

      const cities = await this.cityModel
        .find({ countryId, name: new RegExp(query, "i") })
        .populate("country")
        .skip((page - 1) * limit)
        .limit(limit);
      const total = await this.cityModel.countDocuments({
        countryId,
        name: new RegExp(query, "i"),
      });
      return {
        cities: cities.map((city) => city.toObject()),
        total,
      };
    } catch (error: any) {
      throw new Error(`Error getting cities by country: ${error.message}`);
    }
  }

  async getCityByName(name: string): Promise<City | null> {
    try {
      const city = await this.cityModel.findOne({ name }).populate("country");
      return city ? city.toObject() : null;
    } catch (error: any) {
      throw new Error(`Error getting city by name: ${error.message}`);
    }
  }
}
