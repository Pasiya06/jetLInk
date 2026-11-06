import express from "express";

import {
  addSchedule,
  getSchedules,
  getSchedulesByBus,
  deleteSchedule,
  updateSchedule,
  getScheduleByScheduleId,
} from "../controllers/scheduleController.js";

import { requireRole, requireSelfOrStaff } from "../utils/auth.js";

const router = express.Router();

router.post("/", requireRole("admin"), addSchedule);

router.get("/", getSchedules);

router.get("/bus/:busId", getSchedulesByBus);

router.delete("/:id", requireRole("admin"), deleteSchedule);

router.put("/:id", requireRole("admin"), updateSchedule);

router.get("/:scheduleId", getScheduleByScheduleId); 

export default router;