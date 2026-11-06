// hooks/useLiveRefresh.ts
// Keeps a screen's data up to date in (near) real time.
//
//  • Loads once every time the screen comes into focus   -> fn(false)
//  • While the screen is focused AND the app is open, it reloads
//    quietly every `intervalMs`                           -> fn(true)
//  • When the app comes back from the background it reloads at once
//  • Polling stops when you leave the screen or the app goes to the
//    background, so it doesn't waste battery or data.
//
// `fn(silent)` — when silent is true, don't show the loading skeleton
// or error pop-ups; just swap in the new data.

import { useCallback, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useFocusEffect } from "expo-router";

export const LIVE_REFRESH_MS = 10_000;

export function useLiveRefresh(
  fn: (silent: boolean) => unknown | Promise<unknown>,
  intervalMs: number = LIVE_REFRESH_MS
) {
  const fnRef = useRef(fn);
  fnRef.current = fn; // always call the latest version (fresh params/state)

  const busy = useRef(false);
  const focused = useRef(false);

  const run = useCallback(async (silent: boolean) => {
    if (busy.current && silent) return; // skip a tick if the last call is still running
    busy.current = true;
    try {
      await fnRef.current(silent);
    } catch (e) {
      console.log("useLiveRefresh:", e);
    } finally {
      busy.current = false;
    }
  }, []);

  // Focus: load now, then poll while focused
  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      run(false);
      const timer = setInterval(() => {
        if (AppState.currentState === "active") run(true);
      }, intervalMs);
      return () => {
        focused.current = false;
        clearInterval(timer);
      };
    }, [intervalMs, run])
  );

  // App returns to foreground: refresh straight away
  useEffect(() => {
    let prev: AppStateStatus = AppState.currentState;
    const sub = AppState.addEventListener("change", (next) => {
      if (prev.match(/inactive|background/) && next === "active" && focused.current) {
        run(true);
      }
      prev = next;
    });
    return () => sub.remove();
  }, [run]);

  /** Call this after a create/update/delete to refresh immediately. */
  return useCallback(() => run(true), [run]);
}

export default useLiveRefresh;
