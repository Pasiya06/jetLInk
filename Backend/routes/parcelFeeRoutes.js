import express from "express";
import {
  getParcelFee,
  updateParcelFee,
} from "../controllers/parcelFeeController.js";

import { requireRole, requireSelfOrStaff } from "../utils/auth.js";

const router = express.Router();

// Get parcel fee
router.get("/", getParcelFee);

// Update parcel fee
router.put("/", requireRole("admin"), updateParcelFee);

export default router;