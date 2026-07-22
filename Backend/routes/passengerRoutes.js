import express from "express";
import {
  registerPassenger,
  loginPassenger,
  getPassengers,
  deletePassenger
} from "../controllers/passengerController.js";

const router = express.Router();

router.post("/register", registerPassenger);
router.post("/login", loginPassenger);
router.get("/", getPassengers);
router.delete("/:id",deletePassenger)

export default router;