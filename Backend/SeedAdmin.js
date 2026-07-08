import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Admin from "./models/Admin.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    const email = "admin@.com";
    const password = "123";

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists.");

      // Update password
      existingAdmin.password = await bcrypt.hash(password, 10);
      await existingAdmin.save();

      console.log("✅ Admin password updated.");
    } 
    else {
      // Create new admin
      const hashedPassword = await bcrypt.hash(password, 10);

      await Admin.create({
        firstName: "Muthukumara",
        lastName: "Samarasinghe",
        email,
        phoneNumber: "0771234567",
        password: hashedPassword,
      });

      console.log("✅ Admin account created.");
    }

    console.log("--------------------------------");
    console.log(`Email    : ${email}`);
    console.log(`Password : ${password}`);
    console.log("--------------------------------");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

seedAdmin();