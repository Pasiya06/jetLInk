import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import {
  StaffRole,
  getSession,
  getUnreadAlertCount,
  subscribeToNotificationHistory,
} from "../services/notificationService";

/** Red unread counter for the Alerts icon in the admin / bus staff bottom bar. */
export default function AlertBadge({ role }: { role: StaffRole }) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    const session = await getSession();
    setCount(await getUnreadAlertCount(role, session?.busNumber));
  }, [role]);

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
