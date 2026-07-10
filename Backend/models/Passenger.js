import mongoose from "mongoose";

const passengerSchema = new mongoose.Schema(
  {
    passengerId: {
      type: Number,
      unique: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },

    address: {
      type: String,
      required: true,
    },

    NIC: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto Increment passengerId
passengerSchema.pre("save", async function () {
  if (!this.isNew || this.passengerId) return;

  const lastPassenger = await mongoose
    .model("Passenger")
    .findOne()
    .sort({ passengerId: -1 });

  this.passengerId = lastPassenger
    ? lastPassenger.passengerId + 1
    : 1;
});

const Passenger = mongoose.model("Passenger", passengerSchema);

export default Passenger;