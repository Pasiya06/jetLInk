import express from "express";
import {
  registerPassenger,
  loginPassenger,
  getPassengers,
} from "../controllers/passengerController.js";

const router = express.Router();

router.post("/register", registerPassenger);
router.post("/login", loginPassenger);
router.get("/", getPassengers);

export default router;