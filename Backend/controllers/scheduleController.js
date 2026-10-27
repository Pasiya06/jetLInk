import Schedule from "../models/Schedule.js";
import Counter from "../models/Counter.js";
import { getEmergencyBusMap, busKey } from "../utils/busAvailability.js";

// Add the bus accident / breakdown status to each schedule
const withBusStatus = (schedules, emergencyMap) =>
  schedules.map((sch) => {
    const obj = typeof sch.toObject === "function" ? sch.toObject() : sch;
    const problem = emergencyMap.get(busKey(obj.busNo));
    return {
      ...obj,
      busStatus: problem ? problem.status : "normal",
      busEmergency: !!problem,
      busEmergencyAt: problem ? problem.emergencyAt : null,
    };
  });

// Create a new schedule
export const addSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.create(req.body);

    res.status(201).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all schedules
export const getSchedules = async (req, res) => {
  try {
    const [schedules, emergencyMap] = await Promise.all([Schedule.find(), getEmergencyBusMap()]);

    res.json({
      success: true,
      data: withBusStatus(schedules, emergencyMap),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get schedules filtered by internal Bus ID (Bid)
export const getSchedulesByBus = async (req, res) => {
  try {
    const schedules = await Schedule.find({
      Bid: req.params.busId,
    });

    res.json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a single schedule by auto-incremented scheduleId number
export const getScheduleByScheduleId = async (req, res) => {
  try {
    const schedule = await Schedule.findOne({
      scheduleId: Number(req.params.scheduleId),
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    res.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update a schedule by MongoDB _id
export const updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    // FIXED: Formatted response to share the same wrapper configuration as other endpoints
    res.json({
      success: true,
      data: schedule,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Delete a schedule and re-index sequential auto-incrementing schedule IDs
export const deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    const deletedScheduleId = schedule.scheduleId;

    // Delete the schedule
    await Schedule.findByIdAndDelete(req.params.id);

    // Shift remaining schedule IDs down by 1
    await Schedule.updateMany(
      { scheduleId: { $gt: deletedScheduleId } },
      { $inc: { scheduleId: -1 } }
    );

    // Update auto-increment counter tracker setup
    const totalSchedules = await Schedule.countDocuments();

    await Counter.findByIdAndUpdate(
      "scheduleId",
      { seq: totalSchedules },
      { upsert: true }
    );

    res.json({
      success: true,
      message: "Schedule deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};