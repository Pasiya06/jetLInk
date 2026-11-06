import cron from "node-cron";
import Ticket from "../models/Ticket.js";
import { dayNumber, todayInSriLanka, TIME_ZONE } from "../utils/sriLankaDate.js";

const updateExpiredTickets = async () => {
  try {
    // Today in Sri Lanka, whatever time zone the server is in
    const today = todayInSriLanka();

    // Get all tickets that are still unused
    // Only the fields we need, as plain objects (much faster than full documents)
    const tickets = await Ticket.find({
      used: false,
    }).select("_id ticketId date").lean();

    const expiredIds = [];

    for (const ticket of tickets) {
      const ticketDate = dayNumber(ticket.date); // date format: MM/DD/YYYY

      if (ticketDate == null) {
        console.log(
          `Invalid ticket date: ${ticket.ticketId} - ${ticket.date}`
        );
        continue;
      }

      // If ticket date is before today
      if (ticketDate < today) {
        expiredIds.push(ticket._id);
      }
    }

    // One database call for all expired tickets instead of one save per ticket
    let updatedCount = 0;
    if (expiredIds.length) {
      const result = await Ticket.updateMany(
        { _id: { $in: expiredIds } },
        { $set: { used: true, usedAt: new Date() } }
      );
      updatedCount = result.modifiedCount;
    }

    console.log(
      `Expired ticket check completed. Updated: ${updatedCount}`
    );
  } catch (error) {
    console.error(
      "Error updating expired tickets:",
      error
    );
  }
};

updateExpiredTickets();

// Run every day at 12:01 AM
cron.schedule("1 0 * * *", () => {
  console.log("Running expired ticket check...");
  updateExpiredTickets();
}, { timezone: TIME_ZONE });

export default updateExpiredTickets;

