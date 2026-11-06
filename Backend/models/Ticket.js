import mongoose from "mongoose";
import { nextNumber, maxOfPrefixed } from "../utils/nextId.js";

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true,
  },

  pickup: {
    type: String,
    required: true,
    trim: true,
  },

  drop: {
    type: String,
    required: true,
    trim: true,
  },

  date: {
    type: String,
    required: true,
  },

  time: {
    type: String,
    required: true,
  },

  pfirstName: {
    type: String,
    required: true,
  },

  plastName: {
    type: String,
    required: true,
  },

  pemail: {
    type: String,
    required: true,
  },

  bNumber: {
    type: String,
    required: true,
    trim: true,
  },

  seatNumbers:{
    type: String,
    required: true,
    trim: true,
  },

  busType: {
    type: String,
    required: true,
  },

  noOfTicket: {
    type: Number,
    required: true,
    min: 1,
  },

  totalFare: {
    type: Number,
    required: true,
    min: 0,
  },

  used: {
    type: Boolean,
    default: false,
  },

  usedAt: {
    type: Date,
    default: null,
  },

}, { timestamps: true });

ticketSchema.pre("save", async function () {
  if (!this.isNew) return;

  if (this.ticketId) return;
  // Atomic counter: two bookings at the same moment can't get the same ticket ID
  const nextId = await nextNumber("ticket", maxOfPrefixed(mongoose.model("Ticket"), "ticketId", "TKT"));
  this.ticketId = `TKT${String(nextId).padStart(6, "0")}`;
});

// ── Indexes: make the app's common searches fast (built automatically on server start) ──
ticketSchema.index({ pemail: 1, busType: 1, used: 1, createdAt: -1 }); // passenger "My tickets"
ticketSchema.index({ bNumber: 1, busType: 1, date: 1, time: 1 });       // booked seats on a trip
ticketSchema.index({ bNumber: 1, used: 1 });                            // passengers on a bus
ticketSchema.index({ used: 1 });                                        // daily expired-ticket job
ticketSchema.index({ createdAt: -1 });                                  // admin payment history / next ticket ID

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;