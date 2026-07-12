import mongoose from "mongoose";

const parcelFeeSchema = new mongoose.Schema(
  {
    busFare: {
      type: Number,
      required: true,
      min: 0,
      default: 0.00,
    },

    weighFare: {
      type: Number,
      required: true,
      min: 0,
      default: 0.00,
    },

    serviceTax: {
      type: Number,
      required: true,
      min: 0,
      default: 0.00,
    },
  },
  {
    timestamps: true,
  }
);

const ParcelFee = mongoose.model("ParcelFee", parcelFeeSchema);

export default ParcelFee;