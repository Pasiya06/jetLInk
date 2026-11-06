import express from "express";
import {
  loginAdmin,
  getAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
} from "../controllers/adminController.js";

import { requireRole, requireSelfOrStaff } from "../utils/auth.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/", requireRole("admin"), getAdmins);
router.post("/", requireRole("admin"), createAdmin);
router.get("/:id", requireRole("admin"), getAdminById);
router.put("/:id", requireRole("admin"), updateAdmin);

export default router;
