// backend/controllers/locationController.js
import Location from "../models/Bus.js";

// ─── Update Bus Location ───────────────────────────────────────────
// POST /api/locations/update
export const updateLocation = async (req, res) => {
  try {
    const { busNumber, latitude, longitude, speed, driverNIC, conductorNIC, driverD, conductorD, heading, } = req.body;

    // Validate required fields
    if (!busNumber) {
      return res.status(400).json({
        success: false,
        message: "busNama is required",
      });
    }

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "latitude and longitude are required",
      });
    }

    // Update or create location record
    const location = await Location.findOneAndUpdate(
      { busNumber },
      {
        latitude,
        longitude,
        speed: speed || 0,
        driverNIC,
        conductorNIC,
        driverD,
        conductorD,
        heading: heading || 0,
        isOnline: true,
      },
      {
        new: true,
        upsert: true, // create if not exists
      }
    );

    res.json({
      success: true,
      data: location,
    });
  } catch (error) {
    console.error("updateLocation error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Get One Bus Location ──────────────────────────────────────────
// GET /api/locations/:busNama
export const getBusLocation = async (req, res) => {
  try {
    const location = await Location.findOne({
      busNumber: req.params.busNumber,
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "No location found for this bus",
      });
    }

    res.json({
      success: true,
      data: location,
    });
  } catch (error) {
    console.error("getBusLocation error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Get All Bus Locations ─────────────────────────────────────────
// GET /api/locations
export const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find();

    res.json({
      success: true,
      data: locations,
    });
  } catch (error) {
    console.error("getAllLocations error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Set Bus Offline ───────────────────────────────────────────────
// POST /api/locations/offline
export const setOffline = async (req, res) => {
  try {
    const { busNumber } = req.body;

    if (!busNumber) {
      return res.status(400).json({
        success: false,
        message: "busNumber is required",
      });
    }

    await Location.findOneAndUpdate(
      { busNumber },
      { isOnline: false }
    );

    res.json({
      success: true,
      message: "Bus is now offline",
    });
  } catch (error) {
    console.error("setOffline error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateLocation1 = async (req, res) => {
  try {
    const { busNumber, latitude, longitude, speed, driverNIC, conductorNIC, driverD, conductorD, heading } = req.body;

    // Validate required fields
    if (!busNumber) {
      return res.status(400).json({
        success: false,
        message: "busNama is required",
      });
    }

    
    // Update or create location record
    const location = await Location.findOneAndUpdate(
      { busNumber },
      {
        latitude,
        longitude,
        speed: speed || 0,
        driverNIC,
        conductorNIC,
        driverD,
        conductorD,
        heading: heading || 0,
        isOnline: false,
      },
      
    );

    res.json({
      success: true,
      data: location,
    });
  } catch (error) {
    console.error("updateLocation error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Clear Bus Location (staff logout) ─────────────────────────────
// POST /api/locations/clear   body: { busNumber }
// Wipes the live position and crew details and marks the bus offline.
export const clearLocation = async (req, res) => {
  try {
    const { busNumber } = req.body;

    if (!busNumber) {
      return res.status(400).json({
        success: false,
        message: "busNumber is required",
      });
    }

    const bus = await Location.findOneAndUpdate(
      { busNumber },
      {
        latitude: 0,
        longitude: 0,
        speed: 0,
        heading: 0,
        isOnline: false,
        driverNIC: "Not ",
        conductorNIC: "Not ",
        driverD: "Not login yet",
        conductorD: "Not login yet",
      },
      { new: true }
    );

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    res.json({
      success: true,
      message: "Bus location cleared",
    });
  } catch (error) {
    console.error("clearLocation error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
