/*
 * Find (and optionally remove) drivers / conductors that share a NIC, email
 * or phone number with another driver or conductor.
 *
 * Run from the Backend folder:
 *
 *   node scripts/removeDuplicateStaff.js            → only SHOWS the duplicates
 *   node scripts/removeDuplicateStaff.js --delete   → deletes them
 *
 * Rule: records are checked oldest first. A record is kept unless its NIC,
 * email or phone already belongs to an older record that is kept – then it is
 * deleted. Before deleting, every removed record is saved to
 * scripts/deleted-staff-<date>.json so it can be restored if needed.
 */
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Driver from "../models/Driver.js";
import Conductor from "../models/Conductor.js";
import { normNIC, normEmail, normPhone } from "../utils/staffUniqueness.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const createdAt = (doc) => new mongoose.Types.ObjectId(String(doc._id)).getTimestamp();

/**
 * Oldest-first: a record is kept unless its NIC, email or phone is already used
 * by a record that is being kept. Returns [{ keep, remove: [{ person, field, value }] }]
 * grouped by the kept record it clashes with.
 */
export const findDuplicateGroups = (drivers, conductors) => {
  const people = [
    ...drivers.map((d) => ({ ...d, type: "driver" })),
    ...conductors.map((c) => ({ ...c, type: "conductor" })),
  ].sort((a, b) => createdAt(a) - createdAt(b));

  const fields = [
    ["NIC", normNIC],
    ["email", normEmail],
    ["phoneNumber", normPhone],
  ];
  const owner = new Map(); // "field:value" -> kept person
  const groups = new Map(); // kept person -> group

  for (const p of people) {
    let clash = null;
    for (const [field, norm] of fields) {
      const v = norm(p[field]);
      if (v && owner.has(`${field}:${v}`)) {
        clash = { keeper: owner.get(`${field}:${v}`), field, value: v };
        break;
      }
    }
    if (clash) {
      if (!groups.has(clash.keeper)) groups.set(clash.keeper, { keep: clash.keeper, remove: [] });
      groups.get(clash.keeper).remove.push({ person: p, field: clash.field, value: clash.value });
    } else {
      for (const [field, norm] of fields) {
        const v = norm(p[field]);
        if (v) owner.set(`${field}:${v}`, p);
      }
    }
  }
  return [...groups.values()];
};

const label = (p) =>
  `${p.type.padEnd(9)} #${p.type === "driver" ? p.driverId : p.conductorId}  ${p.firstName || ""} ${p.lastName || ""}  | NIC ${p.NIC} | ${p.email} | ${p.phoneNumber}  (added ${createdAt(p).toISOString().slice(0, 10)})`;

// Same renumbering as the controllers: 1, 2, 3… without breaking the unique index
const renumberIds = async (Model, field) => {
  const docs = await Model.find().sort({ [field]: 1, _id: 1 }).select("_id").lean();
  if (!docs.length) return;
  await Model.bulkWrite(docs.map((d, i) => ({ updateOne: { filter: { _id: d._id }, update: { $set: { [field]: -(i + 1) } } } })));
  await Model.bulkWrite(docs.map((d, i) => ({ updateOne: { filter: { _id: d._id }, update: { $set: { [field]: i + 1 } } } })));
};

const main = async () => {
  const doDelete = process.argv.includes("--delete");
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is missing. Run this from the Backend folder (it reads Backend/.env).");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  const [drivers, conductors] = await Promise.all([Driver.find().lean(), Conductor.find().lean()]);
  const groups = findDuplicateGroups(drivers, conductors);

  if (!groups.length) {
    console.log("✅ No duplicates. Every driver and conductor has a unique NIC, email and phone number.");
    await mongoose.disconnect();
    return;
  }

  const toRemove = groups.flatMap((g) => g.remove.map((r) => r.person));
  console.log(`Found ${groups.length} group(s) of duplicates — ${toRemove.length} record(s) to remove.\n`);
  groups.forEach((g, n) => {
    console.log(`Group ${n + 1}`);
    console.log(`  KEEP    ${label(g.keep)}`);
    g.remove.forEach((r) => console.log(`  DELETE  ${label(r.person)}   ← same ${r.field} ${r.value}`));
    console.log("");
  });

  if (!doDelete) {
    console.log("Nothing was deleted. Run again with --delete to remove the records marked DELETE.");
    await mongoose.disconnect();
    return;
  }

  // Backup first
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFile = path.join(__dirname, `deleted-staff-${stamp}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(toRemove, null, 2));
  console.log(`Backup of the deleted records: ${backupFile}`);

  const driverIds = toRemove.filter((p) => p.type === "driver").map((p) => p._id);
  const conductorIds = toRemove.filter((p) => p.type === "conductor").map((p) => p._id);
  const [d, c] = await Promise.all([
    Driver.deleteMany({ _id: { $in: driverIds } }),
    Conductor.deleteMany({ _id: { $in: conductorIds } }),
  ]);
  await renumberIds(Driver, "driverId");
  await renumberIds(Conductor, "conductorId");

  console.log(`🗑️  Deleted ${d.deletedCount} driver(s) and ${c.deletedCount} conductor(s). IDs renumbered.`);
  await mongoose.disconnect();
};

// Run only when called directly (not when imported for tests)
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(async (err) => {
    console.error("❌", err.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
}
