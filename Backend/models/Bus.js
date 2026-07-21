import mongoose from "mongoose";

const busSchema = new mongoose.Schema({
  busId: {
    type: Number,
    unique: true,
  },
  busNumber: {
    type: String,
    required: true,
    unique: true,
  },
  chassisNo: {
    type: String,
    required: true,
    unique: true,
  },
  engineNo: {
    type: String,
    required: true,
    unique: true,
  },
  
  colour: String,

  serviceDate: String,

  licenseDate: String,

  emissionDate: String,

  busType: {
    type: String,
    enum: ["NormalWay", "Highway", "tour"],
    required: true,
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

  driverNIC: {
    type: String,
  },

  conductorNIC: {
    type: String,
  },

  driverD: {
    type: String,
  },

  conductorD: {
    type: String,
  }

});

// Auto increment busId
busSchema.pre("save", async function () {
  if (!this.isNew || this.busId) return;

  const lastBus = await mongoose
    .model("Bus")
    .findOne()
    .sort({ busId: -1 });

  this.busId = lastBus ? lastBus.busId + 1 : 1;
});

const Bus = mongoose.model("Bus", busSchema);

export default Bus;