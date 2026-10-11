import express from "express";

import {
  createReceipt,
  getAllReceipts,
  getReceiptById,
  getReceiptsByEmail,
  getReceiptsByBusNumber,
  generateTourQR,
} from "../controllers/tourController.js";

const router = express.Router();

// Create a new receipt
router.post("/", createReceipt);

// GET all receipts
router.get("/all", getAllReceipts);

// Get receipt by receiptId
router.get("/:receiptId", getReceiptById);

// GET all receipts by passenger email 
router.get("/email/:pemail", getReceiptsByEmail);

// GET all receipts by passenger bus number 
router.get("/busNumber/:busNumber", getReceiptsByBusNumber);

// Generate QR code for a receipt
router.get("/receiptId/:receiptId/qr", generateTourQR);

export default router;