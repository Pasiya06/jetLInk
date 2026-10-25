// Form validation used by every screen with TextInputs.
// Every field is required; some fields also get a format check.
// Errors are shown under the input and disappear as soon as the user edits that field.
import { useCallback, useState } from "react";

export type RuleType =
  | "text"
  | "email"
  | "phone"     // Sri Lankan mobile: 0771234567
  | "nic"       // 9 digits + V/X, or 12 digits
  | "number"    // number, >= min (default 0)
  | "int"       // whole number, >= min (default 1)
  | "password"  // at least 6 characters
  | "card"      // 16 digits (spaces allowed)
  | "expiry"    // MM/YY
  | "cvc";      // 3 or 4 digits

export type Rule = {
  key: string;
  label: string;
  value: unknown;
  type?: RuleType;
  min?: number;
  equals?: { value: unknown; message: string };
};

const str = (v: unknown) => (v == null ? "" : String(v));

export function checkRule(r: Rule): string | null {
  const v = str(r.value).trim();
  if (!v) return `${r.label} is required`;

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
    case "expiry":
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(v)) return "Use MM/YY";
      break;
    case "cvc":
      if (!/^\d{3,4}$/.test(v)) return "CVC must be 3 or 4 digits";
      break;
  }

  if (r.equals && v !== str(r.equals.value).trim()) return r.equals.message;
  return null;
}

type Stored = { message: string; value: string };

export function useFieldErrors() {
  const [errors, setErrors] = useState<Record<string, Stored>>({});

  // Returns true when every rule passes
  const validate = useCallback((rules: Rule[]) => {
    const next: Record<string, Stored> = {};
    for (const r of rules) {
      const message = checkRule(r);
      if (message && !next[r.key]) next[r.key] = { message, value: str(r.value) };
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }, []);

  // Message for a field, hidden again once the user changes its value
  const errorFor = (key: string, current: unknown) => {
    const e = errors[key];
    return e && e.value === str(current) ? e.message : undefined;
  };

  const clearErrors = useCallback(() => setErrors({}), []);

  return { validate, errorFor, clearErrors };
}
