import mongoose from "mongoose";
import { passwordPlugin } from "../utils/password.js";

const adminSchema = new mongoose.Schema(
  {
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

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    phoneNumber: {
      type: String,
      default: "",
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

// Hash passwords, never return them in responses
adminSchema.plugin(passwordPlugin);

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;