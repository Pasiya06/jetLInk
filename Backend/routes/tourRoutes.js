import express from "express";

import {
  createReceipt,
  getAllReceipts,
  getReceiptById,
  getReceiptsByEmail,
  getReceiptsByBusNumber,
  generateTourQR,
  getBookedBuses,
  checkBusAvailable,
  getExtraKm,
  payExtraKm,
  verifyTourQR,
} from "../controllers/tourController.js";

const router = express.Router();

// Create a new receipt
router.post("/", createReceipt);

// GET all receipts
router.get("/all", getAllReceipts);

// Buses already booked on any day of a trip (must be above "/:receiptId")
router.get("/booked-buses", getBookedBuses);

// Is one bus still free for a trip? (checked before payment)
router.get("/check-bus", checkBusAvailable);

// Bus staff scan a passenger's tour QR
router.post("/verify", verifyTourQR);

// Extra kilometers for a booked tour (passenger pays per km)
router.get("/:receiptId/extra-km", getExtraKm);
router.post("/:receiptId/extra-km", payExtraKm);

// Get receipt by receiptId
router.get("/:receiptId", getReceiptById);

// GET all receipts by passenger email 
router.get("/email/:pemail", getReceiptsByEmail);

// GET all receipts by passenger bus number 
router.get("/busNumber/:busNumber", getReceiptsByBusNumber);

// Generate QR code for a receipt
router.get("/receiptId/:receiptId/qr", generateTourQR);

export default router;