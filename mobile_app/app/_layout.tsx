import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { JetAlertHost } from "../components/JetAlert";
import {
  initNotifications,
  addNotificationListeners,
  startServerAlertPolling,
} from "../services/notificationService";

// Prevent splash screen from auto-hiding before initialization
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize notification channels and permissions
        initNotifications().catch((err) =>
          console.warn("Notification init error:", err)
        );
      } catch (e) {
        console.warn("Init error:", e);
      } finally {
        // Dismiss splash screen so the app UI is revealed
        await SplashScreen.hideAsync().catch(() => {});
      }
    }

    prepare();

    // Save every notification the app receives so the Alerts pages can show it,
    // and open the linked screen when a notification in the status bar is tapped
    const removeListeners = addNotificationListeners((data) => {
      console.log("Notification tapped from status bar:", data);
      if (data?.url && typeof data.url === "string") {
        router.push(data.url as any);
      }
    });

    // Admin & bus staff: check the server for new alerts every 30 seconds
    const stopPolling = startServerAlertPolling();

    return () => {
      removeListeners();
      stopPolling();
    };
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      {/* Themed pop-up used by every Alert.alert in the app */}
      <JetAlertHost />
    </>
  );
}

