"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const RoleRepository_1 = require("../repositories/RoleRepository");
const auth_1 = require("../middlewares/auth");
const permissions_1 = require("../types/permissions");
const Events_1 = require("../models/Events");
const app_1 = require("../app");
const router = express_1.default.Router();
const roleRepository = new RoleRepository_1.RoleRepository();
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, query = "" } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const { roles, total } = yield roleRepository.getAllRoles(pageNumber, limitNumber, query);
        res.status(200).json({ roles, total });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
router.post("/", (0, auth_1.authorize)(permissions_1.PermissionsList.CreateRole), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const role = req.body;
        const newRole = yield roleRepository.createRole(role);
        res.status(201).json(newRole);
        app_1.io.emit(Events_1.RoleEvent.Created, newRole);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
router.put("/:roleId", (0, auth_1.authorize)(permissions_1.PermissionsList.UpdateRole), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roleId } = req.params;
        const roleUpdate = req.body;
        const updatedRole = yield roleRepository.updateRole(roleId, roleUpdate);
        res.status(200).json(updatedRole);
        app_1.io.emit(Events_1.RoleEvent.Updated, updatedRole);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
router.delete("/:roleId", (0, auth_1.authorize)(permissions_1.PermissionsList.DeleteRole), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roleId } = req.params;
        yield roleRepository.deleteRole(roleId);
        res.status(200).json({ message: "Role deleted successfully" });
        app_1.io.emit(Events_1.RoleEvent.Deleted, roleId);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
router.get("/:roleId", (0, auth_1.authorize)(permissions_1.PermissionsList.ReadRole), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roleId } = req.params;
        const role = yield roleRepository.getRoleById(roleId);
        res.status(200).json(role);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
exports.default = router;
