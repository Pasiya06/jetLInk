// Form validation used by every screen with TextInputs.
//
// How messages appear:
//  • While typing  – once a field has been typed in, it is checked on every change
//                    (e.g. "6 more digits needed", "Enter a valid email address").
//                    Clearing a field you typed in shows "<Field> is required".
//  • On submit     – validate([...rules]) checks every field and shows all problems.
//                    From then on each message updates live as the user fixes it.
//
// Screens keep using the same API: const { validate, errorFor } = useFieldErrors();
import { useCallback, useRef, useState } from "react";

export type RuleType =
  | "text"
  | "email"
  | "phone"     // Sri Lankan mobile: 0771234567
  | "nic"       // 9 digits + V/X, or 12 digits
  | "number"    // number, >= min (default 0)
  | "int"       // whole number, >= min (default 1)
  | "password"  // at least 6 characters
  | "card"      // 16 digits (spaces allowed)
  | "expiry"    // MM/YY, not in the past
  | "cvc"       // 3 or 4 digits
  | "otp";      // 4–6 digits

export type Rule = {
  key: string;
  label: string;
  value: unknown;
  type?: RuleType;
  min?: number;
  equals?: { value: unknown; message: string };
  /** Empty is allowed; only checked when something is entered */
  optional?: boolean;
};

const str = (v: unknown) => (v == null ? "" : String(v));

export function checkRule(r: Rule): string | null {
  const v = str(r.value).trim();
  if (!v) return r.optional ? null : `${r.label} is required`;

  switch (r.type) {
    case "email":
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address";
      break;
    case "phone":
      if (!/^0\d{9}$/.test(v)) return "Enter a 10-digit number starting with 0";
      break;
    case "nic":
      if (!/^(\d{9}[VvXx]|\d{12})$/.test(v)) return "NIC must be 9 digits + V/X, or 12 digits";
      break;
    case "number": {
      const n = Number(v);
      const min = r.min ?? 0;
      if (!Number.isFinite(n)) return `${r.label} must be a number`;
      if (n < min) return `${r.label} must be ${min} or more`;
      break;
    }
    case "int": {
      const n = Number(v);
      const min = r.min ?? 1;
      if (!Number.isInteger(n)) return `${r.label} must be a whole number`;
      if (n < min) return `${r.label} must be ${min} or more`;
      break;
    }
    case "password":
      if (v.length < 6) return "Password must be at least 6 characters";
      break;
    case "card":
      if (!/^\d{16}$/.test(v.replace(/\s/g, ""))) return "Card number must be 16 digits";
      break;
    case "expiry": {
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(v)) return "Use MM/YY";
      const [mm, yy] = v.split("/").map(Number);
      const now = new Date();
      const cy = now.getFullYear() % 100;
      if (yy < cy || (yy === cy && mm < now.getMonth() + 1)) return "This card has expired";
      break;
    }
    case "cvc":
      if (!/^\d{3,4}$/.test(v)) return "CVC must be 3 or 4 digits";
      break;
    case "otp":
      if (!/^\d{4,6}$/.test(v)) return "Enter the code from your email";
      break;
  }

  if (r.equals && v !== str(r.equals.value).trim()) return r.equals.message;
  return null;
}

const plural = (n: number) => `${n} more digit${n === 1 ? "" : "s"} needed`;

// Friendlier "still typing" messages for fields with a fixed length
function liveCheck(r: Rule): string | null {
  const v = str(r.value).trim();
  if (v) {
    if (r.type === "phone") {
      if (/\D/.test(v)) return "Use digits only (e.g. 0771234567)";
      if (!v.startsWith("0")) return "Phone number must start with 0";
      if (v.length < 10) return plural(10 - v.length);
      if (v.length > 10) return "Phone number must be 10 digits";
    }
    if (r.type === "card") {
      const d = v.replace(/\s/g, "");
      if (/\D/.test(d)) return "Use digits only";
      if (d.length < 16) return plural(16 - d.length);
    }
    if (r.type === "nic" && /^\d{10,11}$/.test(v)) {
      return `${plural(12 - v.length)} (new NIC has 12 digits)`;
    }
  }
  return checkRule(r);
}

/*
 * Rules for the field keys used across the app, so a field can be checked while
 * typing, before the user presses submit. After submit the screen's own rules win.
 */
