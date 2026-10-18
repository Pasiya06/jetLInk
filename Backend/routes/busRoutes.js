import express from "express";
import {
  getBuses,
  createBus,
  deleteBus,
  updateBus,
  checkBusNumber,
  checkDriver,
  checkConductor,
  logoutBus,
  getBusesByBusType,
  reportEmergency,
  resolveEmergency,
  getBusEmergency,
} from "../controllers/busController.js";

const router = express.Router();

router.get("/buses", getBusesByBusType);

router.post("/offline", logoutBus);

// Check bus number
router.get("/check/:busNumber", checkBusNumber);

router.get("/check1/:driverNIC", checkDriver);

router.get("/check2/:conductorNIC", checkConductor);

router.patch("/:busNumber/emergency", reportEmergency);

// Resolve the emergency
router.patch("/:busNumber/emergency/resolve", resolveEmergency);

// Get the emergency status
router.get("/:busNumber/emergency", getBusEmergency);

// Get all buses & create bus
router
  .route("/")
  .get(getBuses)
  .post(createBus);

// Update & delete bus
router
  .route("/:id")
  .put(updateBus)
  .delete(deleteBus);

export default router;