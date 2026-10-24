import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// ─── Configure Global Notification Behavior ─────────────────────────────
// This ensures notifications appear as a heads-up banner / in the notification bar
// even when the app is running in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Initialize notifications, set up Android channels, and request permissions.
 * Call this in the root component (_layout.tsx) when the app starts.
 */
export async function initNotifications(): Promise<boolean> {
  try {
    // 1. Android Notification Channels (required for Android 8+)
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "JetLink General",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#0057D9",
        sound: "default",
        enableVibrate: true,
        showBadge: true,
      });

      await Notifications.setNotificationChannelAsync("emergency", {
        name: "Emergency Alerts",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 200, 500],
        lightColor: "#FF0000",
        sound: "default",
        enableVibrate: true,
        showBadge: true,
      });

      await Notifications.setNotificationChannelAsync("bookings", {
        name: "Ticket & Trip Updates",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#10B981",
        sound: "default",
        enableVibrate: true,
        showBadge: true,
      });

      await Notifications.setNotificationChannelAsync("parcels", {
        name: "Parcel Tracking Updates",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#F59E0B",
        sound: "default",
        enableVibrate: true,
        showBadge: true,
      });
    }

    // 2. Request runtime permissions (Android 13+ & iOS)
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("⚠️ Notification permission not granted.");
      return false;
    }

    console.log("✅ Notifications initialized & permission granted.");
    return true;
  } catch (err) {
    console.error("❌ Failed to initialize notifications:", err);
    return false;
  }
}

/**
 * Send an immediate notification that appears directly in the phone's notification bar.
 */
export async function sendLocalNotification({
  title,
  body,
  data = {},
  channelId = "default",
}: {
  title: string;
  body: string;
  data?: Record<string, any>;
  channelId?: "default" | "emergency" | "bookings" | "parcels";
}): Promise<string | null> {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        ...(Platform.OS === "android" ? { channelId } : {}),
      },
      trigger: null, // null delivers immediately
    });
    return id;
  } catch (err) {
    console.error("❌ Error sending notification:", err);
    return null;
  }
}

/**
 * Schedule a notification to appear in the notification bar after a delay (in seconds).
 */
export async function scheduleNotification({
  title,
  body,
  seconds = 5,
  data = {},
  channelId = "default",
}: {
  title: string;
  body: string;
  seconds?: number;
  data?: Record<string, any>;
  channelId?: "default" | "emergency" | "bookings" | "parcels";
}): Promise<string | null> {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        ...(Platform.OS === "android" ? { channelId } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(1, seconds),
      },
    });
    return id;
  } catch (err) {
    console.error("❌ Error scheduling notification:", err);
    return null;
  }
}

// ─── Domain Specific Notification Helpers ───────────────────────────────

/**
 * Triggered on successful ticket reservation or payment.
 */
export async function notifyTicketBooked({
  busNumber,
  seatNumber,
  fare,
}: {
  busNumber?: string;
  seatNumber?: string | number;
  fare?: string | number;
}) {
  return sendLocalNotification({
    title: "🎫 Ticket Booking Confirmed!",
    body: `Your ticket for Bus ${busNumber || "trip"} ${
      seatNumber ? `(Seat ${seatNumber})` : ""
    } is confirmed${fare ? `. Fare: LKR ${fare}` : ""}.`,
    channelId: "bookings",
    data: { type: "ticket_booked", busNumber },
  });
}

/**
 * Triggered on successful parcel submission or pickup.
 */
export async function notifyParcelUpdate({
  parcelId,
  status,
}: {
  parcelId?: string;
  status: string;
}) {
  return sendLocalNotification({
    title: "📦 Parcel Status Update",
    body: `Parcel #${parcelId || ""} status: ${status}`,
    channelId: "parcels",
    data: { type: "parcel_update", parcelId, status },
  });
}

/**
 * Triggered when an emergency or breakdown status is activated.
 */
export async function notifyEmergencyAlert({
  busNumber,
  reason,
}: {
  busNumber: string;
  reason: string;
}) {
  return sendLocalNotification({
    title: "🚨 EMERGENCY ALERT!",
    body: `Emergency reported for Bus ${busNumber}: ${reason.toUpperCase()}`,
    channelId: "emergency",
    data: { type: "emergency", busNumber, reason },
  });
}

/**
 * Triggered on successful payment.
 */
export async function notifyPaymentSuccess({
  amount,
  service,
}: {
  amount: string | number;
  service?: string;
}) {
  return sendLocalNotification({
    title: "💳 Payment Successful",
    body: `Payment of LKR ${amount} for ${service || "your booking"} was processed successfully.`,
    channelId: "bookings",
    data: { type: "payment_success", amount },
  });
}
