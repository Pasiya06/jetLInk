import mongoose from "mongoose";

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

  try {
    const lastTicket = await mongoose
      .model("Ticket")
      .findOne()
      .sort({ createdAt: -1 });

    let nextId = 1;

    if (lastTicket?.ticketId) {
      nextId = parseInt(lastTicket.ticketId.replace("TKT", ""), 10) + 1;
    }

    this.ticketId = `TKT${String(nextId).padStart(6, "0")}`;
  } catch (err) {
    throw err;
  }
});

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;