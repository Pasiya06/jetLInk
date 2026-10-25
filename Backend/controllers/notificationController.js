import Notification from "../models/Notification.js";

/**
 * Save a notification. Used by other controllers when something happens
 * (emergency, new parcel, new ticket...). Never throws, so it can't break
 * the request that triggered it.
 */
export const notify = async ({ title, body = "", type = "general", audience = ["admin"], busNumber = null, data = {} }) => {
  try {
    return await Notification.create({
      title,
      body,
      type,
      audience,
      busNumber: busNumber ? String(busNumber).trim().toUpperCase() : null,
      data,
    });
  } catch (error) {
    console.error("Failed to save notification:", error.message);
    return null;
  }
};

// GET /api/notifications?role=admin
// GET /api/notifications?role=staff&busNumber=NB-1234
// Optional: &since=<ISO date> to get only newer ones, &limit=50
export const getNotifications = async (req, res) => {
  try {
    const { role, busNumber, since } = req.query;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);

    if (!["admin", "staff"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "role must be admin or staff",
      });
    }

    const filter = { audience: role };

    // Staff see alerts for everyone plus alerts for their own bus
    if (role === "staff") {
      const bus = busNumber ? String(busNumber).trim().toUpperCase() : null;
      filter.$or = bus ? [{ busNumber: null }, { busNumber: bus }] : [{ busNumber: null }];
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
    const { title, body, type, audience, busNumber, data } = req.body;

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
      data,
    });

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
