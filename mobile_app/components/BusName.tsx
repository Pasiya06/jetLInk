import { useEffect, useState } from "react";

/**
 * Bus name lookup.
 * Loads every bus once (shared cache) and lets any screen turn a
 * bus number into its name:
 *
 *   const { busName, busLabel } = useBusNames();
 *   busName("NB-1234")   -> "Jetlink Express"   ("" if it has no name)
 *   busLabel("NB-1234")  -> "Jetlink Express (NB-1234)"  or "NB-1234"
 */

type BusInfo = { busName: string; noOfSeats: string };

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const key = (n?: unknown) => String(n ?? "").trim().toUpperCase();

let cache: Map<string, BusInfo> | null = null;
let loadedAt = 0;
const FRESH_MS = 30_000; // re-fetch names at most every 30 seconds
let loading: Promise<Map<string, BusInfo>> | null = null;
const listeners = new Set<() => void>();

export async function loadBusNames(force = false): Promise<Map<string, BusInfo>> {
  if (cache && !force && Date.now() - loadedAt < FRESH_MS) return cache;
  if (loading && !force) return loading;
  loading = (async () => {
    try {
      const res = await fetch(`${API_URL}/buses`);
      const data = await res.json();
      const list: any[] = Array.isArray(data) ? data : data?.data || [];
      const map = new Map<string, BusInfo>();
      for (const b of list) {
        map.set(key(b.busNumber), {
          busName: String(b.busName || ""),
          noOfSeats: String(b.noOfSeats || ""),
        });
      }
      cache = map;
      loadedAt = Date.now();
      listeners.forEach((l) => l());
      return map;
    } catch (e) {
      console.log("Bus names load error:", e);
      return cache || new Map();
    } finally {
      loading = null;
    }
  })();
  return loading;
}

export function getBusName(busNumber?: unknown): string {
  return cache?.get(key(busNumber))?.busName || "";
}

export function getBusSeats(busNumber?: unknown): string {
  return cache?.get(key(busNumber))?.noOfSeats || "";
}

export function getBusLabel(busNumber?: unknown): string {
  const num = String(busNumber ?? "");
  const name = getBusName(num);
  return name ? `${name} (${num})` : num;
}

// "Jetlink Express (NB-1234)" or "Bus NB-1234" when the bus has no name
export function getBusTitle(busNumber?: unknown): string {
  const num = String(busNumber ?? "");
  return getBusName(num) ? getBusLabel(num) : `Bus ${num}`.trim();
}

export function useBusNames() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const l = () => setTick((t) => t + 1);
    listeners.add(l);
    loadBusNames();
    return () => {
      listeners.delete(l);
    };
  }, []);
  return { busName: getBusName, busSeats: getBusSeats, busLabel: getBusLabel, busTitle: getBusTitle };
}
