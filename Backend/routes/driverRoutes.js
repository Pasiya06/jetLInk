import express from "express";

import { addDriver, getDrivers, getDriverById, deleteDriver, updateDriver, checkNIC } from "../controllers/driverController.js";

import { requireRole, requireSelfOrStaff } from "../utils/auth.js";

const router = express.Router();

// Authentication routes
router.get("/check/:nic", checkNIC);



// CRUD routes
router.post("/", requireRole("admin"), addDriver);

router.get("/", requireRole("admin"), getDrivers);

router.get("/:id", requireRole("staff"), getDriverById);

router.put("/:id", requireRole("admin"), updateDriver);

router.delete("/:id", requireRole("admin"), deleteDriver);

export default router;