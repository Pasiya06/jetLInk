import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import Admin from "../models/Admin.js";

// Never send the password hash back to the app
const toSafeAdmin = (admin) => {
  const obj = admin.toObject ? admin.toObject() : { ...admin };
  delete obj.password;
  return obj;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^0\d{9}$/; // Sri Lankan format e.g. 0771234567

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email: String(email || "").trim().toLowerCase() });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    res.json({
      success: true,
      admin: toSafeAdmin(admin),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");

    res.json({
      success: true,
      data: admins,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/admin/:id  → one admin profile
export const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid admin ID" });
    }

    const admin = await Admin.findById(id).select("-password");

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    res.json({ success: true, data: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/admin  → create a new admin profile
export const createAdmin = async (req, res) => {
  try {
    const firstName = String(req.body.firstName || "").trim();
    const lastName = String(req.body.lastName || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const phoneNumber = String(req.body.phoneNumber || "").trim();
    const password = String(req.body.password || "");

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "First name, last name, email and password are required",
      });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email address" });
    }

    if (phoneNumber && !PHONE_REGEX.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be 10 digits starting with 0",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "An admin with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: toSafeAdmin(admin),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/:id  → edit admin profile
// Body: firstName, lastName, email, phoneNumber
// Optional password change: currentPassword + newPassword
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid admin ID" });
    }

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    const { firstName, lastName, email, phoneNumber, currentPassword, newPassword } = req.body;

    if (firstName !== undefined) {
      if (!String(firstName).trim()) {
        return res.status(400).json({ success: false, message: "First name cannot be empty" });
      }
      admin.firstName = String(firstName).trim();
    }

    if (lastName !== undefined) {
      if (!String(lastName).trim()) {
        return res.status(400).json({ success: false, message: "Last name cannot be empty" });
      }
      admin.lastName = String(lastName).trim();
    }

    if (email !== undefined) {
      const cleanEmail = String(email).trim().toLowerCase();
      if (!EMAIL_REGEX.test(cleanEmail)) {
        return res.status(400).json({ success: false, message: "Invalid email address" });
      }
      if (cleanEmail !== admin.email) {
        const taken = await Admin.findOne({ email: cleanEmail, _id: { $ne: id } });
        if (taken) {
          return res.status(409).json({
            success: false,
            message: "Another admin already uses this email",
          });
        }
      }
      admin.email = cleanEmail;
    }

    if (phoneNumber !== undefined) {
      const cleanPhone = String(phoneNumber).trim();
      if (cleanPhone && !PHONE_REGEX.test(cleanPhone)) {
        return res.status(400).json({
          success: false,
          message: "Phone number must be 10 digits starting with 0",
        });
      }
      admin.phoneNumber = cleanPhone;
    }

    // Password change is optional and needs the current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required to set a new password",
        });
      }
      const ok = await bcrypt.compare(String(currentPassword), admin.password);
      if (!ok) {
        return res.status(401).json({ success: false, message: "Current password is incorrect" });
      }
      if (String(newPassword).length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters",
        });
      }
      admin.password = await bcrypt.hash(String(newPassword), 10);
    }

    await admin.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: toSafeAdmin(admin),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
