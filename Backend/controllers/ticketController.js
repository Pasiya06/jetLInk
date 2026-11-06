import jwt from "jsonwebtoken";
import cron from "node-cron";
import Ticket from "../models/Ticket.js";
import { notify, notifyPassengers } from "./notificationController.js";
import { getBusBlockReason } from "../utils/busAvailability.js";

// seatNumbers is saved as '["1","2"]', but older tickets may be "1,2" or a single seat
export const parseSeats = (value) => {
  if (Array.isArray(value)) return value.map(String);
  const text = String(value ?? "").trim();
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    return (Array.isArray(parsed) ? parsed : [parsed]).map(String);
  } catch {
    return text.split(",").map((s) => s.trim()).filter(Boolean);
  }
};

export const createTicket = async (req, res) => {
  try {
    let {
      pickup,
      drop,
      date,
      time,
      pemail,
      pfirstName,
      plastName,
      bNumber,
      busType,
      seatNumbers,
      noOfTicket,
      totalFare,
    } = req.body;

    // Bus had an accident / broke down -> no new bookings
    const blockReason = await getBusBlockReason(bNumber);
    if (blockReason) {
      return res.status(409).json({ success: false, message: blockReason });
    }


    // Someone else may have booked the same seat since the seat map was opened
    const wanted = parseSeats(seatNumbers);
    if (wanted.length) {
      const sameTrip = await Ticket.find({ bNumber, busType, date, time }).select("seatNumbers").lean();
      const taken = new Set(sameTrip.flatMap((t) => parseSeats(t.seatNumbers)));
      const clash = wanted.filter((s) => taken.has(s));
      if (clash.length) {
        return res.status(409).json({
          success: false,
          code: "SEAT_TAKEN",
          seats: clash,
          message: `Seat ${clash.join(", ")} was just booked by someone else. Please choose another seat.`,
        });
      }
    }

    const ticket = new Ticket({
      pickup,
      drop,
      date,
      time,
      pfirstName,
      plastName,
      pemail,
      bNumber,
      busType,
      seatNumbers,
      noOfTicket,
      totalFare,
    });

    await ticket.save();

    notify({
      title: `🎫 New booking on Bus ${bNumber || "-"}`,
      body: `${pfirstName || ""} ${plastName || ""} booked ${noOfTicket || 1} seat(s)${seatNumbers ? ` (${seatNumbers})` : ""}: ${pickup || "?"} → ${drop || "?"}, ${date || ""} ${time || ""}.`,
      type: "ticket",
      audience: ["admin", "staff"],
      busNumber: bNumber,
      data: { ticketId: ticket.ticketId },
    });

    notifyPassengers(pemail, {
      title: "🎫 Ticket confirmed",
      body: `Ticket ${ticket.ticketId}: ${pickup || "?"} → ${drop || "?"} on ${date || ""} at ${time || ""}. Bus ${bNumber || "-"}${seatNumbers ? `, seat(s) ${seatNumbers}` : ""}. Total LKR ${Number(totalFare || 0).toLocaleString()}.`,
      type: "ticket",
      busNumber: bNumber,
      data: { ticketId: ticket.ticketId },
    });

    res.status(201).json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Tickets
export const getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      tickets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Ticket by Ticket ID
export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      ticketId: req.params.ticketId,
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      success: true,
      ticket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getBookedSeats = async (req, res) => {
  try {
    const { bNumber, busType, date, time } = req.query;
    
    const tickets = await Ticket.find(
      {
        bNumber,
        busType,
        date,
        time
      },
      "seatNumbers"
    ).lean();

    let bookedSeats = [];

    tickets.forEach((ticket) => {
      bookedSeats.push(...parseSeats(ticket.seatNumbers));
    });

    res.status(200).json({
      success: true,
      bookedSeats,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTicketByEmail = async (req, res) => {
  try {
    const { pemail, busType, used } = req.params;
    const tickets = await Ticket.find(
      {
        pemail: pemail,
        busType: busType,
        used: used,
      }
    ).sort({ createdAt: -1 }).lean();

    // An empty list is a normal answer, not an error
    res.json({
      success: true,
      data: tickets,
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const generateTicketQRByticketId = async (req, res) => {
  const { ticketId } = req.params;
    
  try {
    
    const ticket = await Ticket.findOne({ ticketId });
    
    if (!ticket) {
      return res.status(404).json({
        error: "No ticket found for this bus",
      });
    }

    const payload = {
      tId: ticket._id,
      ticketId: ticket.ticketId,
      bNumber: ticket.bNumber,
      issuedAt: Date.now(),
    };

    const token = jwt.sign(
        
      payload,
      process.env.QR_SECRET,
      {
        expiresIn: "12h",
      }
    );

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

export const generateTicketQR = async (req, res) => {
  try {
    const {
      pemail,
    } = req.body;

    const payload = {      
      pemail,
      issuedAt: Date.now(),
    };

    const token = jwt.sign(
      payload,
      process.env.QR_SECRET,
      {
        expiresIn: "12h",
      }
    );

    res.json({
      success: true,
      qrToken: token,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      error: "Failed to generate QR",
    });
  }
};

export const verifyTicket = async (req, res) => {
  const { qrToken } = req.body;

  try {
    const decoded = jwt.verify(qrToken, process.env.QR_SECRET);

    const ticket = await Ticket.findOne({ ticketId: decoded.ticketId });

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

    notify({
      title: `🎫 Ticket ${ticket.ticketId} scanned`,
      body: `${ticket.pfirstName || ""} ${ticket.plastName || ""} boarded with ${ticket.noOfTicket || 1} seat(s)${ticket.seatNumbers ? ` (${ticket.seatNumbers})` : ""}: ${ticket.pickup} → ${ticket.drop}.`,
      type: "ticket",
      audience: ["staff"],
      busNumber: ticket.bNumber,
      data: { ticketId: ticket.ticketId },
    });

    notifyPassengers(ticket.pemail, {
      title: "✅ Ticket scanned – have a good trip",
      body: `Ticket ${ticket.ticketId} (${ticket.pickup} → ${ticket.drop}) was used on bus ${ticket.bNumber}.`,
      type: "ticket",
      busNumber: ticket.bNumber,
      data: { ticketId: ticket.ticketId },
    });

    res.json({
      valid: true,
      ticket: {
        ticketId: ticket.ticketId,
        pickup: ticket.pickup,
        drop: ticket.drop,
        noOfTicket: ticket.noOfTicket,
        totalFare: ticket.totalFare,
      },
    });
  } catch (err) {
    res.json({
      valid: false,
      reason: "Invalid or expired QR",
    });
  }
};