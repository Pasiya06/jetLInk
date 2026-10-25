import mongoose from "mongoose";

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    icon: {
      type: String,
      default: "location-outline",
    },

    iconType: {
      type: String,
      default: "ion",
    },

    color: {
      type: String,
      default: "#12966F",
    },

    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const packageSchema = new mongoose.Schema(
  {
    // Shown as the card title, e.g. "Jaffna Silver Tour"
    title: {
      type: String,
      default: "",
      trim: true,
    },

    // Destination town, e.g. "Jaffna"
    destination: {
      type: String,
      default: "",
      trim: true,
    },

    // This package is for pickup towns this far from the destination (km).
    // Both 0 = any pickup town.
    pickupMinKm: {
      type: Number,
      default: 0,
    },

    pickupMaxKm: {
      type: Number,
      default: 0,
    },

    // Price the passenger pays for each extra kilometer (LKR). 0 = not allowed
    extraKmPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    busType: {
      type: String,
      default: "Standard bus",
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    packageType: {
      type: String,
      default: "GOLDEN PACKAGE",
    },

    totalDistance: {
      type: String,
      default: "",
    },

    tripDuration: {
      type: String,
      default: "",
    },

    maxPassengers: {
      type: Number,
      default: 0,
    },

    maxPrice: {
      type: Number,
      default: 0,
    },

    places: [placeSchema],
  },
  {
    timestamps: true,
  }
);

const Package = mongoose.model(
  "Package",
  packageSchema
);

export default Package;