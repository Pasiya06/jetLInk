import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import { initNotifications } from "../services/notificationService";

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

    // Listen for notification taps in the phone notification bar
    const responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        console.log("Notification tapped from status bar:", data);
        if (data?.url && typeof data.url === "string") {
          router.push(data.url as any);
        }
      }
    );

    return () => {
      responseListener.remove();
    };
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}

