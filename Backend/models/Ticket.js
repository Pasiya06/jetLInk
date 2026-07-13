import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  busId: {
    type: String,
    required: true,
  },
  passengerName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  fromStop: String,
  toStop: String,
  used: {
    type: Boolean,
    default: false,
  },
  usedAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;