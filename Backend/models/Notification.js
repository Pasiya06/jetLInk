import mongoose from "mongoose";

// One alert shown in the admin, bus staff and/or passenger Alerts screens.
const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, default: "", trim: true },

    // emergency | parcel | ticket | tour | general
    type: {
      type: String,
      enum: ["emergency", "parcel", "ticket", "tour", "general"],
      default: "general",
    },

    // Who should see it: "admin", "staff", "passenger" (any combination)
    audience: {
      type: [String],
      enum: ["admin", "staff", "passenger"],
      default: ["admin"],
    },

    // Passenger alerts: if set, only this passenger sees it; null = all passengers
    passengerEmail: { type: String, default: null, lowercase: true, trim: true },

    // If set, only the staff of this bus see it (admins always see everything)
    busNumber: { type: String, default: null, uppercase: true, trim: true },

    // Extra info for the app, e.g. { url: "/admin/emergency/EmergencyBuses" }
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ audience: 1, busNumber: 1, createdAt: -1 });
notificationSchema.index({ audience: 1, passengerEmail: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
