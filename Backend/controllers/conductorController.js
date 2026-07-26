import Conductor from "../models/Conductor.js";

// Conductor Login - Send OTP
export const conductorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const conductor = await Conductor.findOne({ email: email.toLowerCase() });

    if (!conductor) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcryptjs.compare(password, conductor.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate and store OTP
    const otp = generateOTP();
    const existingOTP = await OTP.findOneAndDelete({ email: email.toLowerCase(), userType: "conductor" });

    const newOTP = new OTP({
      email: email.toLowerCase(),
      otp: otp,
      userType: "conductor",
    });

    await newOTP.save();

    // Send OTP via email
    await sendOTPEmail(email, otp);

    res.json({
      success: true,
      message: "OTP sent to your email. Please verify to complete login.",
      tempToken: Buffer.from(JSON.stringify({ email, conductorId: conductor._id })).toString("base64"),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const addConductor = async (req, res) => {
  try {

    const lastConductor = await Conductor.findOne().sort({ conductorId: -1 });

    const nextId = lastConductor ? lastConductor.conductorId + 1 : 1;

    

    const conductor = new Conductor({
      ...req.body,
      conductorId: nextId,
      
    });

    await conductor.save();

    res.json({
      success: true,
      message: "Conductor Added Successfully",
      data: conductor,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

export const getConductors = async (req, res) => {

    try {

        const conductors = await Conductor.find();

        res.json({
            success: true,
            data: conductors,
        });

    } catch {

        res.status(500).json({
            success: false,
            message: "Server Error",
        });

    }

};

export const getConductorById = async (req, res) => {

    try {

        const conductor = await Conductor.findById(req.params.id);

        res.json({
            success: true,
            data: conductor,
        });

    } catch {

        res.status(500).json({
            success: false,
            message: "Server Error",
        });

    }

};

export const deleteConductor = async (req, res) => {

    try {

        await Conductor.findByIdAndDelete(req.params.id);

        const conductors = await Conductor.find().sort({ conductorId: 1 });

        for (let i = 0; i < conductors.length; i++) {

            conductors[i].conductorId = i + 1;

            await conductors[i].save();

        }

        res.json({
            success: true,
            message: "Conductor Deleted",
        });

    } catch {

        res.status(500).json({
            success: false,
            message: "Server Error",
        });

    }

};

export const updateConductor = async (req, res) => {
  try {
    const conductor = await Conductor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      data: conductor,
      message: "Conductor Updated Successfully",
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const checkNIC = async (req, res) => {
  try {
    const conductor = await Conductor.findOne({
      NIC: req.params.nic,
    });

    if (!conductor) {
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
        _id: conductor._id,
        conductorId: conductor.conductorId,
        email:conductor.email,
        firstName: conductor.firstName,
        lastName: conductor.lastName,
        phoneNumber:conductor.phoneNumber,
        NIC: conductor.NIC,
        
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const loginConductor = async (req, res) => {
  try {
    const { NIC, password } = req.body;

    const conductor = await Conductor.findOne({ NIC });

    if (!conductor) {
      return res.status(404).json({
        success: false,
        message: "Conductor not found",
      });
    }

    if (password !== conductor.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid NIC or password",
      });
    }

    res.json({
      success: true,
      message: "Login Successful",
      data: {
        _id: conductor._id,
        conductorId: conductor.conductorId,
        firstName: conductor.firstName,
        lastName: conductor.lastName,
        NIC: conductor.NIC,
        phoneNumber:conductor.phoneNumber,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};