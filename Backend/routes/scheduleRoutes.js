import express from "express";

import {
  addSchedule,
  getSchedules,
  getSchedulesByBus,
  deleteSchedule,
  updateSchedule,
  getScheduleByScheduleId,
} from "../controllers/scheduleController.js";

const router = express.Router();

router.post("/", addSchedule);

router.get("/", getSchedules);

router.get("/bus/:busId", getSchedulesByBus);

router.delete("/:id", deleteSchedule);

router.put("/:id", updateSchedule);

router.get("/:scheduleId", getScheduleByScheduleId); 

export default router;