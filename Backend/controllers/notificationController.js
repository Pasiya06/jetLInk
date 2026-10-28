import Notification from "../models/Notification.js";
import { emailNotification } from "../utils/notificationEmail.js";

/**
 * Save a notification and email it to the people it concerns (passenger,
 * bus crew, admins). Used by other controllers when something happens
 * (emergency, new parcel, new ticket...). Never throws, so it can't break
 * the request that triggered it.
 */
export const notify = async ({ title, body = "", type = "general", audience = ["admin"], busNumber = null, passengerEmail = null, data = {} }) => {
  try {
    const saved = await Notification.create({
      title,
      body,
      type,
      audience,
      busNumber: busNumber ? String(busNumber).trim().toUpperCase() : null,
      passengerEmail: passengerEmail ? String(passengerEmail).trim().toLowerCase() : null,
      data,
    });
    // Email in the background so the app gets its answer straight away
    emailNotification(saved.toObject());
    return saved;
  } catch (error) {
    console.error("Failed to save notification:", error.message);
    return null;
  }
};

/**
 * Send an alert to one or more passengers (by email). Duplicate / empty emails
 * are skipped. Never throws.
 */
export const notifyPassengers = async (emails, { title, body = "", type = "general", busNumber = null, data = {} }) => {
  const list = [...new Set((Array.isArray(emails) ? emails : [emails])
    .map((e) => String(e || "").trim().toLowerCase())
    .filter(Boolean))];
  await Promise.all(
    list.map((passengerEmail) =>
      notify({ title, body, type, audience: ["passenger"], busNumber, passengerEmail, data })
    )
  );
};

// GET /api/notifications?role=admin
// GET /api/notifications?role=staff&busNumber=NB-1234
// GET /api/notifications?role=passenger&email=someone@mail.com
// Optional: &since=<ISO date> to get only newer ones, &limit=50
export const getNotifications = async (req, res) => {
  try {
    const { role, busNumber, since, email } = req.query;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);

    if (!["admin", "staff", "passenger"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "role must be admin, staff or passenger",
      });
    }

    const filter = { audience: role };

    // Staff see alerts for everyone plus alerts for their own bus
    if (role === "staff") {
      const bus = busNumber ? String(busNumber).trim().toUpperCase() : null;
      filter.$or = bus ? [{ busNumber: null }, { busNumber: bus }] : [{ busNumber: null }];
    }

    // Passengers see announcements for everyone plus their own alerts
    if (role === "passenger") {
      const mail = email ? String(email).trim().toLowerCase() : null;
      filter.$or = mail
        ? [{ passengerEmail: null }, { passengerEmail: mail }]
        : [{ passengerEmail: null }];
    }

    if (since) {
      const sinceDate = new Date(since);
      if (!isNaN(sinceDate.getTime())) filter.createdAt = { $gt: sinceDate };
    }

    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(limit);

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

// POST /api/notifications  { title, body, type, audience, busNumber, data }
// Lets the admin send an announcement to staff (or any screen create one).
export const createNotification = async (req, res) => {
  try {
    const { title, body, type, audience, busNumber, passengerEmail, data } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const list = Array.isArray(audience) ? audience : audience ? [audience] : ["admin"];

    const notification = await Notification.create({
      title,
      body,
      type,
      audience: list,
      busNumber: busNumber ? String(busNumber).trim().toUpperCase() : null,
      passengerEmail: passengerEmail ? String(passengerEmail).trim().toLowerCase() : null,
      data,
    });

    // Announcements are emailed too (see utils/notificationEmail.js for the rules)
    emailNotification(notification.toObject());

    return res.status(201).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Create notification error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE /api/notifications/:id
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
