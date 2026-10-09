import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Platform,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const API_URL = process.env.EXPO_PUBLIC_API_URL;

/* ---------- Theme ---------- */
const C = {
  brand: "#0056b3",
  brandSoft: "#e7f0ff",
  bg: "#eef2f8",
  card: "#ffffff",
  ink: "#0f1b2d",
  muted: "#64748b",
  line: "#d5dde9",
  success: "#15803d",
  successSoft: "#dcfce7",
  neutral: "#475569",
  neutralSoft: "#e8edf3",
  danger: "#dc3545",
};

interface Receipt {
  _id: string;
  receiptId: string;
  busNumber: string;
  driverNIC: string;
  conductorNIC: string;
  driverD: string;
  conductorD: string;
  isOnline: boolean;
  date: string;
  pickup: string;
  time: string;
  packageId: string;
  description: string;
  packageType: string;
  totalDistance: number;
  tripDuration: string;
  maxPassengers: number;
  maxPrice: number;
  Pid: string;
  Pid1?: string;
  pfirstName: string;
  plastName: string;
  pphoneNumber: string;
  pemail: string;
}

type Filter = "all" | "online" | "offline";

/* ---------- Screen ---------- */
export default function AllReceipts() {
  const router = useRouter();

  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const fetchReceipts = useCallback(async (refresh = false) => {
    if (!API_URL) {
      setError("API URL is not configured.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError("");

      // Adjust this path to match the route that uses getAllReceipts
      const response = await fetch(`${API_URL}/receipts/all`);
      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to load receipts.");
      }

      setReceipts(data.receipts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to fetch receipts.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  const stats = useMemo(() => {
    const online = receipts.filter((r) => r.isOnline).length;
    const value = receipts.reduce((sum, r) => sum + Number(r.maxPrice || 0), 0);
    return {
      total: receipts.length,
      online,
      offline: receipts.length - online,
      value,
    };
  }, [receipts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return receipts.filter((r) => {
      if (filter === "online" && !r.isOnline) return false;
      if (filter === "offline" && r.isOnline) return false;
      if (!q) return true;
      return [
        r.receiptId,
        r.busNumber,
        r.pickup,
        r.packageId,
        r.pfirstName,
        r.plastName,
        r.pemail,
        r.pphoneNumber,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [receipts, query, filter]);

  const header = (
    <View>
      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { flex: 1.25 }]}>
          <Text style={styles.statLabel}>Total value</Text>
          <Text style={styles.statBig} numberOfLines={1} adjustsFontSizeToFit>
            Rs. {stats.value.toLocaleString()}
          </Text>
          <Text style={styles.statHint}>{stats.total} receipts</Text>
        </View>
        <View style={styles.statCol}>
          <View style={[styles.statCard, styles.statSmall]}>
            <Text style={styles.statLabel}>Online</Text>
            <Text style={[styles.statNumber, { color: C.success }]}>
              {stats.online}
            </Text>
          </View>
          <View style={[styles.statCard, styles.statSmall]}>
            <Text style={styles.statLabel}>Offline</Text>
            <Text style={[styles.statNumber, { color: C.neutral }]}>
              {stats.offline}
            </Text>
          </View>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={C.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by receipt, bus, pickup or passenger"
          placeholderTextColor="#94a3b8"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")} hitSlop={10}>
            <Ionicons name="close-circle" size={18} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <View style={styles.chips}>
        {(
          [
            ["all", "All", stats.total],
            ["online", "Online", stats.online],
            ["offline", "Offline", stats.offline],
          ] as [Filter, string, number][]
        ).map(([key, label, count]) => {
          const active = filter === key;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => setFilter(key)}
              activeOpacity={0.8}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {label}
              </Text>
              <View style={[styles.chipCount, active && styles.chipCountActive]}>
                <Text
                  style={[
                    styles.chipCountText,
                    active && { color: C.brand },
                  ]}
                >
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={C.brand} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>All receipts</Text>
          <Text style={styles.headerSubtitle}>Every package and trip record</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.brand} />
          <Text style={styles.infoText}>Loading receipts…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <View style={[styles.stateIcon, { backgroundColor: "#fde8ea" }]}>
            <Ionicons name="cloud-offline-outline" size={36} color={C.danger} />
          </View>
          <Text style={styles.stateTitle}>Couldn't load receipts</Text>
          <Text style={styles.infoText}>{error}</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => fetchReceipts()}
            activeOpacity={0.85}
          >
            <Ionicons name="refresh" size={16} color="#fff" />
            <Text style={styles.primaryButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <ReceiptCard item={item} />}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
          ListHeaderComponent={header}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchReceipts(true)}
              tintColor={C.brand}
              colors={[C.brand]}
            />
          }
          ListEmptyComponent={
            <View style={[styles.center, { paddingTop: 50 }]}>
              <View style={styles.stateIcon}>
                <Ionicons
                  name={receipts.length ? "search-outline" : "receipt-outline"}
                  size={36}
                  color={C.brand}
                />
              </View>
              <Text style={styles.stateTitle}>
                {receipts.length ? "No matches" : "No receipts yet"}
              </Text>
              <Text style={styles.infoText}>
                {receipts.length
                  ? "Try a different search or filter."
                  : "New receipts will appear here."}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

/* ---------- Ticket card ---------- */
function ReceiptCard({ item }: { item: Receipt }) {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((v) => !v);
  };

  const passenger =
    `${item.pfirstName ?? ""} ${item.plastName ?? ""}`.trim() || "N/A";

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.topRow}>
          <View style={styles.busBadge}>
            <Ionicons name="bus" size={14} color={C.brand} />
            <Text style={styles.busBadgeText}>{item.busNumber || "—"}</Text>
          </View>
          <View
            style={[
              styles.status,
              { backgroundColor: item.isOnline ? C.successSoft : C.neutralSoft },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: item.isOnline ? C.success : C.neutral },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: item.isOnline ? C.success : C.neutral },
              ]}
            >
              {item.isOnline ? "Online" : "Offline"}
            </Text>
          </View>
        </View>

        <Text style={styles.fieldLabel}>Pickup</Text>
        <Text style={styles.pickup} numberOfLines={2}>
          {item.pickup || "N/A"}
        </Text>

        <View style={styles.metaRow}>
          <Meta icon="calendar-outline" text={item.date} />
          <Meta icon="time-outline" text={item.time} />
          <Meta
            icon="navigate-outline"
            text={item.totalDistance ? `${item.totalDistance} km` : ""}
          />
        </View>

        <View style={styles.passengerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(passenger[0] || "?").toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.passengerName} numberOfLines={1}>
              {passenger}
            </Text>
            <Text style={styles.passengerEmail} numberOfLines={1}>
              {item.pemail || "No email"}
            </Text>
          </View>
        </View>
      </View>

      {/* Perforation */}
      <View style={styles.perforation}>
        <View style={[styles.notch, styles.notchLeft]} />
        <View style={styles.dashes}>
          {Array.from({ length: 22 }).map((_, i) => (
            <View key={i} style={styles.dash} />
          ))}
        </View>
        <View style={[styles.notch, styles.notchRight]} />
      </View>

      <View style={styles.stub}>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldLabel}>Receipt</Text>
          <Text style={styles.receiptId} numberOfLines={1}>
            {item.receiptId}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.fieldLabel}>Maximum price</Text>
          <Text style={styles.price}>
            Rs. {Number(item.maxPrice || 0).toLocaleString()}
          </Text>
        </View>
      </View>

      {open && (
        <View style={styles.details}>
          <Section title="Package" icon="cube-outline">
            <Detail label="Package ID" value={item.packageId} />
            <Detail label="Type" value={item.packageType} />
            <Detail label="Description" value={item.description} />
            <Detail label="Duration" value={item.tripDuration} />
            <Detail label="Max passengers" value={item.maxPassengers} />
          </Section>

          <Section title="Crew" icon="people-outline">
            <Detail label="Driver" value={item.driverD} />
            <Detail label="Driver NIC" value={item.driverNIC} />
            <Detail label="Conductor" value={item.conductorD} />
            <Detail label="Conductor NIC" value={item.conductorNIC} />
          </Section>

          <Section title="Passenger" icon="person-outline" last>
            <Detail label="Passenger ID" value={item.Pid} />
            <Detail label="Additional ID" value={item.Pid1} />
            <Detail label="Phone" value={item.pphoneNumber} />
            <Detail label="Email" value={item.pemail} />
          </Section>
        </View>
      )}

      <TouchableOpacity
        style={styles.toggle}
        onPress={toggle}
        activeOpacity={0.7}
      >
        <Text style={styles.toggleText}>
          {open ? "Hide details" : "View details"}
        </Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={16}
          color={C.brand}
        />
      </TouchableOpacity>
    </View>
  );
}

/* ---------- Small pieces ---------- */
function Meta({
  icon,
  text,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  text?: string;
}) {
  if (!text) return null;
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={14} color={C.muted} />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

function Section({
  title,
  icon,
  children,
  last,
}: {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <View style={[styles.section, !last && styles.sectionDivider]}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <Ionicons name={icon} size={14} color={C.brand} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  const empty = value === undefined || value === null || value === "";
  return (
    <View style={styles.detailRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, empty && styles.valueEmpty]}>
        {empty ? "N/A" : String(value)}
      </Text>
    </View>
  );
}

/* ---------- Styles ---------- */
const NOTCH = 22;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  header: {
    backgroundColor: C.brand,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: Platform.OS === "android" ? 18 : 10,
    paddingBottom: 26,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.3,
  },
  headerSubtitle: { fontSize: 13, color: "#cfe0ff", marginTop: 2 },

  list: { padding: 16, paddingTop: 18, paddingBottom: 40 },

  /* Stats */
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 14 },
  statCol: { flex: 1, gap: 12 },
  statCard: {
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 16,
    elevation: 2,
    shadowColor: "#0b2a5b",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  statSmall: { flex: 1, justifyContent: "center", paddingVertical: 12 },
  statLabel: { fontSize: 12, color: C.muted, marginBottom: 4 },
  statBig: {
    fontSize: 24,
    fontWeight: "800",
    color: C.brand,
    letterSpacing: -0.4,
  },
  statHint: { fontSize: 12, color: C.muted, marginTop: 4 },
  statNumber: { fontSize: 22, fontWeight: "800" },

  /* Search + filters */
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.line,
  },
  searchInput: { flex: 1, fontSize: 14, color: C.ink, paddingVertical: 0 },
  chips: { flexDirection: "row", gap: 8, marginBottom: 18 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.line,
  },
  chipActive: { backgroundColor: C.brand, borderColor: C.brand },
  chipText: { fontSize: 13, fontWeight: "700", color: C.muted },
  chipTextActive: { color: "#fff" },
  chipCount: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: C.neutralSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  chipCountActive: { backgroundColor: "#fff" },
  chipCountText: { fontSize: 11, fontWeight: "800", color: C.neutral },

  /* Card */
  card: {
    backgroundColor: C.card,
    borderRadius: 20,
    marginBottom: 18,
    elevation: 4,
    shadowColor: "#0b2a5b",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
  },
  cardTop: { padding: 18, paddingBottom: 20 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  busBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.brandSoft,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  busBadgeText: {
    color: C.brand,
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 0.3,
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: "700" },

  fieldLabel: { fontSize: 12, color: C.muted, marginBottom: 3 },
  pickup: {
    fontSize: 22,
    fontWeight: "800",
    color: C.ink,
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 14, marginTop: 14 },
  meta: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontSize: 13, color: C.muted, fontWeight: "500" },

  passengerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#eef2f7",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: C.brand, fontWeight: "800", fontSize: 15 },
  passengerName: { fontSize: 14, fontWeight: "700", color: C.ink },
  passengerEmail: { fontSize: 12, color: C.muted, marginTop: 1 },

  /* Perforation */
  perforation: { height: NOTCH, justifyContent: "center", marginTop: -2 },
  notch: {
    position: "absolute",
    width: NOTCH,
    height: NOTCH,
    borderRadius: NOTCH / 2,
    backgroundColor: C.bg,
    top: 0,
  },
  notchLeft: { left: -NOTCH / 2 },
  notchRight: { right: -NOTCH / 2 },
  dashes: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: NOTCH,
  },
  dash: { width: 7, height: 2, borderRadius: 1, backgroundColor: C.line },

  /* Stub */
  stub: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 16,
  },
  receiptId: { fontSize: 15, fontWeight: "700", color: C.ink },
  price: { fontSize: 20, fontWeight: "800", color: C.brand },

  /* Details */
  details: {
    marginHorizontal: 14,
    marginBottom: 6,
    backgroundColor: "#f7f9fc",
    borderRadius: 16,
    paddingHorizontal: 14,
  },
  section: { paddingVertical: 14 },
  sectionDivider: { borderBottomWidth: 1, borderBottomColor: C.line },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  sectionIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: C.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: C.ink },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    gap: 12,
  },
  label: { flex: 1, color: C.muted, fontSize: 13 },
  value: {
    flex: 1.3,
    textAlign: "right",
    color: C.ink,
    fontSize: 13,
    fontWeight: "600",
  },
  valueEmpty: { color: "#a0aec0", fontWeight: "400" },

  toggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
  },
  toggleText: { color: C.brand, fontWeight: "700", fontSize: 14 },

  /* States */
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 28,
  },
  stateIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.brandSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  stateTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: C.ink,
    marginBottom: 6,
  },
  infoText: {
    color: C.muted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 4,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.brand,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 14,
    marginTop: 22,
  },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
