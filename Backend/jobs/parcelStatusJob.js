import cron from "node-cron";
import Parcel from "../models/Parcel.js";
import { dayNumber, todayInSriLanka, TIME_ZONE } from "../utils/sriLankaDate.js";

const updateExpiredParcels = async () => {
  try {
    // Today in Sri Lanka, whatever time zone the server is in
    const today = todayInSriLanka();

    // Only the fields we need, as plain objects (much faster than full documents)
    const parcels = await Parcel.find({
      delivered: false,
      status: { $ne: "Delivered" },
    }).select("_id parcelId date").lean();

    const expiredIds = [];

    for (const parcel of parcels) {
      if (!parcel.date) continue;

      const parcelDate = dayNumber(parcel.date); // date format: MM/DD/YYYY
      if (parcelDate == null) {
        console.log(`Invalid parcel date: ${parcel.date}`);
        continue;
      }

      // If parcel date has passed
      if (parcelDate < today) {
        expiredIds.push(parcel._id);
      }
    }

    // One database call for all expired parcels instead of one save per parcel
    let updatedCount = 0;
    if (expiredIds.length) {
      const result = await Parcel.updateMany(
        { _id: { $in: expiredIds } },
        { $set: { delivered: true, deliveredAt: new Date(), status: "Delivered" } }
      );
      updatedCount = result.modifiedCount;
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
    }, { timezone: TIME_ZONE });

export default updateExpiredParcels;