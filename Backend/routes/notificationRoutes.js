import express from "express";
import {
  getNotifications,
  createNotification,
  deleteNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", getNotifications);
router.post("/", createNotification);
router.delete("/:id", deleteNotification);

export default router;
