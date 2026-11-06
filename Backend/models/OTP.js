import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },

    otp: {
        type: String,
        required: true,
    },

    expiresAt: {
        type: Date,
        required: true,
    },

    // Wrong guesses so far; the code is cancelled after 5
    attempts: {
        type: Number,
        default: 0,
    },

    sentAt: {
        type: Date,
        default: Date.now,
    },
});

// Fast OTP lookup by email
otpSchema.index({ email: 1 });

export default mongoose.model("OTP", otpSchema);