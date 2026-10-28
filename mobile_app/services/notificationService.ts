import type * as NotificationsModule from "expo-notifications";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Load expo-notifications safely ─────────────────────────────────────
// Expo Go (SDK 53+) no longer ships the native modules expo-notifications needs,
// so importing it there crashes the whole app ("Cannot find native module
// 'ExpoTopicSubscriptionModule'"). Load it only in a development build / APK,
// and fall back to "no system notifications" everywhere else.
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

function loadNotificationsModule(): typeof NotificationsModule | null {
  if (isExpoGo) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("expo-notifications");
  } catch (err) {
    console.warn("expo-notifications is unavailable in this build:", err);
    return null;
  }
}

const Notifications = loadNotificationsModule();

/** False in Expo Go: system-bar notifications need a development build or the APK. */
export const notificationsAvailable = Notifications !== null;

// ─── Configure Global Notification Behavior ─────────────────────────────
// This ensures notifications appear as a heads-up banner / in the notification bar
// even when the app is running in the foreground.
Notifications?.setNotificationHandler({
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
  if (!Notifications) return false;
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
  audience,
}: {
  title: string;
  body: string;
  data?: Record<string, any>;
  channelId?: "default" | "emergency" | "bookings" | "parcels";
  audience?: NotificationAudience;
}): Promise<string | null> {
  try {
    const content: Record<string, any> = { ...data, ...(audience ? { audience } : {}) };
    // In Expo Go there is no system notification, but still keep it in the in-app history.
    const id = Notifications
      ? await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data: content,
            sound: true,
            ...(Platform.OS === "android" ? { channelId } : {}),
          },
          trigger: null, // null delivers immediately
        })
      : `local-${Date.now()}`;
    await addToNotificationHistory({
      id,
      title,
      body,
      type: toHistoryType(content.type),
      audience,
      receivedAt: Date.now(),
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
  if (!Notifications) return null;
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

/** Current permission status, or "unavailable" when running in Expo Go. */
export async function getNotificationPermissionStatus(): Promise<string> {
  if (!Notifications) return "unavailable";
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  } catch {
    return "unavailable";
  }
}

/**
 * Save every received notification to history and handle taps from the status bar.
 * Returns a cleanup function. Does nothing in Expo Go.
 */
export function addNotificationListeners(onTap: (data: Record<string, unknown>) => void): () => void {
  if (!Notifications) return () => {};
  const receivedListener = Notifications.addNotificationReceivedListener((notification) => {
    recordReceivedNotification(notification).catch(() => {});
  });
  const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
    onTap(response.notification.request.content.data ?? {});
  });
  return () => {
    receivedListener.remove();
    responseListener.remove();
  };
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
    audience: "passenger",
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
    audience: "passenger",
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
    audience: "staff",
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
    audience: "passenger",
  });
}

// ─── Notification History ───────────────────────────────────────────────

/** Which side of the app a notification belongs to. */
export type NotificationAudience = "passenger" | "staff";

export type NotificationHistoryType = "ticket" | "emergency" | "parcel" | "general";

export interface NotificationRecord {
  id: string;
  title: string;
  body: string;
  type: NotificationHistoryType;
  /** Undefined for notifications not tied to one side; those show for everyone. */
  audience?: NotificationAudience;
  receivedAt: number;
}

// v2: the previous key also held entries from the removed test screen.
const HISTORY_KEY = "@jetlink_notification_history_v2";
const HISTORY_LIMIT = 50;

const historyListeners = new Set<() => void>();
let writeQueue: Promise<unknown> = Promise.resolve();

function toHistoryType(type: unknown): NotificationHistoryType {
  switch (type) {
    case "ticket":
    case "ticket_booked":
    case "payment_success":
      return "ticket";
    case "parcel":
    case "parcel_update":
      return "parcel";
    case "emergency":
      return "emergency";
    default:
      return "general";
  }
}

