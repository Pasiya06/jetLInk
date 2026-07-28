import jwt from "jsonwebtoken";
import Ticket from "../models/Ticket.js";

export const createTicket = async (req, res) => {
  try {
    let {
      pickup,
      drop,
      date,
      time,
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
      bNumber,
      busType,
      seatNumbers,
      noOfTicket,
      totalFare,
    });

    await ticket.save();

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
    const { bNumber, busType } = req.query;
    console.log("Searching Bus ID:", bNumber,busType);
    const tickets = await Ticket.find(
      {
        bNumber,
        busType,
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

export const generateTicketQRByBusNumber = async (req, res) => {
  const { bNumber } = req.params;
    console.log("Searching Bus ID:", bNumber);
  try {
    // Find ticket using busId
    const ticket = await Ticket.findOne({ bNumber });
    console.log("Searching Bus ID:", ticket);
    if (!ticket) {
      return res.status(404).json({
        error: "No ticket found for this bus",
      });
    }

    const payload = {
      ticketId: ticket._id,
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
        bNumber: ticket.bNumber,
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