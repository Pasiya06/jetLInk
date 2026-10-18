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
  getAllEmergencyBuses,
  getOtherEmergencyBuses,
} from "../controllers/busController.js";

const router = express.Router();

// Get all buses filtered by bus type
router.get("/buses", getBusesByBusType);

// Get ALL buses with emergency = true
router.get("/emergency", getAllEmergencyBuses);

router.post("/offline", logoutBus);

router.get("/check/:busNumber", checkBusNumber);
router.get("/check1/:driverNIC", checkDriver);
router.get("/check2/:conductorNIC", checkConductor);

router.patch("/:busNumber/emergency", reportEmergency);
router.patch("/:busNumber/emergency/resolve", resolveEmergency);
router.get("/:busNumber/emergency", getBusEmergency);
// Get all other emergency buses, excluding the current bus
router.get("/emergency/except/:busNumber", getOtherEmergencyBuses);

router
  .route("/")
  .get(getBuses)
  .post(createBus);

router
  .route("/:id")
  .put(updateBus)
  .delete(deleteBus);

export default router;