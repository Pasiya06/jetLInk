// utils/placeGeocode.ts
// Turns place names from bus schedules ("COLOMBO", "NUWARAELIYA", "KADAWATHA")
// into map coordinates.
//
//  1. Built-in list of Sri Lankan towns (instant, works offline)
//  2. Otherwise OpenStreetMap's free place search (Nominatim), one request per
//     second as their rules ask, and the answer is saved on the phone so each
//     place is only looked up once.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { SRI_LANKA_TOWNS } from "./sriLankaTowns";

export type Place = { name: string; lat: number; lng: number };

/** "Nuwara Eliya", "NUWARAELIYA", "nuwara-eliya" -> "nuwaraeliya" */
export const placeKey = (name?: string | null) =>
  String(name ?? "").toLowerCase().replace(/[^a-z]/g, "");

// Extra towns that buses often stop at (not in the tour list)
const EXTRA_TOWNS: Place[] = [
  { name: "Colombo Fort", lat: 6.9344, lng: 79.8428 },
  { name: "Pettah", lat: 6.936, lng: 79.85 },
  { name: "Maharagama", lat: 6.848, lng: 79.926 },
  { name: "Nugegoda", lat: 6.8721, lng: 79.889 },
  { name: "Dehiwala", lat: 6.851, lng: 79.865 },
  { name: "Mount Lavinia", lat: 6.838, lng: 79.863 },
  { name: "Moratuwa", lat: 6.773, lng: 79.882 },
  { name: "Kottawa", lat: 6.841, lng: 79.964 },
  { name: "Makumbura", lat: 6.842, lng: 79.976 },
  { name: "Homagama", lat: 6.844, lng: 80.002 },
  { name: "Kaduwela", lat: 6.936, lng: 79.984 },
  { name: "Kelaniya", lat: 6.955, lng: 79.922 },
  { name: "Kiribathgoda", lat: 6.98, lng: 79.929 },
  { name: "Kadawatha", lat: 7.001, lng: 79.953 },
  { name: "Wattala", lat: 6.99, lng: 79.892 },
  { name: "Ja-Ela", lat: 7.075, lng: 79.891 },
  { name: "Katunayake", lat: 7.169, lng: 79.888 },
  { name: "Horana", lat: 6.716, lng: 80.062 },
  { name: "Beruwala", lat: 6.479, lng: 79.983 },
  { name: "Aluthgama", lat: 6.434, lng: 80.0 },
  { name: "Ambalangoda", lat: 6.235, lng: 80.054 },
  { name: "Weligama", lat: 5.975, lng: 80.429 },
  { name: "Tissamaharama", lat: 6.279, lng: 81.287 },
  { name: "Wellawaya", lat: 6.737, lng: 81.103 },
  { name: "Balangoda", lat: 6.647, lng: 80.698 },
  { name: "Pelmadulla", lat: 6.623, lng: 80.542 },
  { name: "Peradeniya", lat: 7.269, lng: 80.594 },
  { name: "Gampola", lat: 7.164, lng: 80.577 },
  { name: "Nawalapitiya", lat: 7.054, lng: 80.533 },
  { name: "Mahiyanganaya", lat: 7.322, lng: 81.002 },
  { name: "Kuliyapitiya", lat: 7.469, lng: 80.04 },
  { name: "Wennappuwa", lat: 7.349, lng: 79.851 },
  { name: "Marawila", lat: 7.41, lng: 79.832 },
  { name: "Kekirawa", lat: 8.038, lng: 80.598 },
  { name: "Habarana", lat: 8.037, lng: 80.749 },
  { name: "Medawachchiya", lat: 8.539, lng: 80.494 },
];

const BUILT_IN = new Map<string, Place>();
[...SRI_LANKA_TOWNS, ...EXTRA_TOWNS].forEach((t) => BUILT_IN.set(placeKey(t.name), t));
// Common short names
BUILT_IN.set("fort", BUILT_IN.get("colombofort")!);
BUILT_IN.set("cmb", BUILT_IN.get("colombo")!);

const CACHE_PREFIX = "@jetlink_place_";
const memory = new Map<string, Place | null>();

// Nominatim allows about one request per second: queue lookups
let queue: Promise<unknown> = Promise.resolve();
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const searchOnline = (name: string): Promise<Place | null> => {
  const job = queue.then(async () => {
    try {
      const url =
        "https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=lk&q=" +
        encodeURIComponent(`${name}, Sri Lanka`);
      const res = await fetch(url, {
        headers: { "User-Agent": "JetLink-Mobile/1.0 (university project)", "Accept-Language": "en" },
      });
      if (!res.ok) return null;
      const list = await res.json();
      const hit = Array.isArray(list) ? list[0] : null;
      if (!hit) return null;
      return { name, lat: Number(hit.lat), lng: Number(hit.lon) };
    } catch {
      return null;
    } finally {
      await wait(1100);
    }
  });
  queue = job.catch(() => {});
  return job;
};

/** Coordinates for a place name, or null if it can't be found */
export async function findPlace(rawName?: string | null): Promise<Place | null> {
  const name = String(rawName ?? "").trim();
  const key = placeKey(name);
  if (!key) return null;

  const builtIn = BUILT_IN.get(key);
  if (builtIn) return { ...builtIn, name };

  if (memory.has(key)) {
    const m = memory.get(key);
    return m ? { ...m, name } : null;
  }

  try {
    const saved = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (saved) {
      const p = JSON.parse(saved) as Place;
      memory.set(key, p);
      return { ...p, name };
    }
  } catch {}

  const found = await searchOnline(name);
  memory.set(key, found); // also remember "not found" for this app run
  if (found) {
    try {
      await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(found));
    } catch {}
  }
  return found;
}

/** "KADAWATHA, KEGALLE; Mawanella" -> ["KADAWATHA", "KEGALLE", "Mawanella"] */
export function splitStops(stops?: string | null): string[] {
  return String(stops ?? "")
    .split(/,|;|\||\n|->|→|>/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Readable place name: "NUWARAELIYA" -> "Nuwara Eliya" when it's a known town */
export function displayName(rawName?: string | null): string {
  const name = String(rawName ?? "").trim();
  const known = BUILT_IN.get(placeKey(name));
  if (known) return known.name;
  return name
    .toLowerCase()
    .replace(/\b[a-z]/g, (c) => c.toUpperCase());
}
