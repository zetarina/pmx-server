import express from "express";
import { hashPassword, comparePassword } from "../utils/crypto-utils";
import { UserRepository } from "../repositories/UserRepository";
import { RoleRepository } from "../repositories/RoleRepository";
import { CityRepository } from "../repositories/CityRepository";
import { CountryRepository } from "../repositories/CountryRepository";
import { PermissionsList } from "../types/permissions";
import { PermissionsObject } from "../models/Role";

const router = express.Router();
const userRepository = new UserRepository();
const roleRepository = new RoleRepository();
const cityRepository = new CityRepository();
const countryRepository = new CountryRepository();

router.get("/", async (req, res) => {
  try {
    let country = await countryRepository.getCountryByCode("MM");
    if (!country) {
      country = await countryRepository.createCountry({
        code: "MM",
        name: "Myanmar",
      });
    }
    if (!country) {
      throw new Error("Failed to create country");
    }

    let city = await cityRepository.getCityByName("Yangon");
    if (!city) {
      city = await cityRepository.createCity({
        name: "Yangon",
        countryId: country._id!,
      });
    }
    if (!city) {
      throw new Error("Failed to create city");
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
    if (!superAdminRole) {
      throw new Error("Failed to create Super Admin role");
    }

    const { salt, hash: systemHashedPassword } = await hashPassword(
      "SystemPassword"
    );

    let systemUser = await userRepository.getUserByEmail("system@example.com");
    if (!systemUser) {
      systemUser = await userRepository.createUser({
        username: "system",
        email: "system@example.com",
        hashedPassword: systemHashedPassword,
        salt: salt,
        roleId: superAdminRole._id!,
        cityId: city._id!,
        countryId: country._id!,
        phoneNumber: "",
        address: "",
        zip: "",
      });
    }

    res.status(201).json({
      message: "Setup completed successfully",
      superAdmin: { username: "superadmin", password: "SuperAdminPassword" },
      systemUser: { username: "system", password: "SystemPassword" },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
