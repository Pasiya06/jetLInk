import React, { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { JetAlertHost } from "../components/JetAlert";
import SplashVideo from "../components/SplashVideo";
import {
  initNotifications,
  addNotificationListeners,
  startServerAlertPolling,
} from "../services/notificationService";

// Prevent splash screen from auto-hiding before initialization
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const router = useRouter();
  const [showSplashVideo, setShowSplashVideo] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize notification channels and permissions
        initNotifications().catch((err) =>
          console.warn("Notification init error:", err)
        );
      } catch (e) {
        console.warn("Init error:", e);
      }
      // The native splash is hidden by <SplashVideo /> once the video is ready to play
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
      {/* Branded splash video, plays once on app open */}
      {showSplashVideo && (
        <SplashVideo onFinish={() => setShowSplashVideo(false)} />
      )}
      {/* Themed pop-up used by every Alert.alert in the app */}
      <JetAlertHost />
    </>
  );
}

