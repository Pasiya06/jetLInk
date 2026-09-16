import cron from "node-cron";
import Ticket from "../models/Ticket.js";

const updateExpiredTickets = async () => {
  try {
    const now = new Date();

    // Start of today
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    // Get all tickets that are still unused
    const tickets = await Ticket.find({
      used: false,
    });

    let updatedCount = 0;

    for (const ticket of tickets) {
      const parts = ticket.date.split("/");

      if (parts.length !== 3) {
        console.log(
          `Invalid ticket date: ${ticket.ticketId} - ${ticket.date}`
        );
        continue;
      }

      const month = Number(parts[0]);
      const day = Number(parts[1]);
      const year = Number(parts[2]);

      const ticketDate = new Date(
        year,
        month - 1,
        day
      );

      // Remove time
      ticketDate.setHours(0, 0, 0, 0);

      // If ticket date is before today
      if (ticketDate < today) {
        ticket.used = true;
        ticket.usedAt = new Date();

        await ticket.save();

        updatedCount++;

        console.log(
          `Ticket ${ticket.ticketId} marked as used`
        );
      }
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
});

export default updateExpiredTickets;

