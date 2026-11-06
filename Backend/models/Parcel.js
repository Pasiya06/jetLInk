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

    pickupVerified: {
      type: Boolean,
      default: false,
    },

    pickupVerifiedAt: {
      type: Date,
    },

    delivered: {
      type: Boolean,
      default: false,
    },

    deliveredAt: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["Pending", "PickedUp", "Delivered"],
      default: "Pending",
    },
      
  },
  {
    timestamps: true,
  }
);

// ── Indexes: make the app's common searches fast (built automatically on server start) ──
parcelSchema.index({ Semail: 1, status: 1, createdAt: -1 });  // passenger parcels
parcelSchema.index({ Bnumber: 1, status: 1, createdAt: -1 }); // bus staff parcels
parcelSchema.index({ status: 1, createdAt: -1 });             // admin pending / delivered lists
parcelSchema.index({ delivered: 1, status: 1 });              // daily expired-parcel job
parcelSchema.index({ createdAt: -1 });                        // admin payment history / next parcel ID

export default mongoose.model("Parcel", parcelSchema);