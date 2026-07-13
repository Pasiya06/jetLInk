import dotenv from "dotenv";

dotenv.config();
import express from "express";
import mongoose from "mongoose";

import cors from "cors";

import adminRoutes from "./routes/adminRoutes.js";
import busRoutes from "./routes/busRoutes.js";
import passengerRoutes from "./routes/passengerRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";
import conductorRoutes from "./routes/conductorRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import parcelRoutes from "./routes/parcelRoutes.js";
import parcelFeeRoutes from "./routes/parcelFeeRoutes.js";
import ticketRoute from "./routes/ticketRoute.js";
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongooseOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 5 * 60 * 1000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 30000,
  serverSelectionTimeoutMS: 5000,
  retryWrites: true,
};

mongoose
  .connect(process.env.MONGO_URI, mongooseOptions)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error");
    console.error(err.message);
    process.exit(1);
  });

// MongoDB Events
mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB Disconnected");
});

mongoose.connection.on("error", (err) => {
  console.log("❌ MongoDB Error:", err.message);
});

// Test Route
app.get("/", (req, res) => {
  res.send("Passenger API is Running...");
});

// API Routes
app.use("/api/tickets", ticketRoute);
app.use("/api/passengers", passengerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/buses", busRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/conductors", conductorRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/parcel", parcelRoutes);
app.use("/api/parcelfee", parcelFeeRoutes);


// Invalid Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server Running on Port ${PORT}`);
});


