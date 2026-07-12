import express from "express";
import {
  getParcelFee,
  updateParcelFee,
} from "../controllers/parcelFeeController.js";

const router = express.Router();

// Get parcel fee
router.get("/", getParcelFee);

// Update parcel fee
router.put("/", updateParcelFee);

export default router;