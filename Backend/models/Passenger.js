import mongoose from "mongoose";
import Counter from "./Counter.js";
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


    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
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

export const deletePassenger = async (req, res) => {
  try {
    const passenger = await Passenger.findById(req.params.id);

    if (!passenger) {
      return res.status(404).json({
        success: false,
        message: "Passenger not found",
      });
    }

    const deletedPassengerId = passenger.passengerId;

    await Passenger.findByIdAndDelete(req.params.id);

    // Shift remaining IDs down by 1
    await Passenger.updateMany(
      { passengerId: { $gt: deletedPassengerId } },
      { $inc: { passengerId: -1 } }
    );

    res.json({
      success: true,
      message: "Passenger deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const Passenger = mongoose.model("Passenger", passengerSchema);



export default Passenger;