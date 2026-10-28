import Bus from "../models/Bus.js";
import { notify, notifyPassengers } from "./notificationController.js";
import Ticket from "../models/Ticket.js";
import { getActiveTourEmails } from "./tourController.js";

// Passengers who are booked on this bus: unused tickets + tours that haven't ended
const passengersOnBus = async (busNumber) => {
  try {
    const [tickets, tourEmails] = await Promise.all([
      Ticket.find({ bNumber: busNumber, used: false }).select("pemail"),
      getActiveTourEmails(busNumber),
    ]);
    return [...tickets.map((t) => t.pemail), ...tourEmails];
  } catch (error) {
    console.error("Could not find passengers for bus:", error.message);
    return [];
  }
};

const busDisplay = (bus) => (bus.busName ? `${bus.busName} (${bus.busNumber})` : `Bus ${bus.busNumber}`);

// @desc    Get all buses
export const getBuses = async (req, res) => {
  try {
    const buses = await Bus.find({}).sort({ busId: 1 });
    res.status(200).json(buses);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new bus
export const createBus = async (req, res) => {
  try {
    // Remove busId if client sends it
    delete req.body.busId;

    const bus = new Bus(req.body);

    await bus.save();

    res.status(201).json({
      success: true,
      data: bus,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete a bus and shift sequence
export const deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    const deletedBusId = bus.busId;

    // Delete the targeted bus record
    await Bus.findByIdAndDelete(req.params.id);

    // Shift remaining higher bus IDs down by 1 to prevent numbering gaps
    await Bus.updateMany(
      { busId: { $gt: deletedBusId } },
      { $inc: { busId: -1 } }
    );

    res.json({
      success: true,
      message: "Bus deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    res.status(200).json({
      success: true,
      data: bus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const checkBusNumber = async (req, res) => {
  try {
    const bus = await Bus.findOne({
      busNumber: req.params.busNumber,
    });

    if (!bus) {
      return res.status(404).json({
        success: false,
        exists: false,
        message: "bus not found",
      });
    }

    res.status(200).json({
      
      success: true,
      exists: true,
      data: {
        _id: bus._id,
        busId: bus.busId,
        busNumber: bus.busNumber,
        busName: bus.busName || "",
        noOfSeats: bus.noOfSeats || "",
        
      },
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const logoutBus = async (req, res) => {
  try {
    await Location.deleteOne({
      busNumber: req.body.busNumber,
    });

    res.json({
      success: true,
      message: "Bus is offline",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getBusesByBusType = async (req, res) => {
  try {
    const { busType } = req.query; // Get busType from query params
    console.log(busType);
    let filter = {};

    if (busType) {
      filter.busType = busType;
    }

    const buses = await Bus.find(filter).sort({ busId: 1 });

    res.status(200).json({
      success: true,
      data: buses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const checkDriver = async (req, res) => {
  try {
    const bus = await Bus.findOne({
      driverNIC: req.params.driverNIC,
    });

    if (!bus) {
      return res.status(404).json({
        success: false,
        exists: false,
        message: "Driver not found",
      });
    }

    res.status(200).json({
      
      success: true,
      exists: true,
      data: {
        _id: bus._id,
        busId: bus.busId,
        driverNIC: bus.driverNIC,
        
      },
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const checkConductor = async (req, res) => {
  try {
    const bus = await Bus.findOne({
      conductorNIC: req.params.conductorNIC,
    });

    if (!bus) {
      return res.status(404).json({
        success: false,
        exists: false,
        message: "Conductor not found",
      });
    }

    res.status(200).json({
      
      success: true,
      exists: true,
      data: {
        _id: bus._id,
        busId: bus.busId,
        conductorNIC: bus.conductorNIC,
        
      },
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Report an emergency
export const reportEmergency = async (req, res) => {
  try {
    const { busNumber } = req.params;
    const { status } = req.body;

    if (!["accident", "breakdown"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be accident or breakdown",
      });
    }

    const reportedAt = new Date();
    const bus = await Bus.findOneAndUpdate(
      { busNumber: busNumber.trim().toUpperCase() },
      {
        $set: {
          emergency: true,
          status,
          emergencyAt: reportedAt,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    await notify({
      title: `🚨 Emergency: Bus ${bus.busNumber}`,
      body: `Bus ${bus.busNumber} reported a ${status} at ${reportedAt.toLocaleString("en-GB", {
        timeZone: "Asia/Colombo",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}. Check the emergency page for its location.`,
      type: "emergency",
      audience: ["admin", "staff"],
      data: {
        busNumber: bus.busNumber,
        status,
        emergencyAt: reportedAt.toISOString(),
        url: "/admin/emergency/EmergencyBuses",
      },
    });

    await notifyPassengers(await passengersOnBus(bus.busNumber), {
      title: `⚠️ ${busDisplay(bus)} is delayed`,
      body: `Your bus reported a ${status === "accident" ? "accident" : "breakdown"}. We're sorry for the trouble. Please wait for updates or contact JetLink support.`,
      type: "emergency",
      busNumber: bus.busNumber,
      data: { busNumber: bus.busNumber, status },
    });

    return res.status(200).json({
      success: true,
      message: `Emergency reported: ${status}`,
      bus,
    });
  } catch (error) {
    console.error("Report emergency error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to report emergency",
      error: error.message,
    });
  }
};

// Resolve an emergency
export const resolveEmergency = async (req, res) => {
  try {
    const { busNumber } = req.params;

    const bus = await Bus.findOneAndUpdate(
      { busNumber: busNumber.trim().toUpperCase() },
      {
        $set: {
          emergency: false,
          status: "normal",
          emergencyAt: null,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    await notify({
      title: `✅ Emergency resolved: Bus ${bus.busNumber}`,
      body: `Bus ${bus.busNumber} is back to normal.`,
      type: "emergency",
      audience: ["admin", "staff"],
      data: { busNumber: bus.busNumber, status: "normal" },
    });

    await notifyPassengers(await passengersOnBus(bus.busNumber), {
      title: `✅ ${busDisplay(bus)} is back in service`,
      body: "The problem has been fixed and your bus is running again.",
      type: "emergency",
      busNumber: bus.busNumber,
      data: { busNumber: bus.busNumber, status: "normal" },
    });

    return res.status(200).json({
      success: true,
      message: "Emergency resolved successfully",
      bus,
    });
  } catch (error) {
    console.error("Resolve emergency error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to resolve emergency",
      error: error.message,
    });
  }
};

// Get the current emergency status of a bus
export const getBusEmergency = async (req, res) => {
  try {
    const { busNumber } = req.params;

    const bus = await Bus.findOne({
      busNumber: busNumber.trim().toUpperCase(),
    }).select("busNumber emergency status emergencyAt");

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    return res.status(200).json({
      success: true,
      bus,
    });
  } catch (error) {
    console.error("Get emergency error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get emergency status",
      error: error.message,
    });
  }
};

// Get all buses where emergency is true
export const getAllEmergencyBuses = async (req, res) => {
  try {
    // Newest emergency first
    const buses = await Bus.find({ emergency: true }).sort({
      emergencyAt: -1,
      busId: 1,
    });

    return res.status(200).json({
      success: true,
      count: buses.length,
      buses,
    });
  } catch (error) {
    console.error("Error fetching emergency buses:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch emergency buses",
      error: error.message,
    });
  }
};

// Get emergency buses except the specified bus number
export const getOtherEmergencyBuses = async (req, res) => {
  try {
    const { busNumber } = req.params;

    const buses = await Bus.find({
      emergency: true,
      busNumber: { $ne: busNumber },
    }).sort({ busId: 1 });

    return res.status(200).json({
      success: true,
      count: buses.length,
      buses,
    });
  } catch (error) {
    console.error("Error fetching emergency buses:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch emergency buses",
    });
  }
};

// GET /api/buses/profile/:busNumber  → full bus details for the bus staff profile
export const getBusProfile = async (req, res) => {
  try {
    const bus = await Bus.findOne({ busNumber: req.params.busNumber });

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    res.status(200).json({
      success: true,
      data: bus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
