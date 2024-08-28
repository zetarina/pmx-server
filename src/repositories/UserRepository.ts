import mongoose, { Model } from "mongoose";
import { User, getUserModel } from "../models/User";
import { RoleRepository } from "./RoleRepository";
import { PermissionsList } from "../types/permissions";

export class UserRepository {
  private userModel: Model<User>;
  private roleRepository: RoleRepository;

  constructor() {
    this.userModel = getUserModel();
    this.roleRepository = new RoleRepository();
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userModel
      .findById(id)
      .select("-hashedPassword -salt")
      .populate("role")
      .populate("city")
      .populate("country")
      .exec();
  }
  async getUserByObjectId(id: mongoose.Types.ObjectId): Promise<User | null> {
    return this.userModel
      .findById(id)
      .select("-hashedPassword -salt")
      .populate("role")
      .populate("city")
      .populate("country")
      .exec();
  }

  async createUser(user: User): Promise<User | null> {
    const newUser = await this.userModel.create(user);

    return this.getUserById(newUser._id.toString());
  }

  async updateUser(id: string, update: Partial<User>): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(id, update, { new: true })
      .select("-hashedPassword -salt")
      .exec();
  }
  async updateProfile(id: string, update: Partial<User>): Promise<User | null> {
    const { username, phoneNumber, address, zip, cityId, countryId } = update;
    return this.userModel
      .findByIdAndUpdate(
        id,
        { username, phoneNumber, address, zip, cityId, countryId },
        { new: true }
      )
      .select("-hashedPassword -salt")
      .exec();
  }

  async updateUserPassword(
    id: string,
    hashedPassword: string,
    salt: string
  ): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(id, { hashedPassword, salt }, { new: true })
      .select("-hashedPassword -salt")
      .exec();
  }
  async deleteUser(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id).exec();
  }

  async getAllUsers(
    page: number,
    limit: number,
    query: string
  ): Promise<{ users: User[]; total: number }> {
    try {
      const searchQuery = {
        username: new RegExp(query, "i"),
      };

      const usersQuery = this.userModel
        .find(searchQuery)
        .skip((page - 1) * limit)
        .limit(limit)
        .select("-hashedPassword -salt")
        .populate("role")
        .populate("city")
        .populate("country")
        .exec();

      const totalQuery = this.userModel.countDocuments(searchQuery).exec();

      const [users, total] = await Promise.all([usersQuery, totalQuery]);

      return { users, total };
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Failed to fetch users");
    }
  }
  async getShippers(
    page: number,
    limit: number,
    query: string
  ): Promise<{ users: User[]; total: number }> {
    const roles = await this.roleRepository.getRolesWithPermission(
      PermissionsList.getShipperInventory
    );

    const roleIds = roles.map((role) => role._id);

    const usersQuery = this.userModel
      .find({
        username: new RegExp(query, "i"),
        roleId: { $in: roleIds },
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-hashedPassword -salt")
      .populate("role")
      .populate("city")
      .populate("country")
      .exec();

    const totalQuery = this.userModel
      .countDocuments({
        username: new RegExp(query, "i"),
        roleId: { $in: roleIds },
      })
      .exec();

    const [users, total] = await Promise.all([usersQuery, totalQuery]);

    return { users, total };
  }
  async findUserByResetToken(token: string): Promise<User | null> {
    return this.userModel
      .findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      })
      .exec();
  }
}
