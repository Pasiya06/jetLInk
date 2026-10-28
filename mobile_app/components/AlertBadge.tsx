import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  AlertRole,
  ensurePassengerSession,
  getSession,
  getUnreadAlertCount,
  subscribeToNotificationHistory,
} from "../services/notificationService";

/** Red unread counter for the Alerts icon in the admin / bus staff / passenger bottom bar. */
export default function AlertBadge({ role }: { role: AlertRole }) {
  const [count, setCount] = useState(0);
  const { pemail } = useLocalSearchParams<{ pemail?: string }>();

  const refresh = useCallback(async () => {
    if (role === "passenger") await ensurePassengerSession(pemail);
    const session = await getSession();
    const email = role === "passenger" ? session?.email || pemail : undefined;
    setCount(await getUnreadAlertCount(role, session?.busNumber, email));
  }, [role, pemail]);

  // Only check while this screen is visible
  useFocusEffect(
    useCallback(() => {
      refresh();
      const timer = setInterval(refresh, 30_000);
      const unsubscribe = subscribeToNotificationHistory(refresh);
      return () => {
        clearInterval(timer);
        unsubscribe();
      };
    }, [refresh])
  );

  if (count <= 0) return null;

  return (
    <View style={styles.badge} pointerEvents="none">
      <Text style={styles.text}>{count > 99 ? "99+" : count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -5,
    right: -9,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: "#EF4444",
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  text: { color: "#fff", fontSize: 10, fontWeight: "800" },
});
