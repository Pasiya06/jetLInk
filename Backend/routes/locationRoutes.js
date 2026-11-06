// backend/routes/locationRoutes.js
import express from "express";
import {
  updateLocation,
  updateLocation1,
  getBusLocation,
  getAllLocations,
  setOffline,
  clearLocation,
} from "../controllers/locationController.js";

import { requireRole, requireSelfOrStaff } from "../utils/auth.js";

const router = express.Router();

// POST /api/locations/update  → driver sends GPS
router.post("/update", requireRole("staff"), updateLocation);

router.post("/update1", requireRole("staff"), updateLocation1);

// GET  /api/locations         → get all bus locations
router.get("/", getAllLocations);

// GET  /api/locations/:busNama → get one bus location
router.get("/:busNumber", getBusLocation);

// POST /api/locations/offline → set bus offline
router.post("/offline", requireRole("staff"), setOffline);

// POST /api/locations/clear   → staff logout: clear location + set offline
router.post("/clear", requireRole("staff"), clearLocation);

export default router;