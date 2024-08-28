import { Model } from "mongoose";
import { Role, getRoleModel } from "../models/Role";

export class RoleRepository {
  private roleModel: Model<Role>;

  constructor() {
    this.roleModel = getRoleModel();
  }
  async getAllRoles(
    page: number,
    limit: number,
    query: string
  ): Promise<{ roles: Role[]; total: number }> {
    try {
      const rolesQuery = this.roleModel
        .find({ name: new RegExp(query, "i") })
        .skip((page - 1) * limit)
        .limit(limit);

      const totalQuery = this.roleModel.countDocuments({
        name: new RegExp(query, "i"),
      });

      const [roles, total] = await Promise.all([rolesQuery, totalQuery]);

      return { roles: roles.map((role) => role.toObject()), total };
    } catch (error: any) {
      throw new Error(`Error getting roles: ${error.message}`);
    }
  }

  async getRoleById(roleId: string): Promise<Role | null> {
    try {
      const role = await this.roleModel.findById(roleId);
      return role ? role.toObject() : null;
    } catch (error: any) {
      throw new Error(`Error getting role by ID: ${error.message}`);
    }
  }

  async getRoleByName(name: string): Promise<Role | null> {
    try {
      const role = await this.roleModel.findOne({ name });
      return role ? role.toObject() : null;
    } catch (error: any) {
      throw new Error(`Error getting role by name: ${error.message}`);
    }
  }

  async createRole(role: Role): Promise<Role | null> {
    try {
      const newRole = await this.roleModel.create(role);
      return this.getRoleById(newRole._id.toString());
    } catch (error: any) {
      throw new Error(`Error creating role: ${error.message}`);
    }
  }

  async updateRole(
    roleId: string,
    roleUpdate: Partial<Role>
  ): Promise<Role | null> {
    try {
      const updatedRole = await this.roleModel.findByIdAndUpdate(
        roleId,
        roleUpdate,
        { new: true }
      );
      return updatedRole ? updatedRole.toObject() : null;
    } catch (error: any) {
      throw new Error(`Error updating role: ${error.message}`);
    }
  }

  async deleteRole(roleId: string): Promise<boolean> {
    try {
      await this.roleModel.findByIdAndDelete(roleId);
      return true;
    } catch (error: any) {
      throw new Error(`Error deleting role: ${error.message}`);
    }
  }

  async getRolesWithPermission(permission: string): Promise<Role[]> {
    try {
      const roles = await this.roleModel.find({
        [`permissions.${permission}`]: true,
      });
      return roles.map((role) => role.toObject());
    } catch (error: any) {
      throw new Error(`Error getting roles with permission: ${error.message}`);
    }
  }
}
