import jwt from "jsonwebtoken";

// Login tokens for the app. Every login returns one; the app sends it back
// in the "Authorization: Bearer <token>" header on every request.

const SECRET = () => process.env.JWT_SECRET || process.env.QR_SECRET;
const LOGIN_DAYS = 30;

export const signLoginToken = ({ id, role, email, busNumber }) =>
  jwt.sign(
    {
      sub: id ? String(id) : undefined,
      role,
      email: email ? String(email).trim().toLowerCase() : undefined,
      busNumber: busNumber ? String(busNumber).trim().toUpperCase() : undefined,
    },
    SECRET(),
    { expiresIn: `${LOGIN_DAYS}d` }
  );

/** Short-lived token that proves the user just entered a correct OTP for `email`. */
export const signOtpToken = (email) =>
  jwt.sign({ purpose: "otp", email: String(email).trim().toLowerCase() }, SECRET(), { expiresIn: "15m" });

export const readOtpToken = (token) => {
  try {
    const d = jwt.verify(String(token || ""), SECRET());
    return d.purpose === "otp" ? d : null;
  } catch {
    return null;
  }
};

/** Runs on every request: if a valid login token is sent, req.user is set. */
export const readUser = (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    try {
      const d = jwt.verify(token, SECRET());
      if (d.role) req.user = d;
    } catch {
      /* expired or invalid: treated as not logged in */
    }
  }
  next();
};

const deny = (res, status, message) =>
  res.status(status).json({ success: false, code: status === 401 ? "LOGIN_REQUIRED" : "FORBIDDEN", message });

/**
 * Only let these roles through. Admins are always allowed.
 *   router.post("/", requireRole("admin"), addBus)
 *   router.get("/", requireRole(), handler)   // any logged-in user
 */
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return deny(res, 401, "Please log in again.");
  if (req.user.role === "admin" || roles.length === 0 || roles.includes(req.user.role)) return next();
  return deny(res, 403, "You don't have permission to do this.");
};

/**
 * Passengers may only read their own data (by email in the URL).
 * Staff and admins may read anyone's.
 */
export const requireSelfOrStaff = (param) => (req, res, next) => {
  if (!req.user) return deny(res, 401, "Please log in again.");
  if (req.user.role !== "passenger") return next();
  const wanted = String(req.params[param] || "").trim().toLowerCase();
  if (wanted && wanted === req.user.email) return next();
  return deny(res, 403, "You can only see your own bookings.");
};
