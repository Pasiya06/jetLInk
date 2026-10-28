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

// Copy of the package as it was when the tour was booked
// (so the booking stays correct even if the admin edits or deletes the package later)
const bookedPlaceSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    description: { type: String, default: "" },
    icon: { type: String, default: "location-outline" },
    iconType: { type: String, default: "ion" },
    color: { type: String, default: "#12966F" },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const packageSnapshotSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    destination: { type: String, default: "" },
    packageType: { type: String, default: "" },
    description: { type: String, default: "" },
    busType: { type: String, default: "" },
    totalDistance: { type: String, default: "" },
    tripDuration: { type: String, default: "" },
    maxPassengers: { type: Number, default: 0 },
    maxPrice: { type: Number, default: 0 },
    extraKmPrice: { type: Number, default: 0 },
    pickupMinKm: { type: Number, default: 0 },
    pickupMaxKm: { type: Number, default: 0 },
    places: { type: [bookedPlaceSchema], default: [] },
  },
  { _id: false }
);

// Bus details at booking time
const busSnapshotSchema = new mongoose.Schema(
  {
    busName: { type: String, default: "" },
    noOfSeats: { type: String, default: "" },
    colour: { type: String, default: "" },
    busType: { type: String, default: "" },
  },
  { _id: false }
);

// The tour payment
const tourPaymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, default: 0 },
    method: { type: String, default: "card" },
    nameOnCard: { type: String, default: "" },
    cardLast4: { type: String, default: "" },
    status: { type: String, enum: ["paid", "pending"], default: "paid" },
    paidAt: { type: Date, default: Date.now },
  },
  { _id: false }
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

    // Pickup point the passenger picked on the map (optional)
    pickupLat: {
      type: Number,
      default: null,
    },

    pickupLng: {
      type: Number,
      default: null,
    },

    pickupAddress: {
      type: String,
      default: "",
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

    // Passenger details from their profile at booking time
    pNIC: { type: String, default: "" },
    paddress: { type: String, default: "" },

    // Last day of the trip ("MM/DD/YYYY")
    tripEndDate: { type: String, default: "" },

    // Full package, bus and payment details saved with the booking
    packageDetails: { type: packageSnapshotSchema, default: () => ({}) },
    busDetails: { type: busSnapshotSchema, default: () => ({}) },
    payment: { type: tourPaymentSchema, default: () => ({}) },

    // Tour QR: set when bus staff scan the passenger's QR code
    scanned: {
      type: Boolean,
      default: false,
    },

    scannedAt: {
      type: Date,
      default: null,
    },

    scannedBy: {
      type: String,
      default: "",
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