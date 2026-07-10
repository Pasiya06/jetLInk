import Location from "../models/Location.js";

// Update Bus Location
export const updateLocation = async (req, res) => {
  try {
    const { busNumber, latitude, longitude, speed, heading } = req.body;

    const location = await Location.findOneAndUpdate(
      { busNumber },
      {
        latitude,
        longitude,
        speed,
        heading,
        updatedAt: new Date(),
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
      busNumber: req.params.busNumber,
    });

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