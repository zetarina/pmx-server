import express from "express";
import { authorize } from "../middlewares/auth";
import { PermissionsList } from "../types/permissions";
import { UserRepository } from "../repositories/UserRepository";
import { RoleRepository } from "../repositories/RoleRepository";
import { CityRepository } from "../repositories/CityRepository";
import { CountryRepository } from "../repositories/CountryRepository";
import { PermissionsObject } from "../models/Role";
import { UserEvent } from "../models/Events";
import { io } from "../app";
import { handleError } from "../error";
import { hashPassword, comparePassword } from "../utils/crypto-utils";

const router = express.Router();
const userRepository = new UserRepository();
const roleRepository = new RoleRepository();
const cityRepository = new CityRepository();
const countryRepository = new CountryRepository();

router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, query = "" } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    const { users, total } = await userRepository.getAllUsers(
      pageNumber,
      limitNumber,
      query as string
    );
    res.status(200).json({ users, total });
  } catch (error: any) {
    handleError(res, error);
  }
});

router.post("/", authorize(PermissionsList.CreateUser), async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      roleId,
      cityId,
      countryId,
      ...basicContactInfo
    } = req.body;
    const existingUser = await userRepository.getUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const { salt, hash: hashedPassword } = await hashPassword(password);

    const userRole = await roleRepository.getRoleById(roleId);
    if (!userRole || !userRole._id) {
      return res.status(400).json({ error: "Role not found" });
    }

    const city = await cityRepository.getCityById(cityId);
    if (!city || !city._id) {
      return res.status(400).json({ error: "City not found" });
    }

    const country = await countryRepository.getCountryById(countryId);
    if (!country || !country._id) {
      return res.status(400).json({ error: "Country not found" });
    }

    const newUser = await userRepository.createUser({
      username,
      email,
      hashedPassword,
      salt,
      roleId: userRole._id,
      cityId: city._id,
      countryId: country._id,
      ...basicContactInfo,
    });

    if (newUser && newUser._id) {
      res
        .status(201)
        .json({ message: "User created successfully", user: newUser });
      io.emit(UserEvent.Created, newUser);
    } else {
      res.status(500).json({ error: "Error creating user" });
    }
  } catch (error: any) {
    handleError(res, error);
  }
});

router.get(
  "/shippers",
  authorize(PermissionsList.ReadUser),
  async (req, res) => {
    try {
      const { page = 1, limit = 10, query = "" } = req.query;
      const { users, total } = await userRepository.getShippers(
        Number(page),
        Number(limit),
        query.toString()
      );
      res.status(200).json({ users, total });
    } catch (error: any) {
      handleError(res, error);
    }
  }
);

router.put(
  "/:userId",
  authorize(PermissionsList.UpdateUser),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const userUpdate = req.body;

      if (userUpdate.password) {
        const { salt, hash: hashedPassword } = await hashPassword(
          userUpdate.password
        );
        userUpdate.hashedPassword = hashedPassword;
        userUpdate.salt = salt;
        delete userUpdate.password;
      }

      const updatedUser = await userRepository.updateUser(userId, userUpdate);
      res.status(200).json(updatedUser);
      io.emit(UserEvent.Updated, updatedUser);
    } catch (error: any) {
      handleError(res, error);
    }
  }
);

router.put(
  "/:userId/password",
  authorize(PermissionsList.UpdateUser),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { newPassword } = req.body;

      const { salt, hash: hashedPassword } = await hashPassword(newPassword);

      const updatedUser = await userRepository.updateUserPassword(
        userId,
        hashedPassword,
        salt
      );
      res.status(200).json({ message: "Password updated successfully" });
      io.emit(UserEvent.Updated, updatedUser);
    } catch (error: any) {
      handleError(res, error);
    }
  }
);

router.delete(
  "/:userId",
  authorize(PermissionsList.DeleteUser),
  async (req, res) => {
    try {
      const { userId } = req.params;
      await userRepository.deleteUser(userId);
      res.status(200).json({ message: "User deleted successfully" });
      io.emit(UserEvent.Deleted, userId);
    } catch (error: any) {
      handleError(res, error);
    }
  }
);

router.get(
  "/:userId",
  authorize(PermissionsList.ReadUser),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await userRepository.getUserById(userId);
      res.status(200).json(user);
    } catch (error: any) {
      handleError(res, error);
    }
  }
);

export default router;
