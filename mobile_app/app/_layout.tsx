import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import { initNotifications } from "../services/notificationService";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    // Initialize notification channels and request permission
    initNotifications();

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

