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