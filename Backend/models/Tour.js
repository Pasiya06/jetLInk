import mongoose from "mongoose";

// One extra-kilometer payment made by the passenger
const extraKmPaymentSchema = new mongoose.Schema(
  {
    km: { type: Number, required: true },
    pricePerKm: { type: Number, required: true },
    amount: { type: Number, required: true },
    cardLast4: { type: String, default: "" },
    paidAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const receiptSchema = new mongoose.Schema(
  {
    receiptId: {
      type: String,
      unique: true,
      required: true,
    },

    busNumber: {
      type: String,
      required: true,
    },

    driverNIC: {
      type: String,
      required: true,
    },

    conductorNIC: {
      type: String,
      required: true,
    },

    driverD: {
      type: String,
      required: true,
    },

    conductorD: {
      type: String,
      required: true,
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    date: {
      type: String,
      required: true,
    },

    pickup: {
      type: String,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    packageId: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    packageType: {
      type: String,
      required: true,
    },

    totalDistance: {
      type: Number,
      required: true,
    },

    tripDuration: {
      type: String,
      required: true,
    },

    maxPassengers: {
      type: Number,
      required: true,
    },

    maxPrice: {
      type: Number,
      required: true,
    },

    Pid: {
      type: String,
      required: true,
    },

    Pid1: {
      type: String,
    },

    pfirstName: {
      type: String,
      required: true,
    },

    plastName: {
      type: String,
      required: true,
    },

    pphoneNumber: {
      type: String,
      required: true,
    },

    pemail: {
      type: String,
      required: true,
      lowercase: true,
    },

    // Extra kilometers added and paid by the passenger
    extraKm: {
      type: Number,
      default: 0,
    },

    extraKmAmount: {
      type: Number,
      default: 0,
    },

    extraKmPayments: {
      type: [extraKmPaymentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Receipt", receiptSchema);