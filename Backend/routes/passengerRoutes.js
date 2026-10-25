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

const router = express.Router();

router.post("/register", registerPassenger);
router.post("/login", loginPassenger);
router.get("/", getPassengers);
router.get("/others/:id", getOtherPassengers); // everyone except the logged-in passenger
router.delete("/:id",deletePassenger)
router.get("/NIC/:NIC", getPassengerByNIC);
router.get("/get/:email", Getname);
router.put("/password/:email", updatePassengerPassword);
router.put("/:id", updatePassenger);

export default router;
