import transporter from "../config/email.js";
import Admin from "../models/Admin.js";
import Bus from "../models/Bus.js";
import Driver from "../models/Driver.js";
import Conductor from "../models/Conductor.js";
import Passenger from "../models/Passenger.js";

/*
 * Every in-app notification is also emailed to the people it is about:
 *
 *   passenger alert for one passenger  → that passenger's email
 *   staff alert for one bus            → the driver + conductor logged in on that bus
 *   admin alert                        → every admin
 *
 * Announcements for EVERY passenger / EVERY bus are only emailed when
 * NOTIFY_EMAIL_BROADCASTS=true (Gmail allows ~500 emails a day).
 *
 * Switches in Backend/.env (all optional):
 *   NOTIFY_EMAIL=false             → no notification emails at all
 *   NOTIFY_EMAIL_ADMINS=false      → don't email admins
 *   NOTIFY_EMAIL_STAFF=false       → don't email bus crews
 *   NOTIFY_EMAIL_PASSENGERS=false  → don't email passengers
 *   NOTIFY_EMAIL_BROADCASTS=true   → also email announcements sent to everyone
 */

const on = (name, fallback) => {
  const v = String(process.env[name] ?? "").trim().toLowerCase();
  if (!v) return fallback;
  return !["false", "0", "no", "off"].includes(v);
};

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
const clean = (list) => [...new Set(list.map((e) => String(e || "").trim().toLowerCase()).filter(isEmail))];

const escapeHtml = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const TYPE = {
  emergency: { label: "Emergency", color: "#B42318", bg: "#FDE2E2" },
  ticket: { label: "Ticket", color: "#0B6B53", bg: "#E3F5EE" },
  parcel: { label: "Parcel", color: "#B26A00", bg: "#FFF4DC" },
  tour: { label: "Tour", color: "#6D3FD6", bg: "#F0EBFE" },
  general: { label: "Notice", color: "#155B8A", bg: "#EAF1FB" },
};

const AUDIENCE_LINE = {
  passenger: "You're receiving this because you booked with JetLink.",
  staff: "You're receiving this because you're on duty on this JetLink bus.",
  admin: "You're receiving this as a JetLink administrator.",
};

