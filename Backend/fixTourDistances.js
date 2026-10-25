// One-time fix: tour bookings saved before the distance bug was fixed have
// totalDistance = 0. This copies the distance from each booking's package.
// Run from the Backend folder:  node fixTourDistances.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Receipt from "./models/Tour.js";
import Package from "./models/Package.js";

dotenv.config();

// "700km", "700 km", "1,200 KM" -> 700 / 1200 (0 if no number)
const parseDistanceKm = (value) => {
  const match = String(value ?? "").replace(/,/g, "").match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    const receipts = await Receipt.find({
      $or: [{ totalDistance: 0 }, { totalDistance: null }, { totalDistance: { $exists: false } }],
    });
    console.log(`Found ${receipts.length} tour booking(s) with no distance`);

    let fixed = 0;
    for (const r of receipts) {
      let pkg = null;
      try {
        pkg = await Package.findById(r.packageId).select("totalDistance");
      } catch {
        // packageId is not a valid id
      }
      const km = parseDistanceKm(pkg?.totalDistance);
      if (km > 0) {
        await Receipt.updateOne({ _id: r._id }, { $set: { totalDistance: km } });
        fixed++;
        console.log(`  ${r.receiptId}: ${km} km`);
      } else {
        console.log(`  ${r.receiptId}: package has no distance - skipped`);
      }
    }

    console.log(`Done. Updated ${fixed} booking(s).`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

run();
