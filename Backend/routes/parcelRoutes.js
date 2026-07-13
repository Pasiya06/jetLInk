import express from "express";
import {
    createParcel,
    getParcels,
    generateParcelQR,
    verifyParcelQR,
} from "../controllers/parcelController.js";

const router = express.Router();

router.post("/", createParcel);
router.get("/", getParcels);
router.get("/parcel/:parcelId/qr", generateParcelQR);

router.post("/parcel/verify", verifyParcelQR);

export default router;