/** Branded HTML email for one notification */
export const renderNotificationEmail = (n, audience) => {
  const t = TYPE[n.type] || TYPE.general;
  const when = new Date(n.createdAt || Date.now()).toLocaleString("en-GB", {
    timeZone: "Asia/Colombo",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const bus = n.busNumber ? `<p style="margin:14px 0 0;color:#5B6B7F;font-size:13px">Bus: <b style="color:#0F1B2D">${escapeHtml(n.busNumber)}</b></p>` : "";
  return `<!doctype html>
<html><body style="margin:0;background:#F3F6FA;font-family:Arial,Helvetica,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F6FA;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFFFF;border-radius:18px;overflow:hidden">
        <tr><td style="background:#155B8A;background:linear-gradient(135deg,#173C79,#155B8A,#159B79);padding:22px 24px">
          <div style="color:#FFFFFF;font-size:22px;font-weight:800;letter-spacing:.3px">JetLink</div>
          <div style="color:rgba(255,255,255,.85);font-size:12px;letter-spacing:1px;text-transform:uppercase;margin-top:2px">Notification</div>
        </td></tr>
        <tr><td style="padding:24px">
          <span style="display:inline-block;background:${t.bg};color:${t.color};font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:4px 10px;border-radius:999px">${t.label}</span>
          <h2 style="margin:14px 0 8px;color:#0F1B2D;font-size:19px;line-height:1.35">${escapeHtml(n.title)}</h2>
          <p style="margin:0;color:#334155;font-size:15px;line-height:1.55">${escapeHtml(n.body || "")}</p>
          ${bus}
          <p style="margin:18px 0 0;color:#8A97A8;font-size:12px">${when}</p>
        </td></tr>
        <tr><td style="padding:16px 24px;background:#F7F9FC;border-top:1px solid #EDF1F6;color:#8A97A8;font-size:12px;line-height:1.5">
          ${AUDIENCE_LINE[audience] || ""} Open the JetLink app to see all your alerts.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
};

// ── Who should get an email ───────────────────────────────────────
const crewEmails = async (busNumber) => {
  const bus = await Bus.findOne({ busNumber: String(busNumber).trim().toUpperCase() })
    .select("driverNIC conductorNIC")
    .lean();
  if (!bus) return [];
  const [driver, conductor] = await Promise.all([
    bus.driverNIC ? Driver.findOne({ NIC: bus.driverNIC }).select("email").lean() : null,
    bus.conductorNIC ? Conductor.findOne({ NIC: bus.conductorNIC }).select("email").lean() : null,
  ]);
  return [driver?.email, conductor?.email];
};

const allCrewEmails = async () => {
  const [drivers, conductors] = await Promise.all([
    Driver.find().select("email").lean(),
    Conductor.find().select("email").lean(),
  ]);
  return [...drivers, ...conductors].map((p) => p.email);
};

export const recipientsFor = async (n) => {
  const audience = n.audience || [];
  const broadcasts = on("NOTIFY_EMAIL_BROADCASTS", false);
  const out = { passenger: [], staff: [], admin: [] };

  if (audience.includes("passenger") && on("NOTIFY_EMAIL_PASSENGERS", true)) {
    if (n.passengerEmail) out.passenger = [n.passengerEmail];
    else if (broadcasts) out.passenger = (await Passenger.find().select("email").lean()).map((p) => p.email);
  }

  if (audience.includes("staff") && on("NOTIFY_EMAIL_STAFF", true)) {
    if (n.busNumber) out.staff = await crewEmails(n.busNumber);
    else if (broadcasts) out.staff = await allCrewEmails();
  }

  if (audience.includes("admin") && on("NOTIFY_EMAIL_ADMINS", true)) {
    out.admin = (await Admin.find().select("email").lean()).map((a) => a.email);
  }

  // Each person gets one email, from the most specific group they're in
  const seen = new Set();
  for (const key of ["passenger", "staff", "admin"]) {
    out[key] = clean(out[key]).filter((e) => !seen.has(e) && seen.add(e));
  }
  return out;
};

// Send in small BCC batches so people don't see each other's addresses
const sendTo = async (emails, n, audience) => {
  if (!emails.length) return 0;
  const from = process.env.EMAIL_USER;
  const html = renderNotificationEmail(n, audience);
  const text = `${n.title}\n\n${n.body || ""}${n.busNumber ? `\n\nBus: ${n.busNumber}` : ""}\n\n— JetLink`;
  const subject = `JetLink · ${String(n.title || "Notification").replace(/\s+/g, " ").trim()}`;
  let sent = 0;
  for (let i = 0; i < emails.length; i += 40) {
    const batch = emails.slice(i, i + 40);
    await transporter.sendMail(
      batch.length === 1
        ? { from: `"JetLink" <${from}>`, to: batch[0], subject, text, html }
        : { from: `"JetLink" <${from}>`, to: from, bcc: batch, subject, text, html }
    );
    sent += batch.length;
  }
  return sent;
};

/**
 * Email a saved notification to everyone it concerns. Never throws, so a
 * mail problem can't break a booking. Call without await.
 */
export const emailNotification = async (n) => {
  try {
    if (!n || !on("NOTIFY_EMAIL", true)) return 0;
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return 0;
    const r = await recipientsFor(n);
    const results = await Promise.allSettled([
      sendTo(r.passenger, n, "passenger"),
      sendTo(r.staff, n, "staff"),
      sendTo(r.admin, n, "admin"),
    ]);
    results
      .filter((x) => x.status === "rejected")
      .forEach((x) => console.error("Notification email failed:", x.reason?.message || x.reason));
    return results.reduce((s, x) => s + (x.status === "fulfilled" ? x.value : 0), 0);
  } catch (error) {
    console.error("Notification email error:", error.message);
    return 0;
  }
};
