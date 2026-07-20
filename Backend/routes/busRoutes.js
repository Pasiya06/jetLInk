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
} from "../controllers/busController.js";

const router = express.Router();

router.get("/buses", getBusesByBusType);

router.post("/offline", logoutBus);

// Check bus number
router.get("/check/:busNumber", checkBusNumber);

router.get("/check1/:driverNIC", checkDriver);

router.get("/check2/:conductorNIC", checkConductor);

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