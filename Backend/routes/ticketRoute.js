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

import { requireRole, requireSelfOrStaff } from "../utils/auth.js";

const router = express.Router();

router.post("/", requireRole("passenger"), createTicket);

router.get("/", requireRole("admin"), getTickets);

router.post("/generate-qr", requireRole(), generateTicketQR);

router.get("/booked-seats", getBookedSeats);

router.get("/bus/:ticketId/qr", requireRole(), generateTicketQRByticketId);

router.post("/verify", requireRole("staff"), verifyTicket);

router.get("/:ticketId", requireRole(), getTicketById);

router.get("/email/:pemail/:busType/:used", requireSelfOrStaff("pemail"), getTicketByEmail);

export default router;