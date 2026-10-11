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
// Rename these to match your Parcel schema
type ParcelStatus = "Pending" | "PickedUp" | "Delivered";

interface Parcel {
  _id: string;
  parcelId?: string;
  senderName?: string;
  receiverName?: string;
  receiverPhone?: string;
  from?: string;
  to?: string;
  weight?: number;
  status?: ParcelStatus;
  createdAt?: string;
}

type Filter = "All" | ParcelStatus;

// ---------- Status styling ----------
const STATUS_META: Record<
  ParcelStatus,
  { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  Pending: { label: "Pending", color: "#B45309", bg: "#FEF3C7", icon: "time-outline" },
  PickedUp: { label: "Picked up", color: "#4338CA", bg: "#E0E7FF", icon: "bus-outline" },
  Delivered: { label: "Delivered", color: "#047857", bg: "#D1FAE5", icon: "checkmark-circle-outline" },
};

const FILTERS: Filter[] = ["All", "Pending", "PickedUp", "Delivered"];

const formatDate = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

// ---------- Screen ----------
export default function AllParcelsScreen() {
  const router = useRouter();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");

  const load = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/parcel/all`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch parcels");
      }
      setParcels(json.parcels ?? []);
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

  const counts = useMemo(
    () => ({
      Pending: parcels.filter((p) => p.status === "Pending").length,
      PickedUp: parcels.filter((p) => p.status === "PickedUp").length,
      Delivered: parcels.filter((p) => p.status === "Delivered").length,
    }),
    [parcels]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return parcels.filter((p) => {
      if (filter !== "All" && p.status !== filter) return false;
      if (!q) return true;
      return [p.parcelId, p.senderName, p.receiverName, p.from, p.to]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [parcels, query, filter]);

  const renderItem = ({ item }: { item: Parcel }) => {
    const meta = STATUS_META[item.status ?? "Pending"];
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.card}
        onPress={() =>
          router.push({ pathname: "/parcel-details", params: { id: item._id } } as any)
        }
      >
        {/* Top row: id + status pill */}
        <View style={styles.cardTop}>
          <View style={styles.idRow}>
            <View style={styles.iconTile}>
              <MaterialCommunityIcons name="package-variant-closed" size={20} color="#4F46E5" />
            </View>
            <View>
              <Text style={styles.parcelId}>{item.parcelId ?? item._id.slice(-6).toUpperCase()}</Text>
              <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
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

        {/* Footer: sender / receiver / weight */}
        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <Ionicons name="person-outline" size={15} color="#6B7280" />
            <Text style={styles.footerText} numberOfLines={1}>
              {item.senderName ?? "Sender"}
            </Text>
          </View>
          <View style={styles.footerItem}>
            <Ionicons name="location-outline" size={15} color="#6B7280" />
            <Text style={styles.footerText} numberOfLines={1}>
              {item.receiverName ?? "Receiver"}
            </Text>
          </View>
          {item.weight != null && (
            <View style={styles.footerItem}>
              <MaterialCommunityIcons name="weight-kilogram" size={15} color="#6B7280" />
              <Text style={styles.footerText}>{item.weight} kg</Text>
            </View>
          )}
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
          <Text style={styles.headerTitle}>All Parcels</Text>
          <TouchableOpacity onPress={() => load(true)} style={styles.headerBtn}>
            <Ionicons name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Stat label="Total" value={parcels.length} />
          <Stat label="Pending" value={counts.Pending} />
          <Stat label="In transit" value={counts.PickedUp} />
          <Stat label="Delivered" value={counts.Delivered} />
        </View>
      </LinearGradient>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color="#9CA3AF" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by ID, name or location"
          placeholderTextColor="#9CA3AF"
          style={styles.searchInput}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips */}
      <View style={styles.chipsRow}>
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {f === "PickedUp" ? "Picked up" : f}
              </Text>
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
          <Text style={styles.muted}>Loading parcels…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <View style={[styles.bigIcon, { backgroundColor: "#FEE2E2" }]}>
            <Ionicons name="cloud-offline-outline" size={36} color="#DC2626" />
          </View>
          <Text style={styles.stateTitle}>Couldn’t load parcels</Text>
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
                <MaterialCommunityIcons name="package-variant" size={36} color="#4F46E5" />
              </View>
              <Text style={styles.stateTitle}>No parcels found</Text>
              <Text style={styles.muted}>Try a different search or filter.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const Stat = ({ label, value }: { label: string; value: number }) => (
  <View style={styles.stat}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F8" },
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
    alignItems: "center",
  },
  statValue: { color: "#fff", fontSize: 20, fontWeight: "800" },
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
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  idRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  parcelId: { fontSize: 15, fontWeight: "700", color: "#111827" },
  date: { fontSize: 12, color: "#9CA3AF", marginTop: 1 },

  pill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  pillText: { fontSize: 12, fontWeight: "700" },

  routeRow: { flexDirection: "row", alignItems: "center", marginTop: 16, gap: 8 },
  routeStop: { flex: 1 },
  routeLabel: { fontSize: 11, color: "#9CA3AF", marginBottom: 2 },
  routeValue: { fontSize: 14, fontWeight: "600", color: "#1F2937" },
  routeLine: { flex: 1.2, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#C7D2FE" },
  dash: { flex: 1, height: 1.5, backgroundColor: "#C7D2FE", marginHorizontal: 2 },

  footer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  footerItem: { flexDirection: "row", alignItems: "center", gap: 5, maxWidth: "48%" },
  footerText: { fontSize: 12.5, color: "#4B5563" },

  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 8 },
  empty: { alignItems: "center", paddingTop: 48, paddingHorizontal: 32, gap: 8 },
  bigIcon: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  stateTitle: { fontSize: 17, fontWeight: "700", color: "#111827" },
  muted: { fontSize: 13, color: "#6B7280", textAlign: "center" },
  retryBtn: { marginTop: 12, backgroundColor: "#4F46E5", paddingHorizontal: 22, paddingVertical: 11, borderRadius: 12 },
  retryText: { color: "#fff", fontWeight: "700" },
});
