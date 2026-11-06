import bcrypt from "bcryptjs";

// Passwords are stored as bcrypt hashes. Older accounts may still have a
// plain-text password; they keep working and are upgraded to a hash the
// next time the server starts (see migratePlainPasswords) or they log in.

const ROUNDS = 10;

export const isHashed = (value) =>
  typeof value === "string" && /^\$2[aby]\$\d{2}\$/.test(value) && value.length === 60;

export const hashPassword = async (plain) => bcrypt.hash(String(plain), ROUNDS);

/** true when `plain` matches the stored password (hashed or old plain text) */
export const checkPassword = async (plain, stored) => {
  if (!stored || plain == null) return false;
  if (isHashed(stored)) return bcrypt.compare(String(plain), stored);
  return String(plain) === String(stored); // old plain-text account
};

/**
 * Mongoose plugin: hash the password whenever it is saved or updated,
 * and never send it back in JSON responses.
 */
export const passwordPlugin = (schema) => {
  schema.pre("save", async function () {
    if (this.isModified("password") && this.password && !isHashed(this.password)) {
      this.password = await hashPassword(this.password);
    }
  });

  const hashUpdate = async function () {
    const update = this.getUpdate() || {};
    const target = update.$set && update.$set.password !== undefined ? update.$set : update;
    if (target.password !== undefined) {
      if (!target.password) delete target.password; // empty = keep the old password
      else if (!isHashed(target.password)) target.password = await hashPassword(target.password);
    }
  };
  schema.pre("findOneAndUpdate", hashUpdate);
  schema.pre("updateOne", hashUpdate);
  schema.pre("updateMany", hashUpdate);

  const hide = (_doc, ret) => {
    delete ret.password;
    return ret;
  };
  schema.set("toJSON", { transform: hide });
  schema.set("toObject", { transform: hide });
};

/** Hash every plain-text password still in the database. Safe to run many times. */
export const migratePlainPasswords = async (models) => {
  let total = 0;
  for (const Model of models) {
    const docs = await Model.find({ password: { $not: /^\$2[aby]\$\d{2}\$/ } })
      .select("_id password")
      .lean();
    for (const d of docs) {
      if (!d.password) continue;
      await Model.collection.updateOne(
        { _id: d._id },
        { $set: { password: await hashPassword(d.password) } }
      );
      total++;
    }
  }
  if (total) console.log(`🔐 Secured ${total} old plain-text password(s)`);
  return total;
};
