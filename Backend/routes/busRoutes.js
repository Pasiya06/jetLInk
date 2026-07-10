import express from "express";
import {
  getBuses,
  createBus,
  deleteBus,
  updateBus,
  checkBusNumber,
  logoutBus,
} from "../controllers/busController.js";

const router = express.Router();

router.post("/offline", logoutBus);

// Check bus number
router.get("/check/:busNumber", checkBusNumber);

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