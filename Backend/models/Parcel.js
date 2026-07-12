import mongoose from "mongoose";

const parcelSchema = new mongoose.Schema(
  {
    sendername: {
      type: String,
      required: true, 
    },

    Smobilenumber: {
      type: String,
      required: true,
      unique: true,
    },

    Semail: {
      type: String,
      required: true,
      unique: true, 
    },

    receivername: {
      type: String,
      required: true, 
    },

    Rmobilenumber: {
      type: String,
      required: true,
      unique: true,
    },

    Remail: {
      type: String,
      required: true,
      unique: true,
    },

    weight: {
      type: String,
      required: true,
    },

    pickup: {
      type: String,
      required: true,
      
    },

    drop: {
      type: String,
      required: true,
      
    },

    time: {
      type: String,
      required: true,
    },

    Bnumber: {
      type: String,
      required: true,
      
    },
    busFare: {},

    weighFare: {},

    serviceTax: {}
    
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Parcel", parcelSchema);