import express from "express";
import { RoleRepository } from "../repositories/RoleRepository";
import { authorize } from "../middlewares/auth";
import { PermissionsList } from "../types/permissions";
import { RoleEvent } from "../models/Events";
import { io } from "../app";

const router = express.Router();
const roleRepository = new RoleRepository();

router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, query = "" } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    const { roles, total } = await roleRepository.getAllRoles(
      pageNumber,
      limitNumber,
      query as string
    );
    res.status(200).json({ roles, total });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", authorize(PermissionsList.CreateRole), async (req, res) => {
  try {
    const role = req.body;
    const newRole = await roleRepository.createRole(role);
    res.status(201).json(newRole);
    io.emit(RoleEvent.Created, newRole);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put(
  "/:roleId",
  authorize(PermissionsList.UpdateRole),
  async (req, res) => {
    try {
      const { roleId } = req.params;
      const roleUpdate = req.body;
      const updatedRole = await roleRepository.updateRole(roleId, roleUpdate);
      res.status(200).json(updatedRole);
      io.emit(RoleEvent.Updated, updatedRole);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.delete(
  "/:roleId",
  authorize(PermissionsList.DeleteRole),
  async (req, res) => {
    try {
      const { roleId } = req.params;
      await roleRepository.deleteRole(roleId);
      res.status(200).json({ message: "Role deleted successfully" });
      io.emit(RoleEvent.Deleted, roleId);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.get(
  "/:roleId",
  authorize(PermissionsList.ReadRole),
  async (req, res) => {
    try {
      const { roleId } = req.params;
      const role = await roleRepository.getRoleById(roleId);
      res.status(200).json(role);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
