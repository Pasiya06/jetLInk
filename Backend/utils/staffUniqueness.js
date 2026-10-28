import Driver from "../models/Driver.js";
import Conductor from "../models/Conductor.js";

/*
 * NIC, email and phone number must be unique across ALL drivers AND conductors.
 * Values are compared in a normalised form, so "nb@Mail.com " = "nb@mail.com",
 * "200012345678" = "200012345678 ", and "0771234567" = "+94 77 123 4567".
 */

export const normNIC = (v) => String(v ?? "").replace(/\s/g, "").toUpperCase();
export const normEmail = (v) => String(v ?? "").trim().toLowerCase();
export const normPhone = (v) => {
  const digits = String(v ?? "").replace(/\D/g, "");
  // Sri Lankan numbers: compare the last 9 digits (07X… / 947X… / +947X…)
  return digits.length >= 9 ? digits.slice(-9) : digits;
};

const FIELDS = [
  { key: "NIC", label: "NIC", norm: normNIC },
  { key: "email", label: "email", norm: normEmail },
  { key: "phoneNumber", label: "phone number", norm: normPhone },
];

/** Clean up the three fields before saving (trim, upper-case NIC, lower-case email). */
export const cleanStaffFields = (body = {}) => {
  const out = { ...body };
  if (out.NIC != null) out.NIC = normNIC(out.NIC);
  if (out.email != null) out.email = normEmail(out.email);
  if (out.phoneNumber != null) out.phoneNumber = String(out.phoneNumber).trim();
  return out;
};

const nameOf = (doc) => `${doc.firstName || ""} ${doc.lastName || ""}`.trim() || "another staff member";

/**
 * Returns null when the values are free, otherwise a message such as
 * "This NIC is already used by conductor Kamal Perera."
 *
 * @param values   { NIC, email, phoneNumber } being saved
 * @param self     { type: "driver" | "conductor", id } – the record being edited (skip it)
 */
export const findStaffConflict = async (values, self = {}) => {
  const [drivers, conductors] = await Promise.all([
    Driver.find().select("firstName lastName NIC email phoneNumber").lean(),
    Conductor.find().select("firstName lastName NIC email phoneNumber").lean(),
  ]);

  const everyone = [
    ...drivers.map((d) => ({ ...d, type: "driver" })),
    ...conductors.map((c) => ({ ...c, type: "conductor" })),
  ].filter((p) => !(self.id && p.type === self.type && String(p._id) === String(self.id)));

  for (const field of FIELDS) {
    const wanted = field.norm(values[field.key]);
    if (!wanted) continue;
    const clash = everyone.find((p) => field.norm(p[field.key]) === wanted);
    if (clash) {
      return {
        field: field.key,
        message: `This ${field.label} is already used by ${clash.type} ${nameOf(clash)}.`,
      };
    }
  }
  return null;
};
