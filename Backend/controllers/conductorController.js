import Conductor from "../models/Conductor.js";
import OTP from "../models/OTP.js";

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
    console.log(`🔑 [DEVELOPMENT OTP] Code for conductor ${email}:`);
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
    console.log(`🔑 [FALLBACK OTP] Code for conductor ${email}:`);
    console.log(`👉 OTP: ${otp} 👈`);
    console.log("=========================================\n");
    return { success: true, message: "OTP generated (email service unavailable)" };
  }
};

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

// Conductor OTP Verification
export const verifyConductorOTP = async (req, res) => {
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
      userType: "conductor",
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

    const conductor = await Conductor.findOne({ email: email.toLowerCase() });

    res.json({
      success: true,
      message: "Login successful",
      data: {
        conductorId: conductor._id,
        conductorCode: conductor.conductorId,
        email: conductor.email,
        firstName: conductor.firstName,
        lastName: conductor.lastName,
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
        NIC: conductor.NIC,
        firstName: conductor.firstName,
        lastName: conductor.lastName,
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
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};