import Counter from "../models/Counter.js";

// Safe running numbers (1, 2, 3...) for IDs like TKT000012.
// Uses one atomic counter per name, so two bookings at the same moment can
// never get the same number. The first time a counter is used it starts
// after the highest number already in the database.

const seeded = new Set();

/**
 * @param name      counter name, e.g. "ticket"
 * @param currentMax async () => highest number already used (only called once)
 */
export const nextNumber = async (name, currentMax) => {
  if (!seeded.has(name)) {
    const max = Number(await currentMax()) || 0;
    await Counter.updateOne({ _id: name }, { $max: { seq: max } }, { upsert: true });
    seeded.add(name);
  }
  const counter = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};

/** Highest number in a numeric field, e.g. maxOf(Bus, "busId") */
export const maxOf = (Model, field) => async () => {
  const doc = await Model.findOne({ [field]: { $type: "number" } }).sort({ [field]: -1 }).select(field).lean();
  return doc ? doc[field] : 0;
};

/** Highest number inside a prefixed string ID, e.g. maxOfPrefixed(Ticket, "ticketId", "TKT") */
export const maxOfPrefixed = (Model, field, prefix) => async () => {
  const docs = await Model.find({ [field]: { $regex: `^${prefix}\\d+$` } }).select(field).lean();
  return docs.reduce((m, d) => Math.max(m, parseInt(String(d[field]).slice(prefix.length), 10) || 0), 0);
};
