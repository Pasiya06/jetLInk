import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  initNotifications,
  sendLocalNotification,
  scheduleNotification,
  notifyTicketBooked,
  notifyEmergencyAlert,
  notifyParcelUpdate,
} from "../services/notificationService";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  type: "ticket" | "emergency" | "parcel" | "general";
}

const STORAGE_KEY = "@jetlink_notifications_history";

export default function NotificationsScreen() {
  const router = useRouter();
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>([]);
  const [scheduledCountdown, setScheduledCountdown] = useState<number | null>(null);

  useEffect(() => {
    checkPermission();
    loadHistory();

    // Listen for new notifications received while this screen is open
    const sub = Notifications.addNotificationReceivedListener((notification) => {
      const { title, body } = notification.request.content;
      const type = (notification.request.content.data?.type as any) || "general";
      addNotificationRecord({
        id: notification.request.identifier,
        title: title || "New Notification",
        body: body || "",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type,
      });
    });

    return () => sub.remove();
  }, []);

  const checkPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionGranted(status === "granted");
  };

  const handleRequestPermission = async () => {
    const granted = await initNotifications();
    setPermissionGranted(granted);
    if (!granted) {
      Alert.alert(
        "Permission Denied",
        "Please enable notifications in your phone's Settings to receive alerts in the status bar."
      );
    } else {
      Alert.alert("Permission Granted", "Notifications are now active for JetLink!");
    }
  };

  const loadHistory = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setNotificationsList(JSON.parse(saved));
      } else {
        // Initial sample items
        setNotificationsList([
          {
            id: "1",
            title: "🎫 Ticket Booking Confirmed",
            body: "Your seat #14 on Bus NC-8921 (Colombo to Kandy) is confirmed.",
            time: "10:30 AM",
            type: "ticket",
          },
          {
            id: "2",
            title: "📦 Parcel In Transit",
            body: "Parcel #JL-4491 is currently onboard Bus WP-4412 heading to Galle.",
            time: "Yesterday",
            type: "parcel",
          },
        ]);
      }
    } catch (e) {
      console.warn("Could not load notification history", e);
    }
  };

  const addNotificationRecord = async (item: NotificationItem) => {
    setNotificationsList((prev) => {
      const updated = [item, ...prev].slice(0, 30);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  // ─── Test Notification Triggers ──────────────────────────────────────────

  const handleSendTestNotification = async () => {
    const notifId = await sendLocalNotification({
      title: "🔔 JetLink Test Notification",
      body: "Your app notification system is working! Check your phone notification bar.",
      channelId: "default",
      data: { type: "general" },
    });

    if (notifId) {
      addNotificationRecord({
        id: notifId,
        title: "🔔 JetLink Test Notification",
        body: "Your app notification system is working! Check your phone notification bar.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: "general",
      });
      Alert.alert("Notification Sent!", "Swipe down your phone's notification bar to view it.");
    }
  };

  const handleSendBookingNotification = async () => {
    const notifId = await notifyTicketBooked({
      busNumber: "ND-5542",
      seatNumber: "12A",
      fare: 1450,
    });

    if (notifId) {
      addNotificationRecord({
        id: notifId,
        title: "🎫 Ticket Booking Confirmed!",
        body: "Your ticket for Bus ND-5542 (Seat 12A) is confirmed. Fare: LKR 1450.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: "ticket",
      });
      Alert.alert("Booking Notification Sent!", "Notification delivered to the status bar.");
    }
  };

  const handleSendEmergencyNotification = async () => {
    const notifId = await notifyEmergencyAlert({
      busNumber: "WP-3211",
      reason: "Breakdown near Kadawatha",
    });

    if (notifId) {
      addNotificationRecord({
        id: notifId,
        title: "🚨 EMERGENCY ALERT!",
        body: "Emergency reported for Bus WP-3211: BREAKDOWN NEAR KADAWATHA",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: "emergency",
      });
      Alert.alert("Emergency Alert Sent!", "High-priority notification sent to the status bar.");
    }
  };

  const handleSendParcelNotification = async () => {
    const notifId = await notifyParcelUpdate({
      parcelId: "JL-9082",
      status: "Ready for Pickup at Matara Station",
    });

    if (notifId) {
      addNotificationRecord({
        id: notifId,
        title: "📦 Parcel Status Update",
        body: "Parcel #JL-9082 status: Ready for Pickup at Matara Station",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: "parcel",
      });
      Alert.alert("Parcel Notification Sent!", "Notification delivered to status bar.");
    }
  };

  const handleScheduleNotification = async () => {
    const seconds = 5;
    setScheduledCountdown(seconds);

    const interval = setInterval(() => {
      setScheduledCountdown((prev) => {
        if (!prev || prev <= 1) {
          clearInterval(interval);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    const id = await scheduleNotification({
      title: "⏰ Scheduled Trip Alert",
      body: "Reminder: Bus ND-5542 departs from Colombo Fort in 15 minutes!",
      seconds,
      channelId: "bookings",
      data: { type: "ticket" },
    });

    if (id) {
      Alert.alert(
        "Scheduled in 5 Seconds!",
        "You can now press your phone's Home button or lock your screen — the notification will appear in the notification bar in 5 seconds!"
      );
    }
  };

  const clearHistory = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setNotificationsList([]);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#173C79" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={["#173C79", "#155B8A", "#159B79"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Notification Center</Text>
              <Text style={styles.headerSubtitle}>System & phone status bar alerts</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {/* Permission Status Banner */}
          <View
            style={[
              styles.permissionCard,
              permissionGranted
                ? styles.permissionCardGranted
                : styles.permissionCardDenied,
            ]}
          >
            <View style={styles.permissionIconWrap}>
              <Ionicons
                name={permissionGranted ? "checkmark-circle" : "alert-circle"}
                size={28}
                color={permissionGranted ? "#10B981" : "#EF4444"}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.permissionTitle}>
                {permissionGranted
                  ? "Notification Bar Enabled"
                  : "Notifications Not Enabled"}
              </Text>
              <Text style={styles.permissionDesc}>
                {permissionGranted
                  ? "JetLink alerts will appear directly in your device's notification bar."
                  : "Allow notification permission so alerts can appear in your phone's notification bar."}
              </Text>
            </View>
            {!permissionGranted && (
              <TouchableOpacity
                style={styles.enableButton}
                onPress={handleRequestPermission}
              >
                <Text style={styles.enableButtonText}>Enable</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Test Trigger Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Test Phone Bar Notifications</Text>
            <Text style={styles.sectionSub}>Tap any button to trigger an alert immediately</Text>
          </View>

          <View style={styles.grid}>
            <TouchableOpacity
              style={[styles.testButton, { borderColor: "#0057D9" }]}
              onPress={handleSendTestNotification}
            >
              <View style={[styles.btnIconCircle, { backgroundColor: "#0057D91A" }]}>
                <Ionicons name="notifications" size={22} color="#0057D9" />
              </View>
              <Text style={styles.btnTitle}>General Alert</Text>
              <Text style={styles.btnDesc}>Instant status bar notification</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.testButton, { borderColor: "#10B981" }]}
              onPress={handleSendBookingNotification}
            >
              <View style={[styles.btnIconCircle, { backgroundColor: "#10B9811A" }]}>
                <Ionicons name="ticket" size={22} color="#10B981" />
              </View>
              <Text style={styles.btnTitle}>Ticket Confirmed</Text>
              <Text style={styles.btnDesc}>Booking & seat confirmation</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.testButton, { borderColor: "#EF4444" }]}
              onPress={handleSendEmergencyNotification}
            >
              <View style={[styles.btnIconCircle, { backgroundColor: "#EF44441A" }]}>
                <MaterialCommunityIcons name="alarm-light" size={22} color="#EF4444" />
              </View>
              <Text style={styles.btnTitle}>Emergency Alert</Text>
              <Text style={styles.btnDesc}>High-priority bus alert</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.testButton, { borderColor: "#F59E0B" }]}
              onPress={handleSendParcelNotification}
            >
              <View style={[styles.btnIconCircle, { backgroundColor: "#F59E0B1A" }]}>
                <FontAwesome5 name="box" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.btnTitle}>Parcel Update</Text>
              <Text style={styles.btnDesc}>Transit & pickup tracking</Text>
            </TouchableOpacity>
          </View>

          {/* Schedule 5-second notification (Test while app in background) */}
          <TouchableOpacity
            style={styles.scheduleCard}
            onPress={handleScheduleNotification}
          >
            <LinearGradient
              colors={["#4F46E5", "#06B6D4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.scheduleGradient}
            >
              <View style={styles.scheduleLeft}>
                <Ionicons name="timer-outline" size={28} color="#ffffff" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.scheduleTitle}>
                    {scheduledCountdown
                      ? `Firing in ${scheduledCountdown}s...`
                      : "Schedule Alert in 5 Seconds"}
                  </Text>
                  <Text style={styles.scheduleDesc}>
                    Press and minimize/lock phone to test background notification
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Recent Notifications List */}
          <View style={[styles.sectionHeader, { marginTop: 24, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
            <View>
              <Text style={styles.sectionTitle}>Notification History</Text>
              <Text style={styles.sectionSub}>Recent alerts delivered to device</Text>
            </View>
            {notificationsList.length > 0 && (
              <TouchableOpacity onPress={clearHistory}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {notificationsList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>No recent notifications</Text>
              <Text style={styles.emptySubText}>
                Notifications triggered will be saved here.
              </Text>
            </View>
          ) : (
            notificationsList.map((item) => (
              <View key={item.id} style={styles.historyCard}>
                <View
                  style={[
                    styles.historyIcon,
                    item.type === "emergency" && { backgroundColor: "#FEE2E2" },
                    item.type === "ticket" && { backgroundColor: "#D1FAE5" },
                    item.type === "parcel" && { backgroundColor: "#FEF3C7" },
                    item.type === "general" && { backgroundColor: "#E0E7FF" },
                  ]}
                >
                  <Ionicons
                    name={
                      item.type === "emergency"
                        ? "warning"
                        : item.type === "ticket"
                        ? "ticket"
                        : item.type === "parcel"
                        ? "cube"
                        : "notifications"
                    }
                    size={20}
                    color={
                      item.type === "emergency"
                        ? "#DC2626"
                        : item.type === "ticket"
                        ? "#059669"
                        : item.type === "parcel"
                        ? "#D97706"
                        : "#4338CA"
                    }
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={styles.historyTitle}>{item.title}</Text>
                    <Text style={styles.historyTime}>{item.time}</Text>
                  </View>
                  <Text style={styles.historyBody}>{item.body}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 40 : 16,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 14,
    padding: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  permissionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  permissionCardGranted: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  permissionCardDenied: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  permissionIconWrap: {
    marginRight: 12,
  },
  permissionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
  permissionDesc: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  enableButton: {
    backgroundColor: "#0057D9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  enableButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },
  sectionSub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  clearText: {
    fontSize: 13,
    color: "#EF4444",
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  testButton: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  btnIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  btnTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },
  btnDesc: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 3,
  },
  scheduleCard: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  scheduleGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  scheduleLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  scheduleDesc: {
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  historyCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  historyIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  historyTime: {
    fontSize: 11,
    color: "#94A3B8",
  },
  historyBody: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
    lineHeight: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
  },
});
