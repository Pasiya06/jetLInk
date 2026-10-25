// Bus staff live-location sharing.
// Runs at app level (not inside one screen), so it keeps sending the bus
// location while staff move between busStaff screens. It only stops on logout.
import * as Location from "expo-location";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const SEND_EVERY_MS = 5000;

export type BusShareInfo = {
  busNumber: string;
  driverNIC?: string;
  conductorNIC?: string;
  driverD?: string;
  conductorD?: string;
};

export type BusShareState = {
  active: boolean;
  busNumber?: string;
  latitude?: number;
  longitude?: number;
  speedKmh?: number;
  updates: number;
  lastSent?: string;
};

let info: BusShareInfo | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let inFlight: Promise<void> | null = null;
let state: BusShareState = { active: false, updates: 0 };
const listeners = new Set<(s: BusShareState) => void>();

const emit = (patch: Partial<BusShareState>) => {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn(state));
};

export const subscribeBusLocation = (fn: (s: BusShareState) => void) => {
  listeners.add(fn);
  fn(state);
  return () => {
    listeners.delete(fn);
  };
};

export const isBusLocationSharing = () => state.active;

const sendOnce = async () => {
  if (!state.active || !info || !API_URL) return;

  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });

  // Logout may have happened while waiting for GPS: don't send a stale point
  if (!state.active || !info) return;

  const { latitude, longitude, speed, heading } = pos.coords;
  const speedKmh = Math.max(0, (speed ?? 0) * 3.6);

  const res = await fetch(`${API_URL}/locations/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      busNumber: info.busNumber,
      latitude,
      longitude,
      speed: speedKmh,
      heading: heading ?? 0,
      driverNIC: info.driverNIC,
      conductorNIC: info.conductorNIC,
      driverD: info.driverD,
      conductorD: info.conductorD,
    }),
  });

  if (res.ok && state.active) {
    emit({
      latitude,
      longitude,
      speedKmh,
      updates: state.updates + 1,
      lastSent: new Date().toLocaleTimeString(),
    });
  }
};

const tick = () => {
  if (inFlight) return; // previous send still running
  inFlight = sendOnce()
    .catch((err) => console.log("Send location error:", err))
    .finally(() => {
      inFlight = null;
    });
};

/**
 * Start sharing (safe to call again: if already sharing it just keeps going).
 * Returns "started", "already" or "denied".
 */
export const startBusLocationSharing = async (
  newInfo: BusShareInfo
): Promise<"started" | "already" | "denied" | "no-bus"> => {
  if (!newInfo.busNumber) return "no-bus";

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") return "denied";

  info = newInfo; // keep latest crew details

  if (state.active && timer) return "already";

  emit({ active: true, busNumber: newInfo.busNumber, updates: 0, lastSent: undefined });
  tick();
  timer = setInterval(tick, SEND_EVERY_MS);
  return "started";
};

/**
 * Stop sharing and clear this bus's location on the server.
 * Used on logout.
 */
export const stopBusLocationSharing = async () => {
  const busNumber = info?.busNumber ?? state.busNumber;

  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  emit({ active: false });

  // Let any send that already started finish, so it can't overwrite the clear
  if (inFlight) await inFlight.catch(() => {});

  info = null;
  emit({
    busNumber: undefined,
    latitude: undefined,
    longitude: undefined,
    speedKmh: undefined,
    updates: 0,
    lastSent: undefined,
  });

  if (!busNumber || !API_URL) return;

  // Clear on the backend (retry a couple of times if the network is flaky)
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${API_URL}/locations/clear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ busNumber }),
      });
      if (res.ok) {
        console.log("✅ Bus location cleared");
        return;
      }
    } catch (err) {
      console.log("Clear location failed:", err);
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
};
