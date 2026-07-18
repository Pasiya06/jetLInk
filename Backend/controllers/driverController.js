import Driver from "../models/Driver.js";
import OTP from "../models/OTP.js";
import bcryptjs from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";

// Initialize nodemailer transporter
const initializeTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailHost = process.env.EMAIL_HOST;
  const emailPort = process.env.EMAIL_PORT;

  if (!emailUser || !emailPass) {
    return null;
  }

  if (emailHost && emailHost.toLowerCase().includes("gmail")) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }

  return nodemailer.createTransport({
    host: emailHost,
    port: parseInt(emailPort || "587"),
    secure: emailPort === "465",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via email
const sendOTPEmail = async (email, otp) => {
  const transporter = initializeTransporter();

  if (!transporter) {
    console.log("\n=========================================");
    console.log(`🔑 [DEVELOPMENT OTP] Code for driver/conductor ${email}:`);
    console.log(`👉 OTP: ${otp} 👈`);
    console.log(`Validity: Expires in 5 minutes`);
    console.log("=========================================\n");
    return { success: true, message: "OTP logged to console (development mode)" };
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "JetLink - Login Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #2563eb; text-align: center;">JetLink Bus Management</h2>
          <p>Hello,</p>
          <p>You have initiated a login request. Use the following verification code to complete your login. This code is valid for 5 minutes:</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a;">${otp}</span>
          </div>
          <p>If you did not request this, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px;"/>
          <p style="font-size: 12px; color: #64748b; text-align: center;">This is an automated message from JetLink Bus Management System.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✉️ OTP sent to ${email}`);
    return { success: true, message: "OTP sent to email" };
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    console.log("\n=========================================");
    console.log(`🔑 [FALLBACK OTP] Code for driver/conductor ${email}:`);
    console.log(`👉 OTP: ${otp} 👈`);
    console.log("=========================================\n");
    return { success: true, message: "OTP generated (email service unavailable)" };
  }
};

// Driver Login - Send OTP
export const driverLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const driver = await Driver.findOne({ email: email.toLowerCase() });

    if (!driver) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcryptjs.compare(password, driver.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate and store OTP
    const otp = generateOTP();
    const existingOTP = await OTP.findOneAndDelete({ email: email.toLowerCase(), userType: "driver" });

    const newOTP = new OTP({
      email: email.toLowerCase(),
      otp: otp,
      userType: "driver",
    });

    await newOTP.save();

    // Send OTP via email
    await sendOTPEmail(email, otp);

    res.json({
      success: true,
      message: "OTP sent to your email. Please verify to complete login.",
      tempToken: Buffer.from(JSON.stringify({ email, driverId: driver._id })).toString("base64"),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Driver OTP Verification
export const verifyDriverOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      userType: "driver",
    });

    if (!otpRecord) {
      return res.status(401).json({
        success: false,
        message: "OTP expired or not found",
      });
    }

    if (otpRecord.otp !== otp) {
      return res.status(401).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    const driver = await Driver.findOne({ email: email.toLowerCase() });

    res.json({
      success: true,
      message: "Login successful",
      data: {
        driverId: driver._id,
        driverCode: driver.driverId,
        email: driver.email,
        firstName: driver.firstName,
        lastName: driver.lastName,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
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

    // Renumber driverId values
    const drivers = await Driver.find().sort({ driverId: 1 });

    for (let i = 0; i < drivers.length; i++) {
      drivers[i].driverId = i + 1;
      await drivers[i].save();
    }

    res.json({
      success: true,
      message: "Driver deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
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