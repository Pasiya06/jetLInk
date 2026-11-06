import express from "express";

import {
  createPackage,
  getPackages,
  getPackageById,
  updatePackage,
  deletePackage,
  addPlace,
  updatePlace,
  deletePlace,
} from "../controllers/packageController.js";

import { requireRole, requireSelfOrStaff } from "../utils/auth.js";

const router = express.Router();


/* PACKAGE */

router.post("/", requireRole("admin"), createPackage);

router.get("/", getPackages);

router.get("/:id", getPackageById);

router.put("/:id", requireRole("admin"), updatePackage);

router.delete("/:id", requireRole("admin"), deletePackage);


/* PLACES */

router.post("/:id/places", requireRole("admin"), addPlace);

router.put(
  "/:packageId/places/:placeId",
  requireRole("admin"),
  updatePlace
);

router.delete(
  "/:packageId/places/:placeId",
  requireRole("admin"),
  deletePlace
);


export default router;