import cron from "node-cron";
import Parcel from "../models/Parcel.js";

const updateExpiredParcels = async () => {
  try {
    const today = new Date();

    // Set today to midnight
    today.setHours(0, 0, 0, 0);

    const parcels = await Parcel.find({
      delivered: false,
      status: { $ne: "Delivered" },
    });

    let updatedCount = 0;

    for (const parcel of parcels) {
      if (!parcel.date) continue;

      // Your date format should be MM/DD/YYYY
      const [month, day, year] = parcel.date.split("/").map(Number);

      if (!month || !day || !year) {
        console.log(`Invalid parcel date: ${parcel.date}`);
        continue;
      }

      const parcelDate = new Date(year, month - 1, day);
      parcelDate.setHours(0, 0, 0, 0);

      // If parcel date has passed
      if (parcelDate < today) {
        parcel.delivered = true;
        parcel.deliveredAt = new Date();
        parcel.status = "Delivered";

        await parcel.save();

        updatedCount++;

        console.log(
          `Parcel ${parcel.parcelId} automatically marked as Delivered`
        );
      }
    }

    if (updatedCount > 0) {
      console.log(`${updatedCount} expired parcel(s) updated.`);
    }
  } catch (error) {
    console.error("Error updating expired parcels:", error);
  }
};

// Run once when server starts
    updateExpiredParcels();

    // Run every day at 12:05 AM
    cron.schedule("5 0 * * *", () => {
      console.log("Checking expired parcels...");
      updateExpiredParcels();
    });

export default updateExpiredParcels;