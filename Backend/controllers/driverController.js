import Driver from "../models/Driver.js";
import crypto from "crypto";

// Renumber 1, 2, 3... after a delete without breaking the unique index.
// Step 1 moves every id to a temporary negative number, step 2 sets the final number.
// bulkWrite skips schema validation, so older records with missing fields don't fail.
const renumberIds = async (Model, field) => {
  const docs = await Model.find().sort({ [field]: 1, _id: 1 }).select("_id").lean();
  if (!docs.length) return;
  await Model.bulkWrite(
    docs.map((d, i) => ({ updateOne: { filter: { _id: d._id }, update: { $set: { [field]: -(i + 1) } } } }))
  );
  await Model.bulkWrite(
    docs.map((d, i) => ({ updateOne: { filter: { _id: d._id }, update: { $set: { [field]: i + 1 } } } }))
  );
};

export const addDriver = async (req, res) => {
  try {
    const lastDriver = await Driver.findOne().sort({ driverId: -1 });

    const nextId = lastDriver ? lastDriver.driverId + 1 : 1;

    const driver = new Driver({
      ...req.body,
      driverId: nextId,
    });

    await driver.save();

    res.json({
      success: true,
      data: driver,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find();

    res.json({
      success: true,
      data: drivers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get one driver
export const getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    res.json({
      success: true,
      data: driver,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    await Driver.findByIdAndDelete(req.params.id);

    // Renumber driverId values (the driver is already deleted, so don't fail the request if this goes wrong)
    try {
      await renumberIds(Driver, "driverId");
    } catch (renumberError) {
      console.error("Driver renumber error:", renumberError);
    }

    res.json({
      success: true,
      message: "Driver deleted successfully",
    });
  } catch (error) {
    console.error("Delete driver error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

export const updateDriver = async (req, res) => {
  try {
    await Driver.findByIdAndUpdate(req.params.id, req.body);

    res.json({
      success: true,
      message: "Updated Successfully",
    });
  } catch {
    res.status(500).json({
      success: false,
    });
  }
};

export const checkNIC = async (req, res) => {
  try {
    const driver = await Driver.findOne({
      NIC: req.params.nic,
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        exists: false,
        message: "Driver  not found",
      });
    }

    res.status(200).json({
      
      success: true,
      exists: true,
      data: {
        _id: driver._id,
        driverId: driver.driverId,
        firstName: driver.firstName,
        lastName:driver.lastName,
        phoneNumber:driver.phoneNumber,
        NIC:driver.NIC,
        
        
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};