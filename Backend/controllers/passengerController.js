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
    const passenger1 = await Passenger.findOne({ email, password });
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

export const updatePassengerPassword = async (req, res) => {
  try {
    const { email } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    const passenger = await Passenger.findOne({ email });

    if (!passenger) {
      return res.status(404).json({
        success: false,
        message: "Passenger not found",
      });
    }

    passenger.password = password;
    await passenger.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Update Password Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const Getname = async (req, res) => {
  try {
    const passenger = await Passenger.findOne({
      email: req.params.email,
    });

    if (!passenger) {
      return res.status(404).json({
        success: false,
        exists: false,
        message: "Passenger  not found",
      });
    }

    res.status(200).json({
      
      success: true,
      exists: true,
      data: {
        _id: passenger._id,
        passengerId: passenger.passengerId,
        firstName: passenger.firstName,
        lastName:passenger.lastName,
        phoneNumber:passenger.phoneNumber,
        email:passenger.email,
        
        
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPassengerByNIC = async (req, res) => {
  try {
    const { NIC } = req.params;

    if (!NIC || !NIC.trim()) {
      return res.status(400).json({
        success: false,
        message: "NIC is required",
      });
    }

    const passenger = await Passenger.findOne({
      NIC: NIC.trim(),
    }).select("-password");

    if (!passenger) {
      return res.status(404).json({
        success: false,
        message: "Passenger not found",
      });
    }

    return res.status(200).json({
      success: true,
      passenger,
    });
  } catch (error) {
    console.error("Error fetching passenger by NIC:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch passenger",
    });
  }
};

// PUT /api/passengers/:id  → edit passenger profile
// Body: firstName, lastName, phoneNumber, address, NIC, email
// Optional password change: currentPassword + newPassword
export const updatePassenger = async (req, res) => {
  try {
    const passenger = await Passenger.findById(req.params.id);

    if (!passenger) {
      return res.status(404).json({
        success: false,
        message: "Passenger not found",
      });
    }

    const {
      firstName,
      lastName,
      phoneNumber,
      address,
      NIC,
      email,
      currentPassword,
      newPassword,
    } = req.body;

    const clean = (v) => (v === undefined ? undefined : String(v).trim());
    const next = {
      firstName: clean(firstName),
      lastName: clean(lastName),
      phoneNumber: clean(phoneNumber),
      address: clean(address),
      NIC: clean(NIC) === undefined ? undefined : clean(NIC).toUpperCase(),
      email: clean(email) === undefined ? undefined : clean(email).toLowerCase(),
    };

    // Required fields cannot be emptied
    for (const [key, value] of Object.entries(next)) {
      if (value !== undefined && value === "") {
        return res.status(400).json({
          success: false,
          message: `${key} cannot be empty`,
        });
      }
    }

    if (next.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email)) {
      return res.status(400).json({ success: false, message: "Invalid email address" });
    }
    if (next.phoneNumber && !/^0\d{9}$/.test(next.phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be 10 digits starting with 0",
      });
    }
    if (next.NIC && !/^(\d{9}[VX]|\d{12})$/.test(next.NIC)) {
      return res.status(400).json({
        success: false,
        message: "NIC must be 9 digits + V/X or 12 digits",
      });
    }

    // Email, phone and NIC must stay unique
    const checks = [
      ["email", next.email, "Email already registered."],
      ["phoneNumber", next.phoneNumber, "Phone number already registered."],
      ["NIC", next.NIC, "NIC already registered."],
    ];
    for (const [field, value, message] of checks) {
      if (value && value !== passenger[field]) {
        const taken = await Passenger.findOne({ [field]: value, _id: { $ne: passenger._id } });
        if (taken) {
          return res.status(400).json({ success: false, message });
        }
      }
    }

    for (const [key, value] of Object.entries(next)) {
      if (value !== undefined) passenger[key] = value;
    }

    // Optional password change (same plain-text check as loginPassenger)
    if (newPassword) {
      if (!currentPassword || currentPassword !== passenger.password) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }
      if (String(newPassword).length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters",
        });
      }
      passenger.password = String(newPassword);
    }

    await passenger.save();

    const data = passenger.toObject();
    delete data.password;

    res.json({
      success: true,
      message: "Profile updated successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
