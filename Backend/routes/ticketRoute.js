import express from "express";
import {
  createTicket,
  getTickets,
  getTicketById,
  generateTicketQRByBusId,
  getBookedSeats,
  verifyTicket,
} from "../controllers/ticketController.js";

const router = express.Router();

router.post("/", createTicket);

router.get("/", getTickets);

router.get("/booked-seats", getBookedSeats);

router.get("/bus/:bNumber/qr", generateTicketQRByBusId);

router.post("/verify", verifyTicket);

router.get("/:ticketId", getTicketById);

export default router;