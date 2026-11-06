import mongoose from "mongoose";
import { passwordPlugin } from "../utils/password.js";
import { nextNumber, maxOf } from "../utils/nextId.js";

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

// Auto Increment passengerId (atomic counter: two sign-ups at once can't get the same number)
passengerSchema.pre("save", async function () {
  if (!this.isNew || this.passengerId) return;
  this.passengerId = await nextNumber("passenger", maxOf(mongoose.model("Passenger"), "passengerId"));
});

// Hash passwords, never return them in responses
passengerSchema.plugin(passwordPlugin);

const Passenger = mongoose.model("Passenger", passengerSchema);

export default Passenger;