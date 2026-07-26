import express from "express";

import { addDriver, getDrivers, getDriverById, deleteDriver, updateDriver, checkNIC } from "../controllers/driverController.js";

const router = express.Router();

// Authentication routes
router.get("/check/:nic", checkNIC);



// CRUD routes
router.post("/", addDriver);

router.get("/", getDrivers);

router.get("/:id", getDriverById);

router.put("/:id", updateDriver);

router.delete("/:id", deleteDriver);

export default router;