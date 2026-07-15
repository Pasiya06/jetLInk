import Passenger from "../models/Passenger.js";

export const registerPassenger = async (req, res) => {
  try {
    const { email, phoneNumber, NIC } = req.body;

    // Check existing passenger
    const existingPassenger = await Passenger.findOne({
      $or: [
        { email: email },
        { phoneNumber: phoneNumber },
        { NIC: NIC }
      ]
    });

    if (existingPassenger) {
      let message = "";

      if (existingPassenger.email === email) {
        message = "Email already registered.";
      } else if (existingPassenger.phoneNumber === phoneNumber) {
        message = "Phone number already registered.";
      } else if (existingPassenger.NIC === NIC) {
        message = "NIC already registered.";
      }

      return res.status(400).json({
        success: false,
        message: message,
      });
    }

    // Register new passenger
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

    const passenger = await Passenger.findOne({ email });
    const passenger1 = await Passenger.findOne({  password });
    if (!passenger) {
      return res.status(401).json({
        success: false,
        message: "Please create an account first. ",
      });
    }

    if (!passenger1) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
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