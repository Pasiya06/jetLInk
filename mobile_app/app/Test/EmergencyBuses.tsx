import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Pressable,
  Linking,
  Animated,
  Platform,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const API_URL = process.env.EXPO_PUBLIC_API_URL;

/* ----------------------------- Design tokens ----------------------------- */

const C = {
  ink: "#0B1B3A", // deep navy, ties into the Jetlink blue
  inkSoft: "#B8C4DD",
  paper: "#F2F4F8",
  surface: "#FFFFFF",
  line: "#E4E8F0",
  text: "#0B1B3A",
  muted: "#6B7790",
  alert: "#E5383B",
  alertTint: "#FDECEC",
  amber: "#D97706",
  amberTint: "#FEF3E2",
  ok: "#15803D",
  okTint: "#E3F6EA",
  brand: "#0047AB",
};

type Bus = {
  _id: string;
  busId?: number;
  busNumber: string;
  chassisNo?: string;
  engineNo?: string;
  noOfSeats?: string;
  colour?: string;
  serviceDate?: string;
  licenseDate?: string;
  emissionDate?: string;
  emergency?: boolean;
  status?: "normal" | "accident" | "breakdown";
  busType?: string;
  latitude?: number;
  longitude?: number;
  speed?: number;
  heading?: number;
  isOnline?: boolean;
  driverNIC?: string;
  conductorNIC?: string;
  driverD?: string;
  conductorD?: string;
};

const STATUS_META = {
  accident: {
    label: "Accident",
    color: C.alert,
    tint: C.alertTint,
    icon: "warning" as const,
  },
  breakdown: {
    label: "Breakdown",
    color: C.amber,
    tint: C.amberTint,
    icon: "construct" as const,
  },
  normal: {
    label: "Emergency",
    color: C.alert,
    tint: C.alertTint,
    icon: "alert-circle" as const,
  },
};

/* -------------------------------- Helpers -------------------------------- */

const COMPASS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

const compass = (deg?: number) =>
  deg === undefined || deg === null
    ? "–"
    : COMPASS[Math.round((((deg % 360) + 360) % 360) / 45) % 8];

const isPast = (d?: string) => {
  if (!d) return false;
  const t = Date.parse(d);
  return !Number.isNaN(t) && t < Date.now();
};

const show = (v: string | number | undefined | null) =>
  v === undefined || v === null || v === "" ? "Not available" : String(v);

