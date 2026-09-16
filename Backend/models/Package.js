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