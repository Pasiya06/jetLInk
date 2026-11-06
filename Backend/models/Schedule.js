import mongoose from "mongoose";
import { nextNumber, maxOf } from "../utils/nextId.js";
const scheduleSchema = new mongoose.Schema(
  {
    scheduleId: {
      type: Number,
      unique: true,
    },

    busdate: {
      type: String,
      required: true,
    },

    pickuploca: {
      type: String,
      required: true,
    },

    dropoffloca: {
      type: String,
      required: true,
    },

    depaturetime: {
      type: String,
      required: true,
    },

    arrivaltime: {
      type: String,
      required: true,
    },

    stops: {
      type: String,
      required: true,
    },


    busNo: {
      type: String,
      required: true,
    },

    busType: {
      type: String,
      required: true,
    },

    ticketPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0.00,
    },

  },
  {
    timestamps: true,
  }
);
scheduleSchema.pre("save", async function () {
  if (!this.isNew) return;

  if (this.scheduleId) return;
  // Atomic counter: IDs are never reused, even after a schedule is deleted
  this.scheduleId = await nextNumber("schedule", maxOf(mongoose.model("Schedule"), "scheduleId"));
});

// ── Indexes: make the app's common searches fast (built automatically on server start) ──
scheduleSchema.index({ busType: 1, busdate: 1 });
scheduleSchema.index({ busNo: 1 });

export default mongoose.model("Schedule", scheduleSchema);