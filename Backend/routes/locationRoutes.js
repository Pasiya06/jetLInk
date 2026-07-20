// backend/routes/locationRoutes.js
import express from "express";
import {
  updateLocation,
  updateLocation1,
  getBusLocation,
  getAllLocations,
  setOffline,
} from "../controllers/locationController.js";

const router = express.Router();

// POST /api/locations/update  → driver sends GPS
router.post("/update", updateLocation);

router.post("/update1", updateLocation1);

// GET  /api/locations         → get all bus locations
router.get("/", getAllLocations);

// GET  /api/locations/:busNama → get one bus location
router.get("/:busNumber", getBusLocation);

// POST /api/locations/offline → set bus offline
router.post("/offline", setOffline);

export default router;