import express from "express";
import {
  getNotifications,
  createNotification,
  deleteNotification,
} from "../controllers/notificationController.js";

import { requireRole, requireSelfOrStaff } from "../utils/auth.js";

const router = express.Router();

router.get("/", requireRole(), getNotifications);
router.post("/", requireRole("staff"), createNotification);
router.delete("/:id", requireRole("admin"), deleteNotification);

export default router;
