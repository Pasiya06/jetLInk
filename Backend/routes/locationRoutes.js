import express from "express";

import {
  updateLocation,
  getBusLocation,
  getAllLocations,
} from "../controllers/locationController.js";

const router = express.Router();

router.post("/update", updateLocation);

router.get("/", getAllLocations);

router.get(
 "/location/:busNumber",
 getBusLocation
);
export default router;