import express from "express";
import {
    createParcel,
    getParcelByEmailAndUsed,
    generateParcelQR,
    verifyParcelQR,
} from "../controllers/parcelController.js";

const router = express.Router();

router.post("/", createParcel);
router.get("/:Semail/:used", getParcelByEmailAndUsed);
router.get("/parcel/:parcelId/qr", generateParcelQR);

router.post("/parcel/verify", verifyParcelQR);

export default router;