async function readHistory(): Promise<NotificationRecord[]> {
  try {
    const saved = await AsyncStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (err) {
    console.warn("Could not read notification history:", err);
    return [];
  }
}

// Serialize writes so two notifications arriving together don't overwrite each other.
function updateHistory(update: (items: NotificationRecord[]) => NotificationRecord[]) {
  writeQueue = writeQueue
    .then(async () => {
      const next = update(await readHistory());
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      historyListeners.forEach((listener) => listener());
    })
    .catch((err) => console.warn("Could not save notification history:", err));
  return writeQueue;
}

/** Notifications for the given side, newest first. */
export async function getNotificationHistory(
  audience?: NotificationAudience
): Promise<NotificationRecord[]> {
  await writeQueue;
  const items = await readHistory();
  return audience ? items.filter((item) => !item.audience || item.audience === audience) : items;
}

export async function addToNotificationHistory(record: NotificationRecord) {
  await updateHistory((items) =>
    items.some((item) => item.id === record.id)
      ? items
      : [record, ...items].slice(0, HISTORY_LIMIT)
  );
}

/** Save a notification delivered by the OS (push, scheduled, or local). */
export async function recordReceivedNotification(notification: NotificationsModule.Notification) {
  const { title, body, data } = notification.request.content;
  if (data?.serverAlert) return;
  await addToNotificationHistory({
    id: notification.request.identifier,
    title: title || "New Notification",
    body: body || "",
    type: toHistoryType(data?.type),
    audience: data?.audience as NotificationAudience | undefined,
    receivedAt: notification.date || Date.now(),
  });
}

/** Removes only the given side's notifications. */
export async function clearNotificationHistory(audience?: NotificationAudience) {
  await updateHistory((items) =>
    audience ? items.filter((item) => item.audience && item.audience !== audience) : []
  );
}

/** Called whenever the stored history changes; returns an unsubscribe function. */
export function subscribeToNotificationHistory(listener: () => void) {
  historyListeners.add(listener);
  return () => {
    historyListeners.delete(listener);
  };
}

// ─── Admin, Bus Staff & Passenger Alerts (stored on the server) ─────────
// Everyone uses different phones, so alerts live in the backend
// (/api/notifications). While someone is signed in, the app checks for new
// alerts every 30 seconds and shows them in the status bar.

export type StaffRole = "admin" | "staff";
/** Every signed-in role that has an Alerts screen. */
export type AlertRole = StaffRole | "passenger";
export type ServerAlertType = "emergency" | "parcel" | "ticket" | "tour" | "general";

export interface ServerAlert {
  _id: string;
  title: string;
  body: string;
  type: ServerAlertType;
  audience: AlertRole[];
  busNumber?: string | null;
  passengerEmail?: string | null;
  data?: Record<string, any>;
  createdAt: string;
}

export interface Session {
  role: AlertRole;
  busNumber?: string;
  /** Passenger's email – used to fetch their own alerts */
  email?: string;
}

const SESSION_KEY = "@jetlink_session";
const lastReadKey = (role: AlertRole) => `@jetlink_alerts_last_read_${role}`;
const LAST_POLLED_KEY = "@jetlink_alerts_last_polled";
const POLL_INTERVAL_MS = 30_000;

const API_URL = process.env.EXPO_PUBLIC_API_URL;

/** Call after login so the app knows whose alerts to fetch. */
export async function saveSession(session: Session) {
  try {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    // Start from "now" so a new login doesn't pop up every old alert
    await AsyncStorage.setItem(LAST_POLLED_KEY, new Date().toISOString());
  } catch (err) {
    console.warn("Could not save session:", err);
  }
}

export async function getSession(): Promise<Session | null> {
  try {
    const saved = await AsyncStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

/** Call on logout so the phone stops receiving staff/admin alerts. */
export async function clearSession() {
  try {
    await AsyncStorage.multiRemove([SESSION_KEY, LAST_POLLED_KEY]);
  } catch {}
}

export async function fetchServerAlerts(
  role: AlertRole,
  busNumber?: string,
  since?: string,
  email?: string
): Promise<ServerAlert[]> {
  const query = new URLSearchParams({ role, limit: "100" });
  if (busNumber) query.append("busNumber", busNumber);
  if (email) query.append("email", email.trim().toLowerCase());
  if (since) query.append("since", since);

  const response = await fetch(`${API_URL}/notifications?${query.toString()}`);
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to load alerts");
  }
  return data.notifications as ServerAlert[];
}

/** Admin → staff announcement (or any manual alert). */
export async function sendServerAlert(alert: {
  title: string;
  body?: string;
  type?: ServerAlertType;
  audience: AlertRole[];
  busNumber?: string;
  passengerEmail?: string;
}) {
  const response = await fetch(`${API_URL}/notifications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(alert),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to send alert");
  }
  return data.notification as ServerAlert;
}

export async function deleteServerAlert(id: string) {
  const response = await fetch(`${API_URL}/notifications/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete alert");
}

export async function getAlertsLastRead(role: AlertRole): Promise<number> {
  try {
    return Number(await AsyncStorage.getItem(lastReadKey(role))) || 0;
  } catch {
    return 0;
  }
}

export async function markAlertsRead(role: AlertRole) {
  try {
    await AsyncStorage.setItem(lastReadKey(role), String(Date.now()));
  } catch {}
  historyListeners.forEach((listener) => listener());
}

/** Number of alerts newer than the last time the Alerts screen was opened. */
export async function getUnreadAlertCount(
  role: AlertRole,
  busNumber?: string,
  email?: string
): Promise<number> {
  try {
    if (role === "passenger" && !email) return 0;
    const lastRead = await getAlertsLastRead(role);
    const alerts = await fetchServerAlerts(role, busNumber, new Date(lastRead).toISOString(), email);
    return alerts.length;
  } catch {
    return 0;
  }
}

function channelFor(type: ServerAlertType): "default" | "emergency" | "bookings" | "parcels" {
  if (type === "emergency") return "emergency";
  if (type === "parcel") return "parcels";
  if (type === "ticket" || type === "tour") return "bookings";
  return "default";
}

let polling = false;

async function pollOnce() {
  const session = await getSession();
  if (!session) return;
  // Passengers need their email to get their own alerts
  if (session.role === "passenger" && !session.email) return;

  const since = (await AsyncStorage.getItem(LAST_POLLED_KEY)) || new Date().toISOString();
  const alerts = await fetchServerAlerts(session.role, session.busNumber, since, session.email);
  if (alerts.length === 0) return;

  // Remember the newest one we've seen
  await AsyncStorage.setItem(LAST_POLLED_KEY, alerts[0].createdAt);
  historyListeners.forEach((listener) => listener());

  if (!Notifications) return; // Expo Go: the Alerts screen still shows them

  // Oldest first, at most 5 at once so the status bar isn't flooded
  for (const alert of alerts.slice(0, 5).reverse()) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: alert.title,
        body: alert.body,
        sound: true,
        // serverAlert: already listed from the server, so don't copy it into local history
        data: { ...(alert.data ?? {}), serverAlert: true, url: `/notifications?role=${session.role}` },
        ...(Platform.OS === "android" ? { channelId: channelFor(alert.type) } : {}),
      },
      trigger: null,
    });
  }
}

/**
 * Passenger screens call this with the email from their params so that
 * passengers who signed in before this update also get their alerts.
 */
export async function ensurePassengerSession(email?: string) {
  const mail = String(email || "").trim().toLowerCase();
  if (!mail) return;
  const session = await getSession();
  if (session?.role === "passenger" && session.email === mail) return;
  if (session && session.role !== "passenger") return; // admin / staff phone
  try {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ role: "passenger", email: mail }));
    if (!(await AsyncStorage.getItem(LAST_POLLED_KEY))) {
      await AsyncStorage.setItem(LAST_POLLED_KEY, new Date().toISOString());
    }
  } catch {}
}

/** Start checking the server for new alerts (admin, staff or passenger). Returns a stop function. */
export function startServerAlertPolling(): () => void {
  const tick = async () => {
    if (polling) return;
    polling = true;
    try {
      await pollOnce();
    } catch {
      // Server unreachable — try again next time
    } finally {
      polling = false;
    }
  };
  tick();
  const timer = setInterval(tick, POLL_INTERVAL_MS);
  return () => clearInterval(timer);
}