const openInMaps = (lat?: number, lng?: number) => {
  if (lat === undefined || lng === undefined) return;
  Linking.openURL(
    `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  );
};

/* ------------------------------ Small pieces ------------------------------ */

function LiveDot() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1600,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.8],
  });
  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 0],
  });

  return (
    <View style={styles.liveWrap}>
      <Animated.View
        style={[styles.liveRing, { opacity, transform: [{ scale }] }]}
      />
      <View style={styles.liveCore} />
    </View>
  );
}

function Plate({ value }: { value: string }) {
  return (
    <View style={styles.plate}>
      <View style={styles.plateBand}>
        <Text style={styles.plateBandText}>LK</Text>
      </View>
      <Text style={styles.plateText}>{value}</Text>
    </View>
  );
}

function Row({
  label,
  value,
  flag,
}: {
  label: string;
  value: string | number | undefined | null;
  flag?: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        {flag ? (
          <View style={styles.flag}>
            <Text style={styles.flagText}>{flag}</Text>
          </View>
        ) : null}
        <Text style={styles.rowValue}>{show(value)}</Text>
      </View>
    </View>
  );
}

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={16} color={C.muted} />
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

/* -------------------------------- Bus card -------------------------------- */

function BusCard({ bus }: { bus: Bus }) {
  const [open, setOpen] = useState(false);
  const meta = STATUS_META[bus.status ?? "normal"] ?? STATUS_META.normal;
  const hasLocation =
    bus.latitude !== undefined && bus.longitude !== undefined;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((v) => !v);
  };

  const expired = (d?: string) => (isPast(d) ? "Expired" : undefined);

  return (
    <View style={[styles.card, { borderLeftColor: meta.color }]}>
      {/* Top: plate + status */}
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Plate value={bus.busNumber} />
          <Text style={styles.busType} numberOfLines={1}>
            {bus.busType || "Bus type unavailable"}
            {bus.noOfSeats ? `  •  ${bus.noOfSeats} seats` : ""}
          </Text>
        </View>

        <View style={[styles.chip, { backgroundColor: meta.tint }]}>
          <Ionicons name={meta.icon} size={14} color={meta.color} />
          <Text style={[styles.chipText, { color: meta.color }]}>
            {meta.label}
          </Text>
        </View>
      </View>

      {/* Live strip */}
      <View style={styles.liveStrip}>
        <View style={styles.onlineWrap}>
          <View
            style={[
              styles.onlineDot,
              { backgroundColor: bus.isOnline ? C.ok : C.muted },
            ]}
          />
          <Text
            style={[
              styles.onlineText,
              { color: bus.isOnline ? C.ok : C.muted },
            ]}
          >
            {bus.isOnline ? "Online" : "Offline"}
          </Text>
        </View>

        {/* <Stat
          icon="speedometer-outline"
          label="Speed"
          value={bus.speed === undefined ? "–" : `${bus.speed} km/h`}
        /> */}
        {/* <Stat
          icon="compass-outline"
          label="Heading"
          value={compass(bus.heading)}
        /> */}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          disabled={!hasLocation}
          onPress={() => openInMaps(bus.latitude, bus.longitude)}
          style={({ pressed }) => [
            styles.primaryBtn,
            !hasLocation && { opacity: 0.4 },
            pressed && { opacity: 0.85 },
          ]}
        >
          <Ionicons name="navigate" size={16} color="#fff" />
          <Text style={styles.primaryBtnText}>Locate on map</Text>
        </Pressable>

        <Pressable
          onPress={toggle}
          style={({ pressed }) => [
            styles.ghostBtn,
            pressed && { backgroundColor: C.paper },
          ]}
        >
          <Text style={styles.ghostBtnText}>
            {open ? "Hide details" : "Details"}
          </Text>
          <Ionicons
            name={open ? "chevron-up" : "chevron-down"}
            size={16}
            color={C.brand}
          />
        </Pressable>
      </View>

      {/* Expanded details */}
      {open && (
        <View style={styles.details}>
          <Group title="Vehicle">
            <Row label="Bus ID" value={bus.busId} />
            <Row label="Chassis number" value={bus.chassisNo} />
            <Row label="Engine number" value={bus.engineNo} />
            <Row label="Colour" value={bus.colour} />
          </Group>

          <Group title="Crew">
            <Row label="Driver NIC" value={bus.driverNIC} />
            <Row label="Driver details" value={bus.driverD} />
            <Row label="Conductor NIC" value={bus.conductorNIC} />
            <Row label="Conductor details" value={bus.conductorD} />
          </Group>

          <Group title="Position">
            <Row label="Latitude" value={bus.latitude} />
            <Row label="Longitude" value={bus.longitude} />
          </Group>

          <Group title="Documents">
            <Row
              label="Service date"
              value={bus.serviceDate}
              flag={expired(bus.serviceDate)}
            />
            <Row
              label="License date"
              value={bus.licenseDate}
              flag={expired(bus.licenseDate)}
            />
            <Row
              label="Emission date"
              value={bus.emissionDate}
              flag={expired(bus.emissionDate)}
            />
          </Group>
        </View>
      )}
    </View>
  );
}

/* --------------------------------- Screen --------------------------------- */

export default function EmergencyBuses() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const fetchEmergencyBuses = useCallback(async () => {
    try {
      setError("");

      if (!API_URL) {
        throw new Error("EXPO_PUBLIC_API_URL is not configured.");
      }

      const response = await fetch(`${API_URL}/buses/emergency`);
      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to load emergency buses");
      }

      const emergencyBuses: Bus[] = (data.buses || []).filter(
        (bus: Bus) => bus.emergency === true
      );

      setBuses(emergencyBuses);
      setUpdatedAt(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Refetch whenever the screen is focused (no full-screen spinner after first load)
  useFocusEffect(
    useCallback(() => {
      fetchEmergencyBuses();
    }, [fetchEmergencyBuses])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchEmergencyBuses();
  };

  const retry = () => {
    setLoading(true);
    fetchEmergencyBuses();
  };

  const accidents = buses.filter((b) => b.status === "accident").length;
  const breakdowns = buses.filter((b) => b.status === "breakdown").length;

  const time = updatedAt
    ? updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={C.brand} />
        <Text style={styles.loadingText}>Checking for emergencies…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.ink} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Emergency buses</Text>
          <View style={styles.livePill}>
            <LiveDot />
            <Text style={styles.liveText}>Live</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>
          {time ? `Updated at ${time}. Pull down to refresh.` : "Pull down to refresh."}
        </Text>
      </View>

      {/* Summary overlapping the header */}
      <View style={styles.summary}>
        <View style={styles.summaryCell}>
          <Text style={[styles.summaryNum, { color: C.alert }]}>
            {buses.length}
          </Text>
          <Text style={styles.summaryLabel}>Active</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryCell}>
          <Text style={styles.summaryNum}>{accidents}</Text>
          <Text style={styles.summaryLabel}>Accidents</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryCell}>
          <Text style={styles.summaryNum}>{breakdowns}</Text>
          <Text style={styles.summaryLabel}>Breakdowns</Text>
        </View>
      </View>

      {error !== "" && (
        <View style={styles.errorBox}>
          <Ionicons name="cloud-offline-outline" size={20} color={C.alert} />
          <View style={{ flex: 1 }}>
            <Text style={styles.errorTitle}>Couldn't load buses</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
          <Pressable onPress={retry} hitSlop={10}>
            <Text style={styles.retry}>Retry</Text>
          </Pressable>
        </View>
      )}

      <FlatList
        data={buses}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <BusCard bus={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.brand}
            colors={[C.brand]}
          />
        }
        ListEmptyComponent={
          !error ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="shield-checkmark" size={40} color={C.ok} />
              </View>
              <Text style={styles.emptyTitle}>All buses are clear</Text>
              <Text style={styles.emptyText}>
                No bus has an active emergency. New alerts will appear here
                as soon as they are reported.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

/* --------------------------------- Styles --------------------------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.paper },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: C.paper,
  },
  loadingText: { marginTop: 12, color: C.muted, fontSize: 14 },

  /* Header */
  header: {
    backgroundColor: C.ink,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 16 : 16,
    paddingBottom: 56,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  subtitle: { marginTop: 6, fontSize: 13, color: C.inkSoft },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  liveText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  liveWrap: { width: 10, height: 10, alignItems: "center", justifyContent: "center" },
  liveRing: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.alert,
  },
  liveCore: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.alert },

  /* Summary */
  summary: {
    flexDirection: "row",
    backgroundColor: C.surface,
    marginHorizontal: 16,
    marginTop: -34,
    borderRadius: 18,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: C.ink,
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  summaryCell: { flex: 1, alignItems: "center" },
  summaryNum: { fontSize: 28, fontWeight: "800", color: C.text },
  summaryLabel: { marginTop: 2, fontSize: 12, color: C.muted, fontWeight: "600" },
  summaryDivider: { width: 1, backgroundColor: C.line, marginVertical: 4 },

  /* List + card */
  list: { padding: 16, paddingBottom: 32, flexGrow: 1 },
  card: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderLeftWidth: 5,
    elevation: 2,
    shadowColor: C.ink,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  busType: { marginTop: 8, fontSize: 13, color: C.muted },

  /* Number plate */
  plate: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: C.ink,
    borderRadius: 8,
    overflow: "hidden",
  },
  plateBand: {
    backgroundColor: C.brand,
    paddingHorizontal: 6,
    justifyContent: "center",
  },
  plateBandText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  plateText: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 2,
    color: C.ink,
  },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipText: { fontSize: 12, fontWeight: "700" },

  /* Live strip */
  liveStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: C.paper,
    borderRadius: 14,
  },
  onlineWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  onlineDot: { width: 8, height: 8, borderRadius: 4 },
  onlineText: { fontSize: 13, fontWeight: "700" },
  stat: { flexDirection: "row", alignItems: "center", gap: 8 },
  statValue: { fontSize: 14, fontWeight: "700", color: C.text },
  statLabel: { fontSize: 11, color: C.muted },

  /* Actions */
  actions: { flexDirection: "row", gap: 10, marginTop: 14 },
  primaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.brand,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  ghostBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
  },
  ghostBtnText: { color: C.brand, fontWeight: "700", fontSize: 14 },

  /* Details */
  details: { marginTop: 16, gap: 18 },
  group: {},
  groupTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: C.ink,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.line,
    gap: 12,
  },
  rowLabel: { flex: 1, fontSize: 13, color: C.muted },
  rowRight: {
    flex: 1.2,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
  },
  rowValue: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "600",
    color: C.text,
    textAlign: "right",
  },
  flag: {
    backgroundColor: C.alertTint,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  flagText: { color: C.alert, fontSize: 11, fontWeight: "700" },

  /* Error */
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
    backgroundColor: C.alertTint,
    borderRadius: 14,
  },
  errorTitle: { color: C.alert, fontWeight: "700", fontSize: 14 },
  errorText: { color: C.alert, fontSize: 12, marginTop: 2 },
  retry: { color: C.brand, fontWeight: "800", fontSize: 14 },

  /* Empty */
  empty: { alignItems: "center", paddingHorizontal: 28, paddingTop: 48 },
  emptyIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: C.okTint,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { marginTop: 18, fontSize: 20, fontWeight: "800", color: C.text },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: C.muted,
    textAlign: "center",
  },
});
