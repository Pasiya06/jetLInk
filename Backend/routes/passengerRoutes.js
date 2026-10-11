import express from "express";
import {
  registerPassenger,
  loginPassenger,
  getPassengers,
  deletePassenger,
  updatePassengerPassword,
  Getname,
} from "../controllers/passengerController.js";

const router = express.Router();

router.post("/register", registerPassenger);
router.post("/login", loginPassenger);
router.get("/", getPassengers);
router.delete("/:id",deletePassenger)
router.get("/get/:email", Getname);
router.put("/password/:email", updatePassengerPassword);

export default router;