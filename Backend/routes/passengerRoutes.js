import express from "express";
import {
  registerPassenger,
  loginPassenger,
  getPassengers,
  deletePassenger,
  updatePassengerPassword,
  Getname,
  getPassengerByNIC,
  updatePassenger
} from "../controllers/passengerController.js";

const router = express.Router();

router.post("/register", registerPassenger);
router.post("/login", loginPassenger);
router.get("/", getPassengers);
router.delete("/:id",deletePassenger)
router.get("/NIC/:NIC", getPassengerByNIC);
router.get("/get/:email", Getname);
router.put("/password/:email", updatePassengerPassword);
router.put("/:id", updatePassenger);

export default router;
