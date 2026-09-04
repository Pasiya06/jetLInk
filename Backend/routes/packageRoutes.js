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

const router = express.Router();


/* PACKAGE */

router.post("/", createPackage);

router.get("/", getPackages);

router.get("/:id", getPackageById);

router.put("/:id", updatePackage);

router.delete("/:id", deletePackage);


/* PLACES */

router.post("/:id/places", addPlace);

router.put(
  "/:packageId/places/:placeId",
  updatePlace
);

router.delete(
  "/:packageId/places/:placeId",
  deletePlace
);


export default router;