export type Known = { label: string; type?: RuleType; min?: number; equalsKey?: string; message?: string };
const KNOWN: Record<string, Known> = {
  firstName: { label: "First name" },
  lastName: { label: "Last name" },
  address: { label: "Address" },
  email: { label: "Email", type: "email" },
  email1: { label: "Email", type: "email" },
  remail: { label: "Receiver email", type: "email" },
  semail: { label: "Sender email", type: "email" },
  phoneNumber: { label: "Phone number", type: "phone" },
  smobilenumber: { label: "Sender mobile number", type: "phone" },
  rmobilenumber: { label: "Receiver mobile number", type: "phone" },
  NIC: { label: "NIC", type: "nic" },
  DNIC: { label: "Driver NIC", type: "nic" },
  CNIC: { label: "Conductor NIC", type: "nic" },
  password: { label: "Password" },
  password1: { label: "Password" },
  confirmPassword: { label: "Confirm password", equalsKey: "password", message: "Passwords do not match" },
  drivingLicense: { label: "Driving license" },
  busNumber: { label: "Bus number" },
  busNum: { label: "Bus number" },
  busName: { label: "Bus name" },
  chassisNo: { label: "Chassis number" },
  engineNo: { label: "Engine number" },
  colour: { label: "Colour" },
  noOfSeats: { label: "Number of seats", type: "int" },
  ticketPrice: { label: "Ticket price", type: "number", min: 1 },
  stops: { label: "Stops" },
  cardNumber: { label: "Card number", type: "card" },
  nameOnCard: { label: "Name on card" },
  expiry: { label: "Expiry date", type: "expiry" },
  cvc: { label: "CVC", type: "cvc" },
  otp: { label: "Code", type: "otp" },
  km: { label: "Extra kilometers", type: "int" },
  tikNo: { label: "Number of tickets", type: "int" },
  maxPassengers: { label: "Maximum passengers", type: "int" },
  maxPrice: { label: "Price", type: "number", min: 1 },
  extraKmPrice: { label: "Extra km price", type: "number" },
  busFare: { label: "Bus fare", type: "number" },
  weighFare: { label: "Weight fare", type: "number" },
  serviceTax: { label: "Service tax", type: "number" },
  weight: { label: "Weight", type: "number", min: 0.1 },
  sendername: { label: "Sender name" },
  receivername: { label: "Receiver name" },
  title: { label: "Package title" },
  description: { label: "Description" },
  placeName: { label: "Place name" },
  placeDescription: { label: "Description" },
  totalDistance: { label: "Distance" },
  tripDuration: { label: "Duration" },
  packageType: { label: "Package type" },
};

// "phoneNumber" -> "Phone number" for keys that aren't in KNOWN
const labelFromKey = (key: string) => {
  const words = key.replace(/\d+$/, "").replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

export type FieldOptions = {
  /** Keys that may be left empty */
  optional?: string[];
  /** Extra / different rules for this screen, used while typing (before submit) */
  rules?: Record<string, Known>;
};

export function useFieldErrors(options: FieldOptions = {}) {
  const optionalKeys = options.optional ?? [];
  // Changing this re-renders the screen after a submit so messages appear
  const [, setSubmitCount] = useState(0);
  // The screen's own rules, remembered from the last submit
  const submitted = useRef<Record<string, Rule>>({});
  // Fields the user has typed in, and the latest value of every field
  const touched = useRef<Set<string>>(new Set());
  const latest = useRef<Record<string, string>>({});

  // Returns true when every rule passes
  const validate = useCallback((rules: Rule[]) => {
    const remembered: Record<string, Rule> = {};
    let ok = true;
    for (const r of rules) {
      remembered[r.key] = r;
      if (checkRule(r)) ok = false;
    }
    submitted.current = remembered;
    setSubmitCount((n) => n + 1);
    return ok;
  }, []);

  // Message to show under a field right now (undefined = no problem)
  const errorFor = (key: string, current: unknown) => {
    const value = str(current);
    latest.current[key] = value;
    if (value.trim()) touched.current.add(key);

    const fromSubmit = submitted.current[key];
    const known = options.rules?.[key] ?? KNOWN[key];

    // Not typed in and not submitted yet: stay quiet
    if (!fromSubmit && !touched.current.has(key)) return undefined;

    let rule: Rule;
    if (fromSubmit) {
      rule = { ...fromSubmit, value };
      // Compare "confirm password" with the CURRENT password, not the one at submit time
      if (known?.equalsKey && fromSubmit.equals) {
        rule.equals = { ...fromSubmit.equals, value: latest.current[known.equalsKey] ?? fromSubmit.equals.value };
      }
    } else if (known) {
      rule = {
        key,
        label: known.label,
        type: known.type,
        min: known.min,
        value,
        equals: known.equalsKey
          ? { value: latest.current[known.equalsKey] ?? "", message: known.message ?? "Values do not match" }
          : undefined,
      };
    } else {
      rule = { key, label: labelFromKey(key), value };
    }
    if (optionalKeys.includes(key)) rule.optional = true;

    return liveCheck(rule) ?? undefined;
  };

  const clearErrors = useCallback(() => {
    submitted.current = {};
    touched.current.clear();
    setSubmitCount((n) => n + 1);
  }, []);

  return { validate, errorFor, clearErrors };
}
