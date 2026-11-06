import mongoose from "mongoose";
import { passwordPlugin } from "../utils/password.js";

const driverSchema = new mongoose.Schema({

    driverId: {
        type: Number,
        unique: true,
    },

    firstName: String,

    lastName: String,

    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },

    address: String,

    NIC: {
      type: String,
      required: true,
      unique: true,
    },

    drivingLicense: {
      type: String,
      required: true,
      unique: true,
    },

    Birthday: String,

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      
    },

});



// Hash passwords, never return them in responses
driverSchema.plugin(passwordPlugin);

export default mongoose.model("Driver", driverSchema);