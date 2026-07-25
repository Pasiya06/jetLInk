import jwt from "jsonwebtoken";
import Ticket from "../models/Ticket.js";

export const createTicket = async (req, res) => {
  const { busId, passengerName, price, fromStop, toStop } = req.body;

  if (!busId || !passengerName || price === undefined) {
    return res.status(400).json({
      error: "busId, passengerName and price are required",
    });
  }

  try {
    const ticket = await Ticket.create({
      busId,
      passengerName,
      price,
      fromStop,
      toStop,
    });

    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: "Failed to create ticket" });
  }
};

export const generateTicketQRByBusId = async (req, res) => {
  const { busId } = req.params;
    console.log("Searching Bus ID:", busId);
  try {
    // Find ticket using busId
    const ticket = await Ticket.findOne({ busId });
    console.log("Searching Bus ID:", ticket);
    if (!ticket) {
      return res.status(404).json({
        error: "No ticket found for this bus",
      });
    }

    const payload = {
      ticketId: ticket._id,
      busId: ticket.busId,
      
      issuedAt: Date.now(),
    };

    const token = jwt.sign(
        
      payload,
      process.env.QR_SECRET,
      {
        expiresIn: "12h",
      }
    );
    console.log("Searching Bus ID:", token);

    res.json({
      qrToken: token,
      ticket: {
        id: ticket._id,
        passengerName: ticket.passengerName,
        price: ticket.price,
        fromStop: ticket.fromStop,
        toStop: ticket.toStop,
      },
    });

  } catch (err) {
    res.status(500).json({
      error: "Failed to generate QR",
    });
  }
};

export const verifyTicket = async (req, res) => {
  const { qrToken } = req.body;

  try {
    const decoded = jwt.verify(qrToken, process.env.QR_SECRET);

    const ticket = await Ticket.findById(decoded.ticketId);

    if (!ticket) {
      return res.json({
        valid: false,
        reason: "Ticket not found",
      });
    }

    if (ticket.used) {
      return res.json({
        valid: false,
        reason: "Ticket already used",
      });
    }

    ticket.used = true;
    ticket.usedAt = new Date();
    await ticket.save();

    res.json({
      valid: true,
      passengerName: ticket.passengerName,
    });
  } catch (err) {
    res.json({
      valid: false,
      reason: "Invalid or expired QR",
    });
  }
};