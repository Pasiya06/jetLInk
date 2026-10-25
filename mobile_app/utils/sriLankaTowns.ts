// Main Sri Lankan towns with approximate coordinates.
// Used to work out how far a passenger's pickup town is from a tour destination.

export type Town = { name: string; lat: number; lng: number };

export const SRI_LANKA_TOWNS: Town[] = [
  { name: "Ampara", lat: 7.2975, lng: 81.682 },
  { name: "Anuradhapura", lat: 8.3114, lng: 80.4037 },
  { name: "Arugam Bay", lat: 6.84, lng: 81.836 },
  { name: "Avissawella", lat: 6.9533, lng: 80.21 },
  { name: "Badulla", lat: 6.9934, lng: 81.055 },
  { name: "Bandarawela", lat: 6.8259, lng: 80.9982 },
  { name: "Batticaloa", lat: 7.731, lng: 81.6747 },
  { name: "Bentota", lat: 6.421, lng: 80.0057 },
  { name: "Chilaw", lat: 7.5758, lng: 79.7953 },
  { name: "Colombo", lat: 6.9271, lng: 79.8612 },
  { name: "Dambulla", lat: 7.8742, lng: 80.6511 },
  { name: "Ella", lat: 6.8667, lng: 81.0466 },
  { name: "Embilipitiya", lat: 6.3439, lng: 80.849 },
  { name: "Galle", lat: 6.0535, lng: 80.221 },
  { name: "Gampaha", lat: 7.0917, lng: 79.9997 },
  { name: "Hambantota", lat: 6.1241, lng: 81.1185 },
  { name: "Haputale", lat: 6.7676, lng: 80.958 },
  { name: "Hatton", lat: 6.8916, lng: 80.5955 },
  { name: "Hikkaduwa", lat: 6.1395, lng: 80.1063 },
  { name: "Jaffna", lat: 9.6615, lng: 80.0255 },
  { name: "Kalmunai", lat: 7.4167, lng: 81.8167 },
  { name: "Kalutara", lat: 6.5854, lng: 79.9607 },
  { name: "Kandy", lat: 7.2906, lng: 80.6337 },
  { name: "Kataragama", lat: 6.4134, lng: 81.3346 },
  { name: "Kegalle", lat: 7.2513, lng: 80.3464 },
  { name: "Kilinochchi", lat: 9.3803, lng: 80.377 },
  { name: "Kurunegala", lat: 7.4863, lng: 80.3623 },
  { name: "Mannar", lat: 8.981, lng: 79.9044 },
  { name: "Matale", lat: 7.4675, lng: 80.6234 },
  { name: "Matara", lat: 5.9549, lng: 80.555 },
  { name: "Mirissa", lat: 5.9483, lng: 80.4716 },
  { name: "Monaragala", lat: 6.8728, lng: 81.3507 },
  { name: "Mullaitivu", lat: 9.2671, lng: 80.8142 },
  { name: "Negombo", lat: 7.2083, lng: 79.8358 },
  { name: "Nuwara Eliya", lat: 6.9497, lng: 80.7891 },
  { name: "Panadura", lat: 6.7132, lng: 79.9026 },
  { name: "Point Pedro", lat: 9.8167, lng: 80.2333 },
  { name: "Polonnaruwa", lat: 7.9403, lng: 81.0188 },
  { name: "Puttalam", lat: 8.0362, lng: 79.8283 },
  { name: "Ratnapura", lat: 6.6828, lng: 80.3992 },
  { name: "Sigiriya", lat: 7.957, lng: 80.7603 },
  { name: "Tangalle", lat: 6.0243, lng: 80.7941 },
  { name: "Trincomalee", lat: 8.5874, lng: 81.2152 },
  { name: "Vavuniya", lat: 8.7514, lng: 80.4971 },
];

export const findTown = (name?: string | null): Town | undefined => {
  if (!name) return undefined;
  const n = name.trim().toLowerCase();
  return SRI_LANKA_TOWNS.find((t) => t.name.toLowerCase() === n);
};

// Straight-line distance × 1.35 ≈ road distance on Sri Lankan roads
const ROAD_FACTOR = 1.35;

export const roadDistanceKm = (from?: string | null, to?: string | null): number | null => {
  const a = findTown(from);
  const b = findTown(to);
  if (!a || !b) return null;
  if (a.name === b.name) return 0;

  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  const straight = 2 * R * Math.asin(Math.sqrt(h));
  return Math.round(straight * ROAD_FACTOR);
};

// Does this package suit a passenger picked up in `pickupTown`?
// Unknown towns or a package with no range set are always shown.
export const packageFitsPickup = (
  pkg: { destination?: string; pickupMinKm?: number; pickupMaxKm?: number },
  pickupTown?: string | null
): boolean => {
  if (!pickupTown) return true;
  const min = pkg.pickupMinKm ?? 0;
  const max = pkg.pickupMaxKm ?? 0;
  if (!min && !max) return true;
  const km = roadDistanceKm(pickupTown, pkg.destination);
  if (km == null) return true;
  return km >= min && (max === 0 || km <= max);
};
