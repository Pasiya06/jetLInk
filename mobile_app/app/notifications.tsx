import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { Alert } from "../components/JetAlert";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  initNotifications,
  getNotificationPermissionStatus,
  notificationsAvailable,
  getNotificationHistory,
  clearNotificationHistory,
  subscribeToNotificationHistory,
  NotificationAudience,
  NotificationRecord,
} from "../services/notificationService";
import StaffAlertsScreen from "../components/StaffAlertsScreen";

function formatTime(timestamp: number) {
  const date = new Date(timestamp);
  const now = new Date();
  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (date.toDateString() === now.toDateString()) return time;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;
  return `${date.toLocaleDateString()}, ${time}`;
}

export default function NotificationsScreen() {
  const { role, busNumber, busNo } = useLocalSearchParams<{
    role?: string;
    busNumber?: string;
    busNo?: string;
  }>();

  // Admin and bus staff alerts come from the server
  if (role === "admin" || role === "staff") {
    return <StaffAlertsScreen role={role} busNumber={busNumber || busNo || undefined} />;
  }
  return <PassengerNotifications role={role} />;
}

function PassengerNotifications({ role }: { role?: string }) {
  const router = useRouter();
  const audience: NotificationAudience = role === "staff" ? "staff" : "passenger";
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [notificationsList, setNotificationsList] = useState<NotificationRecord[]>([]);

  useEffect(() => {
    const loadHistory = () => {
      getNotificationHistory(audience).then(setNotificationsList);
    };

    checkPermission();
    loadHistory();

    // Refresh when a new notification is saved while this screen is open
    return subscribeToNotificationHistory(loadHistory);
  }, [audience]);

  const checkPermission = async () => {
    const status = await getNotificationPermissionStatus();
    setPermissionGranted(status === "granted");
  };

  const handleRequestPermission = async () => {
    if (!notificationsAvailable) {
      Alert.alert(
        "Not available in Expo Go",
        "Status-bar notifications need the JetLink APK or a development build. Alerts will still appear in this list."
      );
      return;
    }
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

  const clearHistory = async () => {
    await clearNotificationHistory(audience);
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
              <Text style={styles.headerSubtitle}>
                {audience === "staff" ? "Bus staff alerts" : "Passenger alerts"}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {/* Permission Status Banner */}


          {/* Recent Notifications List */}
          <View style={[styles.sectionHeader, { marginTop: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
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
                Alerts you receive will appear here.
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
                    <Text style={styles.historyTime}>{formatTime(item.receivedAt)}</Text>
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
