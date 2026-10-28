import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Alert } from "./JetAlert";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { getBusLabel, useBusNames } from "./BusName";
import {
  AlertRole,
  ServerAlert,
  ServerAlertType,
  deleteServerAlert,
  fetchServerAlerts,
  getAlertsLastRead,
  getSession,
  markAlertsRead,
  sendServerAlert,
  subscribeToNotificationHistory,
} from "../services/notificationService";

type Filter = "all" | ServerAlertType;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "emergency", label: "Emergency" },
  { key: "parcel", label: "Parcels" },
  { key: "ticket", label: "Tickets" },
  { key: "tour", label: "Tours" },
  { key: "general", label: "Notices" },
];

const TYPE_STYLE: Record<
  ServerAlertType,
  { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }
> = {
  emergency: { icon: "warning", color: "#DC2626", bg: "#FEE2E2" },
  parcel: { icon: "cube", color: "#D97706", bg: "#FEF3C7" },
  ticket: { icon: "ticket", color: "#059669", bg: "#D1FAE5" },
  tour: { icon: "map", color: "#7C3AED", bg: "#EDE9FE" },
  general: { icon: "megaphone", color: "#0057D9", bg: "#E0E7FF" },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min} min ago`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString();
}

export default function StaffAlertsScreen({
  role,
  busNumber: busNumberParam,
}: {
  role: AlertRole;
  busNumber?: string;
}) {
  const router = useRouter();
  const isAdmin = role === "admin";
  const isPassenger = role === "passenger";
  useBusNames(); // show bus names on the alert cards

  const [busNumber, setBusNumber] = useState(busNumberParam ?? "");
  // Staff without a bus number in the link: wait until the saved bus is read
  const [busReady, setBusReady] = useState(role !== "staff" || !!busNumberParam);
  const [email, setEmail] = useState<string | null>(isPassenger ? null : "");
  const [alerts, setAlerts] = useState<ServerAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [lastRead, setLastRead] = useState(0);

  // Announcement form (admin only)
  const [composeOpen, setComposeOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [toAdmins, setToAdmins] = useState(false);
  const [sendTo, setSendTo] = useState<"staff" | "passenger" | "all">("staff");
  const [targetBus, setTargetBus] = useState("");
  const [sending, setSending] = useState(false);

  // Staff: fall back to the bus number saved at login
  useEffect(() => {
    if (role === "staff" && !busNumberParam) {
      getSession().then((s) => {
        if (s?.busNumber) setBusNumber(s.busNumber);
        setBusReady(true);
      });
    }
  }, [role, busNumberParam]);

  // Passenger: their email is saved at login
  useEffect(() => {
    if (isPassenger) getSession().then((s) => setEmail(s?.email || ""));
  }, [isPassenger]);

  const load = useCallback(async () => {
    if (isPassenger && email === null) return; // still reading the session
    if (!busReady) return; // still reading the saved bus number
    try {
      const list = await fetchServerAlerts(role, busNumber || undefined, undefined, email || undefined);
      setAlerts(list);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Could not reach the server");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [role, busNumber, email, isPassenger, busReady]);

  useEffect(() => {
    // Remember what was unread when the screen opened, then mark all as read
    getAlertsLastRead(role).then((value) => {
      setLastRead(value);
      markAlertsRead(role);
    });
  }, [role]);

  useEffect(() => {
    load();
    const timer = setInterval(load, 30_000);
    const unsubscribe = subscribeToNotificationHistory(load);
    return () => {
      clearInterval(timer);
      unsubscribe();
    };
  }, [load]);

  const visible = useMemo(
    () => (filter === "all" ? alerts : alerts.filter((a) => a.type === filter)),
    [alerts, filter]
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: alerts.length };
    alerts.forEach((a) => (c[a.type] = (c[a.type] ?? 0) + 1));
    return c;
  }, [alerts]);

  const emergencyCount = alerts.filter(
    (a) => a.type === "emergency" && a.data?.status !== "normal" &&
      Date.now() - new Date(a.createdAt).getTime() < 24 * 3600 * 1000
  ).length;

  const openAlert = (alert: ServerAlert) => {
    const url = alert.data?.url;
    if (isAdmin && typeof url === "string" && url.startsWith("/admin")) {
      router.push(url as any);
    }
  };

  const confirmDelete = (alert: ServerAlert) => {
    if (!isAdmin) return;
    Alert.alert("Delete alert?", alert.title, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteServerAlert(alert._id);
            setAlerts((prev) => prev.filter((a) => a._id !== alert._id));
          } catch {
            Alert.alert("Error", "Could not delete this alert.");
          }
        },
      },
    ]);
  };

  const sendAnnouncement = async () => {
    if (!title.trim()) {
      Alert.alert("Title required", "Please enter a title for the announcement.");
      return;
    }
    setSending(true);
    try {
      await sendServerAlert({
        title: `📢 ${title.trim()}`,
        body: message.trim(),
        type: "general",
        audience: [
          ...(sendTo === "passenger" ? [] : (["staff"] as const)),
          ...(sendTo === "staff" ? [] : (["passenger"] as const)),
          ...(toAdmins ? (["admin"] as const) : []),
        ],
        busNumber: sendTo === "staff" ? targetBus.trim() || undefined : undefined,
      });
      setComposeOpen(false);
      setTitle("");
      setMessage("");
      setTargetBus("");
      setToAdmins(false);
      load();
      Alert.alert(
        "Sent",
        sendTo === "staff"
          ? "Bus staff will see this announcement in their Alerts."
          : sendTo === "passenger"
          ? "Passengers will see this announcement in their Alerts."
          : "Bus staff and passengers will see this announcement in their Alerts."
      );
      setSendTo("staff");
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Could not send the announcement.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#173C79" />
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={["#173C79", "#155B8A", "#159B79"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>
                {isAdmin ? "Admin Alerts" : isPassenger ? "My Alerts" : "Bus Staff Alerts"}
              </Text>
              <Text style={styles.headerSub}>
                {isAdmin
                  ? "Emergencies, bookings and parcels across all buses"
                  : isPassenger
                  ? "Your tickets, parcels, tours and JetLink news"
                  : busNumber
                  ? `Alerts for ${getBusLabel(busNumber)}`
                  : "Alerts for your bus"}
              </Text>
            </View>
            {isAdmin && (
              <TouchableOpacity onPress={() => setComposeOpen(true)} style={styles.iconBtn}>
                <Ionicons name="megaphone-outline" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{alerts.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>
                {alerts.filter((a) => new Date(a.createdAt).getTime() > lastRead).length}
              </Text>
              <Text style={styles.statLabel}>New</Text>
            </View>
            <View style={[styles.statBox, emergencyCount > 0 && styles.statBoxAlert]}>
              <Text style={styles.statNum}>{emergencyCount}</Text>
              <Text style={styles.statLabel}>Emergencies (24h)</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterBar}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {f.label}
                  {counts[f.key] ? ` · ${counts[f.key]}` : ""}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              colors={["#0057D9"]}
            />
          }
        >
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#0057D9" />
              <Text style={styles.muted}>Loading alerts…</Text>
            </View>
          ) : error ? (
            <View style={styles.center}>
              <Ionicons name="cloud-offline-outline" size={48} color="#EF4444" />
              <Text style={styles.emptyTitle}>Can&apos;t load alerts</Text>
              <Text style={styles.muted}>{error}</Text>
              <TouchableOpacity onPress={load} style={styles.retryBtn}>
                <Text style={styles.retryText}>Try again</Text>
              </TouchableOpacity>
            </View>
          ) : visible.length === 0 ? (
            <View style={styles.center}>
              <Ionicons name="notifications-off-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No alerts</Text>
              <Text style={styles.muted}>New alerts will appear here automatically.</Text>
            </View>
          ) : (
            visible.map((alert) => {
              const s = TYPE_STYLE[alert.type] ?? TYPE_STYLE.general;
              const isNew = new Date(alert.createdAt).getTime() > lastRead;
              return (
                <TouchableOpacity
                  key={alert._id}
                  activeOpacity={0.8}
                  // onPress={() => openAlert(alert)}
                  onLongPress={() => confirmDelete(alert)}
                  style={[
                    styles.card,
                    alert.type === "emergency" && styles.cardEmergency,
                    isNew && styles.cardNew,
                  ]}
                >
                  <View style={[styles.cardIcon, { backgroundColor: s.bg }]}>
                    <Ionicons name={s.icon} size={20} color={s.color} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={styles.cardTop}>
                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {alert.title}
                      </Text>
                      {isNew && <View style={styles.newDot} />}
                    </View>
                    {!!alert.body && <Text style={styles.cardBody}>{alert.body}</Text>}
                    <View style={styles.cardMeta}>
                      <Text style={styles.cardTime}>{timeAgo(alert.createdAt)}</Text>
                      {alert.busNumber ? (
                        <View style={styles.busTag}>
                          <Ionicons name="bus-outline" size={11} color="#155B8A" />
                          <Text style={styles.busTagText}>{getBusLabel(alert.busNumber)}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
          {isAdmin && visible.length > 0 && (
            <Text style={styles.hint}>Tip: long-press an alert to delete it.</Text>
          )}
        </ScrollView>

        {/* Admin announcement form */}
        <Modal visible={composeOpen} animationType="slide" transparent onRequestClose={() => setComposeOpen(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalBackdrop}
          >
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Send announcement</Text>
              <Text style={styles.muted}>Choose who should see this in their Alerts.</Text>

              <Text style={styles.inputLabel}>Send to</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {([
                  ["staff", "Bus staff"],
                  ["passenger", "Passengers"],
                  ["all", "Everyone"],
                ] as const).map(([key, label]) => {
                  const active = sendTo === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      onPress={() => setSendTo(key)}
                      style={[styles.chip, active && styles.chipActive, { flex: 1, alignItems: "center" }]}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Route change on Galle Road"
                placeholderTextColor="#94A3B8"
                maxLength={80}
              />

              <Text style={styles.inputLabel}>Message</Text>
              <TextInput
                style={[styles.input, { height: 90, textAlignVertical: "top" }]}
                value={message}
                onChangeText={setMessage}
                placeholder="Details for the announcement"
                placeholderTextColor="#94A3B8"
                multiline
                maxLength={400}
              />

              {sendTo === "staff" && (
                <>
                  <Text style={styles.inputLabel}>Only for bus (optional)</Text>
                  <TextInput
                    style={styles.input}
                    value={targetBus}
                    onChangeText={(t) => setTargetBus(t.toUpperCase())}
                    placeholder="Leave empty for all buses"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="characters"
                  />
                </>
              )}

              <TouchableOpacity style={styles.toggleRow} onPress={() => setToAdmins((v) => !v)}>
                <Ionicons
                  name={toAdmins ? "checkbox" : "square-outline"}
                  size={22}
                  color={toAdmins ? "#0057D9" : "#94A3B8"}
                />
                <Text style={styles.toggleText}>Also show to admins</Text>
              </TouchableOpacity>

              <View style={styles.sheetActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setComposeOpen(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1 }} onPress={sendAnnouncement} disabled={sending}>
                  <LinearGradient
                    colors={["#0057D9", "#159B79"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.sendBtn}
                  >
                    {sending ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="send" size={16} color="#fff" />
                        <Text style={styles.sendText}>Send</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F6FB" },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 40 : 16,
    paddingBottom: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },
  headerSub: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 18 },
  statBox: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
  },
  statBoxAlert: { backgroundColor: "rgba(220,38,38,0.55)" },
  statNum: { color: "#fff", fontSize: 20, fontWeight: "800" },
  statLabel: { color: "rgba(255,255,255,0.85)", fontSize: 11, marginTop: 2 },

  filterBar: { flexGrow: 0, marginTop: 14, marginBottom: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  chipActive: { backgroundColor: "#0057D9", borderColor: "#0057D9" },
  chipText: { fontSize: 13, fontWeight: "600", color: "#475569" },
  chipTextActive: { color: "#fff" },

  list: { padding: 16, paddingBottom: 40 },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#173C79",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardEmergency: { borderLeftWidth: 4, borderLeftColor: "#DC2626" },
  cardNew: { backgroundColor: "#F5F9FF", borderColor: "#BFD6FB" },
  cardIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  cardTitle: { flex: 1, fontSize: 14, fontWeight: "700", color: "#1E293B" },
  newDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#0057D9", marginTop: 4 },
  cardBody: { fontSize: 13, color: "#64748B", marginTop: 4, lineHeight: 18 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  cardTime: { fontSize: 11, color: "#94A3B8" },
  busTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#E6F0F7",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  busTagText: { fontSize: 11, color: "#155B8A", fontWeight: "700" },
  hint: { textAlign: "center", fontSize: 11, color: "#94A3B8", marginTop: 6 },

  center: { alignItems: "center", paddingVertical: 50, paddingHorizontal: 30 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#475569", marginTop: 10 },
  muted: { fontSize: 13, color: "#94A3B8", marginTop: 4, textAlign: "center" },
  retryBtn: {
    marginTop: 14,
    backgroundColor: "#0057D9",
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
  },
  retryText: { color: "#fff", fontWeight: "700" },

  modalBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15,23,42,0.45)" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#E2E8F0",
    marginBottom: 14,
  },
  sheetTitle: { fontSize: 18, fontWeight: "800", color: "#1E293B" },
  inputLabel: { fontSize: 12, fontWeight: "700", color: "#475569", marginTop: 14, marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1E293B",
  },
  toggleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14 },
  toggleText: { fontSize: 14, color: "#334155", fontWeight: "600" },
  sheetActions: { flexDirection: "row", gap: 10, marginTop: 20 },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: { fontWeight: "700", color: "#475569" },
  sendBtn: {
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  sendText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
