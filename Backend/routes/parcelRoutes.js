import express from "express";
import {
    createParcel,
    getParcelByEmailAndUsed,
    getParcelBybusNumberandStatus,
    generateParcelQR,
    verifyParcelQR,
    generateParQR,
    markParcelDelivered,
} from "../controllers/parcelController.js";

const router = express.Router();

router.post("/", createParcel);
router.get("/:Semail/:status", getParcelByEmailAndUsed);
router.get("/parcel/:Bnumber/:status", getParcelBybusNumberandStatus);
router.get("/parcel/:parcelId/qr", generateParcelQR);
router.post("/generateQR", generateParQR);
router.post("/parcel/verify", verifyParcelQR);
router.put("/deliver/:parcelId", markParcelDelivered);

export default router;