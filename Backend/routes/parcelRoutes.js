import express from "express";
import {
    createParcel,
    getParcelByEmailAndUsed,
    getParcelBybusNumberandStatus,
    getParcel,
    generateParcelQR,
    verifyParcelQR,
    generateParQR,
    markParcelDelivered,
    getAllParcels
} from "../controllers/parcelController.js";

import { requireRole, requireSelfOrStaff } from "../utils/auth.js";

const router = express.Router();
router.get("/parcel/:parcelId/qr", requireRole(), generateParcelQR);
router.post("/", requireRole("passenger", "staff"), createParcel);
router.get("/all", requireRole("admin"), getAllParcels);
router.get("/:status", requireRole("admin"), getParcel);
router.get("/:Semail/:status", requireSelfOrStaff("Semail"), getParcelByEmailAndUsed);
router.get("/parcel/:Bnumber/:status", requireRole("staff"), getParcelBybusNumberandStatus);
router.post("/generateQR", requireRole(), generateParQR);
router.post("/parcel/verify", requireRole("staff"), verifyParcelQR);
router.put("/deliver/:parcelId", requireRole("staff"), markParcelDelivered);

export default router;