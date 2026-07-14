import mongoose from "mongoose";

const parcelSchema = new mongoose.Schema(
  {
    parcelId: {
      type: String,
      unique: true,
    },

    sendername: {
      type: String,
       
    },

    Smobilenumber: {
      type: String,
      required: true,
      
    },

    Semail: {
      type: String,
      required: true,
      
    },

    receivername: {
      type: String,
      required: true, 
    },

    Rmobilenumber: {
      type: String,
      required: true,
      
    },

    Remail: {
      type: String,
      required: true,
      
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

    date: {
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
    totalFare: {
      type: Number,
      required: true,
    },

    used: {
      type: Boolean,
      default: false,
    },

    usedAt: {
      type: Date,
      default: null,
    },
    
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Parcel", parcelSchema);