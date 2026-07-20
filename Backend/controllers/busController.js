import Bus from "../models/Bus.js";

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