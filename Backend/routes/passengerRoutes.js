import express from "express";
import {
  registerPassenger,
  loginPassenger,
  getPassengers,
  deletePassenger,
  updatePassengerPassword,
  Getname,
  getPassengerByNIC,
  updatePassenger,
  getOtherPassengers
} from "../controllers/passengerController.js";

import { requireRole, requireSelfOrStaff } from "../utils/auth.js";

const router = express.Router();

router.post("/register", registerPassenger);
router.post("/login", loginPassenger);
router.get("/", requireRole("admin"), getPassengers);
router.get("/others/:id", requireRole("passenger"), getOtherPassengers); // everyone except the logged-in passenger
router.delete("/:id", requireRole("admin"), deletePassenger);
router.get("/NIC/:NIC", requireRole(), getPassengerByNIC);
router.get("/get/:email", requireRole(), Getname);
router.put("/password/:email", updatePassengerPassword);
router.put("/:id", requireRole("passenger"), updatePassenger);

export default router;
