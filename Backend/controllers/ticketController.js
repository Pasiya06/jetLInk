import jwt from "jsonwebtoken";
import cron from "node-cron";
import Ticket from "../models/Ticket.js";
import { notify } from "./notificationController.js";

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

    await notify({
      title: `🎫 New booking on Bus ${bNumber || "-"}`,
      body: `${pfirstName || ""} ${plastName || ""} booked ${noOfTicket || 1} seat(s)${seatNumbers ? ` (${seatNumbers})` : ""}: ${pickup || "?"} → ${drop || "?"}, ${date || ""} ${time || ""}.`,
      type: "ticket",
      audience: ["admin", "staff"],
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
    const tickets = await Ticket.find().sort({ createdAt: -1 });

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
    );

    let bookedSeats = [];

    tickets.forEach((ticket) => {
      const seats = JSON.parse(ticket.seatNumbers);
      bookedSeats.push(...seats);
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
    console.log("Searching Bus ID:", pemail, busType, used);
    const tickets = await Ticket.find(
      {
        pemail: pemail,
        busType: busType,
        used: used,
      }
    );
    console.log("Searching Bus ID:", tickets);

    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

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