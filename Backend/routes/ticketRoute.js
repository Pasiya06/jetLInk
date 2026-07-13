import express from "express";
import {
  createTicket,
  generateTicketQRByBusId,
  verifyTicket,
} from "../controllers/ticketController.js";

const router = express.Router();

router.post("/", createTicket);
router.get("/bus/:busId/qr", generateTicketQRByBusId);
router.post("/verify", verifyTicket);

export default router;