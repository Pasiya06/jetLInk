import express from "express";
import { pay } from "../controllers/paymentController.js";

import { requireRole, requireSelfOrStaff } from "../utils/auth.js";

const router = express.Router();

router.post("/pay", requireRole(), pay);

export default router;