import Bus from "../models/Bus.js";

// Accident / breakdown helpers so bookings can't use a bus that is out of service.

const key = (busNumber) => String(busNumber || "").trim().toUpperCase();

// Map of BUS NUMBER -> { status, emergencyAt } for every bus with an active emergency
export const getEmergencyBusMap = async () => {
  const buses = await Bus.find({
    $or: [{ emergency: true }, { status: { $in: ["accident", "breakdown"] } }],
  }).select("busNumber status emergencyAt");

  const map = new Map();
  for (const b of buses) {
    map.set(key(b.busNumber), {
      status: b.status === "accident" ? "accident" : "breakdown",
      emergencyAt: b.emergencyAt,
    });
  }
  return map;
};

// null when the bus can be booked, otherwise a message explaining why not
export const getBusBlockReason = async (busNumber) => {
  if (!busNumber) return null;
  const map = await getEmergencyBusMap();
  const problem = map.get(key(busNumber));
  if (!problem) return null;
  return problem.status === "accident"
    ? `Bus ${busNumber} had an accident and can't be booked right now. Please choose another bus.`
    : `Bus ${busNumber} broke down and can't be booked right now. Please choose another bus.`;
};

export const busKey = key;
