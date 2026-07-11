import Location from "../models/Location.js";

// Update Bus Location
// Update Bus Location (create if not exists, update if exists)
export const updateLocation = async (req, res) => {
  try {
    const { busNama, latitude, longitude, speed, heading } = req.body;

    if (!busNama) {
      return res.status(400).json({
        success: false,
        message: "busNumber is required",
      });
    }

    const location = await Location.findOneAndUpdate(
      { busNama },
      {
        latitude,
        longitude,
        speed,
        heading,
        isOnline: true,
      },
      {
        new: true,
        upsert: true,
      }
    );

    res.json({
      success: true,
      data: location,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get One Bus Location
export const getBusLocation = async (req, res) => {
  try {
    const location = await Location.findOne({
      busNum: req.params.busNama,
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "No location found for this bus number",
      });
    }

    res.json({
      success: true,
      data: location,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Buses
export const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find();

    res.json({
      success: true,
      data: locations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Set Bus Offline (called on conductor logout)
export const setOffline = async (req, res) => {
  try {
    const { busNama } = req.body;

    if (!busNama) {
      return res.status(400).json({
        success: false,
        message: "busNumber is required",
      });
    }

    await Location.findOneAndUpdate({ busNama }, { isOnline: false });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};