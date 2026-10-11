import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// ---------- Config ----------
// Android emulator can't reach "localhost" -> use 10.0.2.2
const HOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// ---------- Types ----------
// Rename these to match your Ticket schema
type TicketStatus = "valid" | "used" | "cancelled";

interface Ticket {
  _id: string;
  ticketId?: string;
  passengerName?: string;
  busNumber?: string;
  from?: string;
  to?: string;
  seatNumber?: number | string;
  price?: number;
  travelDate?: string;
  status?: TicketStatus;
  createdAt?: string;
}

type Filter = "all" | TicketStatus;

// ---------- Status styling ----------
const STATUS_META: Record<
  TicketStatus,
  { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  valid: { label: "Valid", color: "#047857", bg: "#D1FAE5", icon: "checkmark-circle-outline" },
  used: { label: "Used", color: "#4338CA", bg: "#E0E7FF", icon: "scan-outline" },
  cancelled: { label: "Cancelled", color: "#B91C1C", bg: "#FEE2E2", icon: "close-circle-outline" },
};

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "valid", label: "Valid" },
  { key: "used", label: "Used" },
  { key: "cancelled", label: "Cancelled" },
];

const formatDate = (iso?: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const formatPrice = (n?: number) => (n == null ? "—" : `Rs. ${n.toLocaleString("en-LK")}`);

// ---------- Screen ----------
export default function AllTicketsScreen() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const load = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/tickets`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch tickets");
      }
      setTickets(json.tickets ?? []);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const revenue = tickets
      .filter((t) => t.status !== "cancelled")
      .reduce((sum, t) => sum + (t.price ?? 0), 0);
    return {
      total: tickets.length,
      valid: tickets.filter((t) => (t.status ?? "valid") === "valid").length,
      used: tickets.filter((t) => t.status === "used").length,
      revenue,
    };
  }, [tickets]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets.filter((t) => {
      if (filter !== "all" && (t.status ?? "valid") !== filter) return false;
      if (!q) return true;
      return [t.ticketId, t.passengerName, t.busNumber, t.from, t.to]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [tickets, query, filter]);

  const renderItem = ({ item }: { item: Ticket }) => {
    const meta = STATUS_META[item.status ?? "valid"];
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.card}
        onPress={() =>
          router.push({ pathname: "/ticket-details", params: { id: item._id } } as any)
        }
      >
        {/* Top: bus + status */}
        <View style={styles.cardTop}>
          <View style={styles.idRow}>
            <View style={styles.iconTile}>
              <MaterialCommunityIcons name="bus" size={20} color="#4F46E5" />
            </View>
            <View>
              <Text style={styles.busNumber}>{item.busNumber ?? "Bus"}</Text>
              <Text style={styles.ticketId}>#{item.ticketId ?? item._id.slice(-6).toUpperCase()}</Text>
            </View>
          </View>
          <View style={[styles.pill, { backgroundColor: meta.bg }]}>
            <Ionicons name={meta.icon} size={13} color={meta.color} />
            <Text style={[styles.pillText, { color: meta.color }]}>{meta.label}</Text>
          </View>
        </View>

        {/* Route */}
        <View style={styles.routeRow}>
          <View style={styles.routeStop}>
            <Text style={styles.routeLabel}>From</Text>
            <Text style={styles.routeValue} numberOfLines={1}>
              {item.from ?? "—"}
            </Text>
          </View>
          <View style={styles.routeLine}>
            <View style={styles.dot} />
            <View style={styles.dash} />
            <Ionicons name="arrow-forward-circle" size={22} color="#6366F1" />
            <View style={styles.dash} />
            <View style={styles.dot} />
          </View>
          <View style={[styles.routeStop, { alignItems: "flex-end" }]}>
            <Text style={styles.routeLabel}>To</Text>
            <Text style={styles.routeValue} numberOfLines={1}>
              {item.to ?? "—"}
            </Text>
          </View>
        </View>

        {/* Perforated divider with notches */}
        <View style={styles.perfRow}>
          <View style={[styles.notch, styles.notchLeft]} />
          <View style={styles.perfLine} />
          <View style={[styles.notch, styles.notchRight]} />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerCol}>
            <Text style={styles.routeLabel}>Passenger</Text>
            <Text style={styles.footerValue} numberOfLines={1}>
              {item.passengerName ?? "—"}
            </Text>
          </View>
          <View style={styles.footerColSmall}>
            <Text style={styles.routeLabel}>Seat</Text>
            <Text style={styles.footerValue}>{item.seatNumber ?? "—"}</Text>
          </View>
          <View style={styles.footerColSmall}>
            <Text style={styles.routeLabel}>Date</Text>
            <Text style={styles.footerValue}>{formatDate(item.travelDate ?? item.createdAt)}</Text>
          </View>
          <View style={[styles.footerColSmall, { alignItems: "flex-end" }]}>
            <Text style={styles.routeLabel}>Fare</Text>
            <Text style={styles.price}>{formatPrice(item.price)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const Header = (
    <>
      <LinearGradient colors={["#4F46E5", "#7C3AED"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Tickets</Text>
          <TouchableOpacity onPress={() => load(true)} style={styles.headerBtn}>
            <Ionicons name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <Stat label="Total" value={String(stats.total)} />
          <Stat label="Valid" value={String(stats.valid)} />
          <Stat label="Used" value={String(stats.used)} />
          <Stat label="Revenue" value={`Rs. ${Math.round(stats.revenue / 1000)}k`} />
        </View>
      </LinearGradient>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color="#9CA3AF" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by ID, passenger, bus or route"
          placeholderTextColor="#9CA3AF"
          style={styles.searchInput}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.chipsRow}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.muted}>Loading tickets…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <View style={[styles.bigIcon, { backgroundColor: "#FEE2E2" }]}>
            <Ionicons name="cloud-offline-outline" size={36} color="#DC2626" />
          </View>
          <Text style={styles.stateTitle}>Couldn’t load tickets</Text>
          <Text style={styles.muted}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => load()}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListHeaderComponent={Header}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#4F46E5" />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={[styles.bigIcon, { backgroundColor: "#E0E7FF" }]}>
                <MaterialCommunityIcons name="ticket-confirmation-outline" size={36} color="#4F46E5" />
              </View>
              <Text style={styles.stateTitle}>No tickets found</Text>
              <Text style={styles.muted}>Try a different search or filter.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const Stat = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.stat}>
    <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
      {value}
    </Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ---------- Styles ----------
const BG = "#F3F4F8";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  listContent: { paddingBottom: 32 },

  header: {
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) + 8 : 56,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },

  statsRow: { flexDirection: "row", marginTop: 20, gap: 10 },
  stat: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  statValue: { color: "#fff", fontSize: 19, fontWeight: "800" },
  statLabel: { color: "rgba(255,255,255,0.85)", fontSize: 11, marginTop: 2 },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    gap: 8,
    elevation: 4,
    shadowColor: "#4F46E5",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  searchInput: { flex: 1, fontSize: 14, color: "#111827" },

  chipsRow: { flexDirection: "row", paddingHorizontal: 16, marginTop: 14, marginBottom: 6, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipActive: { backgroundColor: "#4F46E5", borderColor: "#4F46E5" },
  chipText: { fontSize: 13, color: "#4B5563", fontWeight: "600" },
  chipTextActive: { color: "#fff" },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 18,
    paddingTop: 16,
    paddingBottom: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  idRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  busNumber: { fontSize: 15, fontWeight: "700", color: "#111827" },
  ticketId: { fontSize: 12, color: "#9CA3AF", marginTop: 1 },

  pill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  pillText: { fontSize: 12, fontWeight: "700" },

  routeRow: { flexDirection: "row", alignItems: "center", marginTop: 16, gap: 8, paddingHorizontal: 16 },
  routeStop: { flex: 1 },
  routeLabel: { fontSize: 11, color: "#9CA3AF", marginBottom: 2 },
  routeValue: { fontSize: 14, fontWeight: "600", color: "#1F2937" },
  routeLine: { flex: 1.2, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#C7D2FE" },
  dash: { flex: 1, height: 1.5, backgroundColor: "#C7D2FE", marginHorizontal: 2 },

  // Ticket perforation: notches share the screen background colour
  perfRow: { flexDirection: "row", alignItems: "center", marginVertical: 14, height: 16 },
  perfLine: {
    flex: 1,
    height: 0,
    borderTopWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#E5E7EB",
    marginHorizontal: 4,
  },
  notch: { width: 16, height: 16, borderRadius: 8, backgroundColor: BG },
  notchLeft: { marginLeft: -8 },
  notchRight: { marginRight: -8 },

  footer: { flexDirection: "row", paddingHorizontal: 16, gap: 10 },
  footerCol: { flex: 1.4 },
  footerColSmall: { flex: 1 },
  footerValue: { fontSize: 13, fontWeight: "600", color: "#374151" },
  price: { fontSize: 14, fontWeight: "800", color: "#4F46E5" },

  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 8 },
  empty: { alignItems: "center", paddingTop: 48, paddingHorizontal: 32, gap: 8 },
  bigIcon: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  stateTitle: { fontSize: 17, fontWeight: "700", color: "#111827" },
  muted: { fontSize: 13, color: "#6B7280", textAlign: "center" },
  retryBtn: { marginTop: 12, backgroundColor: "#4F46E5", paddingHorizontal: 22, paddingVertical: 11, borderRadius: 12 },
  retryText: { color: "#fff", fontWeight: "700" },
});
