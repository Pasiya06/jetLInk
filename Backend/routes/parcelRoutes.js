import express from "express";
import {
    createParcel,
    getParcels,
} from "../controllers/parcelController.js";

const router = express.Router();

router.post("/", createParcel);
router.get("/", getParcels);

export default router;