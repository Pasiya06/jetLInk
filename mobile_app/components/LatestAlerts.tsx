// Small "latest alerts" card for a dashboard (used on the bus staff home).
// Shows the newest alerts for this bus: bookings, parcels, tours, scans, emergencies.
import React, { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { C, ui } from "./JetUI";
import {
  AlertRole,
  ServerAlert,
  ServerAlertType,
  fetchServerAlerts,
  getAlertsLastRead,
  getSession,
  subscribeToNotificationHistory,
} from "../services/notificationService";

const TYPE_STYLE: Record<ServerAlertType, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  emergency: { icon: "warning", color: "#DC2626", bg: "#FEE2E2" },
  parcel: { icon: "cube", color: "#D97706", bg: "#FEF3C7" },
  ticket: { icon: "ticket", color: "#059669", bg: "#D1FAE5" },
  tour: { icon: "map", color: "#7C3AED", bg: "#EDE9FE" },
  general: { icon: "megaphone", color: "#0057D9", bg: "#E0E7FF" },
};

function timeAgo(iso: string) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "Yesterday" : `${d} days ago`;
}

export default function LatestAlerts({
  role,
  busNumber,
  title = "Latest for your bus",
  limit = 4,
  onSeeAll,
}: {
  role: AlertRole;
  busNumber?: string;
  title?: string;
  limit?: number;
  onSeeAll?: () => void;
}) {
  const [alerts, setAlerts] = useState<ServerAlert[]>([]);
  const [lastRead, setLastRead] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      const session = await getSession();
      const bus = busNumber || session?.busNumber;
      const email = role === "passenger" ? session?.email : undefined;
      const [list, read] = await Promise.all([
        fetchServerAlerts(role, bus, undefined, email),
        getAlertsLastRead(role),
      ]);
      // Alerts for this bus first; general notices still show if there's room
      const mine = list.filter((a) => !bus || !a.busNumber || a.busNumber === bus.toUpperCase());
      setAlerts(mine.slice(0, limit));
      setLastRead(read);
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [role, busNumber, limit]);

  // Refresh while the dashboard is open
  useFocusEffect(
    useCallback(() => {
      load();
      const timer = setInterval(load, 30_000);
      const unsubscribe = subscribeToNotificationHistory(load);
      return () => {
        clearInterval(timer);
        unsubscribe();
      };
    }, [load])
  );

  const newCount = alerts.filter((a) => new Date(a.createdAt).getTime() > lastRead).length;

  return (
    <View style={[ui.card, s.card]}>
      <View style={s.head}>
        <View style={s.headIcon}>
          <Ionicons name="notifications" size={17} color={C.blue} />
        </View>
        <Text style={s.title}>{title}</Text>
        {newCount > 0 ? (
          <View style={s.newPill}>
            <Text style={s.newPillText}>{newCount} new</Text>
          </View>
        ) : null}
        {onSeeAll ? (
          <TouchableOpacity onPress={onSeeAll} style={s.seeAll} accessibilityLabel="See all alerts">
            <Text style={s.seeAllText}>See all</Text>
            <Ionicons name="chevron-forward" size={15} color={C.blue} />
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <ActivityIndicator color={C.blue} style={{ marginVertical: 16 }} />
      ) : failed ? (
        <TouchableOpacity onPress={load} style={s.empty}>
          <Ionicons name="cloud-offline-outline" size={18} color={C.muted} />
          <Text style={s.emptyText}>Couldn&apos;t load alerts · tap to retry</Text>
        </TouchableOpacity>
      ) : alerts.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="checkmark-circle-outline" size={18} color={C.green} />
          <Text style={s.emptyText}>No alerts yet. New bookings and parcels will show here.</Text>
        </View>
      ) : (
        alerts.map((a, i) => {
          const t = TYPE_STYLE[a.type] ?? TYPE_STYLE.general;
          const isNew = new Date(a.createdAt).getTime() > lastRead;
          return (
            <TouchableOpacity
              key={a._id}
              activeOpacity={0.8}
              onPress={onSeeAll}
              style={[s.row, i < alerts.length - 1 && s.rowDivider]}
            >
              <View style={[s.icon, { backgroundColor: t.bg }]}>
                <Ionicons name={t.icon} size={16} color={t.color} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={s.rowTop}>
                  <Text style={s.rowTitle} numberOfLines={1}>{a.title}</Text>
                  {isNew ? <View style={s.dot} /> : null}
                </View>
                {a.body ? <Text style={s.rowBody} numberOfLines={2}>{a.body}</Text> : null}
                <Text style={s.rowTime}>{timeAgo(a.createdAt)}</Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: { padding: 16 },
  head: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  headIcon: { width: 30, height: 30, borderRadius: 10, backgroundColor: C.blueSoft, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, fontSize: 16, fontWeight: "800", color: C.ink },
  newPill: { backgroundColor: "#EF4444", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  newPillText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
  seeAll: { flexDirection: "row", alignItems: "center", gap: 2, paddingLeft: 6 },
  seeAllText: { color: C.blue, fontSize: 13, fontWeight: "800" },
  row: { flexDirection: "row", gap: 12, paddingVertical: 11 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: C.line },
  icon: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  rowTop: { flexDirection: "row", alignItems: "center", gap: 6 },
  rowTitle: { flex: 1, fontSize: 14, fontWeight: "800", color: C.ink },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#EF4444" },
  rowBody: { fontSize: 12.5, color: C.muted, marginTop: 2, lineHeight: 17 },
  rowTime: { fontSize: 11.5, color: C.chevron, marginTop: 3, fontWeight: "600" },
  empty: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12 },
  emptyText: { flex: 1, fontSize: 13, color: C.muted },
});
