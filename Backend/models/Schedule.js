import mongoose from "mongoose";
import Counter from "./Counter.js";
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

  const Schedule = mongoose.model("Schedule");

  const count = await Schedule.countDocuments();

  this.scheduleId = count + 1;
});

export default mongoose.model("Schedule", scheduleSchema);