import express from "express";
import {
  createTicket,
  getTickets,
  getTicketById,
  generateTicketQRByticketId,
  generateTicketQR,
  getBookedSeats,
  verifyTicket,
  getTicketByEmail,
} from "../controllers/ticketController.js";

const router = express.Router();

router.post("/", createTicket);

router.get("/", getTickets);

router.post("/generate-qr", generateTicketQR);

router.get("/booked-seats", getBookedSeats);

router.get("/bus/:ticketId/qr", generateTicketQRByticketId);

router.post("/verify", verifyTicket);

router.get("/:ticketId", getTicketById);

router.get( "/email/:pemail/:busType/:used", getTicketByEmail);

export default router;