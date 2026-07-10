import Passenger from "../models/Passenger.js";

export const registerPassenger = async (req, res) => {
  try {
    const passenger = new Passenger(req.body);
    await passenger.save();

    res.status(201).json({
      success: true,
      message: "Passenger Registered Successfully",
      data: passenger,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const loginPassenger = async (req, res) => {
  try {
    const { email, password } = req.body;

    const passenger = await Passenger.findOne({ email, password });

    if (!passenger) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    res.json({
      success: true,
      passenger,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPassengers = async (req, res) => {
  try {
    const passengers = await Passenger.find();

    res.json({
      success: true,
      data: passengers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deletePassenger = async (req, res) => {
  try {
    const passenger = await Passenger.findById(req.params.id);

    if (!passenger) {
      return res.status(404).json({
        success: false,
        message: "Passenger not found",
      });
    }

    const deletedPassengerId = passenger.passengerId;

    await Passenger.findByIdAndDelete(req.params.id);

    await Passenger.updateMany(
      { passengerId: { $gt: deletedPassengerId } },
      { $inc: { passengerId: -1 } }
    );

    res.json({
      success: true,
      message: "Passenger deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};