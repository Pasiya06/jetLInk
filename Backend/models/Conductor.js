import mongoose from "mongoose";
import { passwordPlugin } from "../utils/password.js";

const conductorSchema = new mongoose.Schema({

    conductorId: {
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

    Birthday: String,

    email: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
    }

    

});




// Hash passwords, never return them in responses
conductorSchema.plugin(passwordPlugin);

export default mongoose.model("Conductor", conductorSchema);