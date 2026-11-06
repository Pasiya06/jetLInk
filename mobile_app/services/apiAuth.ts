// services/apiAuth.ts
// Keeps the login token and adds it to every request to our backend.
//
// Every login (passenger, admin, bus staff) gets a token from the server.
// We save it on the phone and attach "Authorization: Bearer <token>" to all
// fetch() calls that go to EXPO_PUBLIC_API_URL, so no screen has to do it.

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const TOKEN_KEY = "@jetlink_token";
const LOGIN_KEY = "@jetlink_last_login";
const API_URL = process.env.EXPO_PUBLIC_API_URL || "";

let token: string | null = null;
let loaded: Promise<void> | null = null;

const loadToken = () => {
  if (!loaded) {
    loaded = AsyncStorage.getItem(TOKEN_KEY)
      .then((t) => {
        // A token saved during this run wins over the stored one
        if (token === null) token = t;
      })
      .catch(() => {});
  }
  return loaded;
};

export async function setAuthToken(next?: string | null) {
  token = next || null;
  try {
    if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
    else await AsyncStorage.removeItem(TOKEN_KEY);
  } catch {}
}

export async function getAuthToken() {
  await loadToken();
  return token;
}

/* ---------- "Stay logged in" ---------- */

export type SavedLogin = {
  role: "passenger" | "admin" | "staff";
  /** Name shown on the start screen, e.g. "Hasara" */
  name: string;
  /** Screen to open, e.g. "/passenger/index1" */
  pathname: string;
  /** The params that screen needs */
  params: Record<string, string>;
};

/** Call after a successful login */
export async function rememberLogin(login: SavedLogin, newToken?: string | null) {
  if (newToken !== undefined) await setAuthToken(newToken);
  try {
    await AsyncStorage.setItem(LOGIN_KEY, JSON.stringify(login));
  } catch {}
}

export async function getSavedLogin(): Promise<SavedLogin | null> {
  try {
    const saved = await AsyncStorage.getItem(LOGIN_KEY);
    if (!saved || !(await getAuthToken())) return null;
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

/** Log out: forget the token and the saved login */
export async function forgetLogin() {
  await setAuthToken(null);
  try {
    await AsyncStorage.removeItem(LOGIN_KEY);
  } catch {}
}

/* ---------- Attach the token to every backend request ---------- */

const urlOf = (input: any): string =>
  typeof input === "string" ? input : input?.url ? String(input.url) : String(input ?? "");

let installed = false;

export function installAuthFetch() {
  if (installed || !API_URL) return;
  installed = true;
  const original = global.fetch.bind(global);

  global.fetch = (async (input: any, init: any = {}) => {
    if (!urlOf(input).startsWith(API_URL)) return original(input, init);

    await loadToken();
    const headers = new Headers(init?.headers || (typeof input === "object" ? input.headers : undefined));
    if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);

    const response = await original(input, { ...init, headers });

    // The server says the login has expired: forget it so the next login starts clean
    if (response.status === 401 && token) {
      response
        .clone()
        .json()
        .then((body) => {
          if (body?.code === "LOGIN_REQUIRED") forgetLogin();
        })
        .catch(() => {});
    }
    return response;
  }) as typeof fetch;

  // A few screens use axios instead of fetch: give them the token too
  axios.interceptors.request.use(async (config) => {
    const url = `${config.baseURL || ""}${config.url || ""}`;
    if (url.startsWith(API_URL)) {
      await loadToken();
      if (token) {
        config.headers = config.headers || {};
        if (!(config.headers as any).Authorization) (config.headers as any).Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });
}
