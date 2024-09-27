import express from "express";
import { hashPassword } from "../utils/crypto-utils";
import { UserRepository } from "../repositories/UserRepository";
import { RoleRepository } from "../repositories/RoleRepository";
import { CityRepository } from "../repositories/CityRepository";
import { CountryRepository } from "../repositories/CountryRepository";
import { PermissionsList } from "../types/permissions";
import { PermissionsObject } from "../models/Role";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const router = express.Router();
const userRepository = new UserRepository();
const roleRepository = new RoleRepository();
const cityRepository = new CityRepository();
const countryRepository = new CountryRepository();

const predefinedUserId = process.env.PREDEFINED_USER_ID;

if (!predefinedUserId) {
  throw new Error("PREDEFINED_USER_ID is not set in the environment variables");
}

router.get("/", async (req, res) => {
  try {
    const existingUser = await userRepository.getUserById(predefinedUserId);
    if (existingUser) {
      return res.status(200).json({ setupCompleted: true, existingUser });
    }

    return res.status(200).json({ setupCompleted: false });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  const {
    countryCode,
    countryName,
    cityName,
    superAdminUsername,
    superAdminEmail,
    superAdminPassword,
    systemUsername,
    systemEmail,
    systemPassword,
  } = req.body;

  try {
    let country = await countryRepository.getCountryByCode(countryCode);
    if (!country) {
      country = await countryRepository.createCountry({
        code: countryCode,
        name: countryName,
      });
    }
    if (!country || !country._id) {
      throw new Error("Failed to create or retrieve country");
    }

    let city = await cityRepository.getCityByName(cityName);
    if (!city) {
      city = await cityRepository.createCity({
        name: cityName,
        countryId: country._id,
      });
    }
    if (!city || !city._id) {
      throw new Error("Failed to create or retrieve city");
    }

    const superAdminPermissions = Object.values(PermissionsList).reduce(
      (acc, permission) => {
        acc[permission] = true;
        return acc;
      },
      {} as PermissionsObject
    );

    let superAdminRole = await roleRepository.getRoleByName("Super Admin");
    if (!superAdminRole) {
      superAdminRole = await roleRepository.createRole({
        name: "Super Admin",
        permissions: superAdminPermissions,
        isShipper: false,
        isDriver: false,
      });
    }
    if (!superAdminRole || !superAdminRole._id) {
      throw new Error("Failed to create or retrieve Super Admin role");
    }

    const { salt: superAdminSalt, hash: superAdminHashedPassword } =
      await hashPassword(superAdminPassword);
    const { salt: systemSalt, hash: systemHashedPassword } = await hashPassword(
      systemPassword
    );

    const superAdminUser = await userRepository.createUser({
      _id: new mongoose.Types.ObjectId(predefinedUserId),
      username: superAdminUsername,
      email: superAdminEmail,
      hashedPassword: superAdminHashedPassword,
      salt: superAdminSalt,
      roleId: superAdminRole._id,
      cityId: city._id,
      countryId: country._id,
      phoneNumber: "",
      address: "",
      zip: "",
      devices: [],
    });

    if (!superAdminUser || !superAdminUser._id) {
      throw new Error("Failed to create Super Admin user");
    }

    const systemUser = await userRepository.createUser({
      username: systemUsername,
      email: systemEmail,
      hashedPassword: systemHashedPassword,
      salt: systemSalt,
      roleId: superAdminRole._id,
      cityId: city._id,
      countryId: country._id,
      phoneNumber: "",
      address: "",
      zip: "",
      devices: [],
    });

    if (!systemUser || !systemUser._id) {
      throw new Error("Failed to create System user");
    }

    res.status(201).json({
      message: "Setup completed successfully",
      superAdminUser,
      systemUser,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
