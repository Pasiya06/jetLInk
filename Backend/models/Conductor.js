import mongoose from "mongoose";

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




export default mongoose.model("Conductor", conductorSchema);