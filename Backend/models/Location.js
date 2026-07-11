// backend/models/Location.js
import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    busNama: {
      type: String,
      required: true,
      unique: true,
    },
    latitude: {
      type: Number,
      required: true,
      default: 0,
    },
    longitude: {
      type: Number,
      required: true,
      default: 0,
    },
    speed: {
      type: Number,
      default: 0,
    },
    heading: {
      type: Number,
      default: 0,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

const Location = mongoose.model("Location", locationSchema);
export default Location;