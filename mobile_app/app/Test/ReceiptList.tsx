import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
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
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
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
  brandDark: "#003b7d",
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

/* ---------- Screen ---------- */
export default function ReceiptList() {
  const router = useRouter();

  const params = useLocalSearchParams<{ pemail?: string | string[] }>();
  const pemail = Array.isArray(params.pemail)
    ? params.pemail[0]
    : params.pemail;

  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchReceipts = useCallback(
    async (refresh = false) => {
      if (!pemail) {
        setError("Passenger email is missing.");
        setLoading(false);
        setRefreshing(false);
        return;
      }

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

        const email = encodeURIComponent(pemail.trim().toLowerCase());
        const response = await fetch(`${API_URL}/receipts/email/${email}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load receipts.");
        }

        setReceipts(data.receipts || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to fetch receipts."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [pemail]
  );

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

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
          <Text style={styles.headerTitle}>My receipts</Text>
          <Text style={styles.headerSubtitle}>
            Your package and trip records
          </Text>
        </View>

        {receipts.length > 0 && (
          <View style={styles.countChip}>
            <Text style={styles.countChipText}>{receipts.length}</Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.brand} />
          <Text style={styles.infoText}>Loading your receipts…</Text>
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
          data={receipts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <ReceiptCard item={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            receipts.length === 0 ? styles.emptyContainer : styles.list
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchReceipts(true)}
              tintColor={C.brand}
              colors={[C.brand]}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <View style={styles.stateIcon}>
                <Ionicons name="receipt-outline" size={36} color={C.brand} />
              </View>
              <Text style={styles.stateTitle}>No receipts yet</Text>
              <Text style={styles.infoText}>
                Receipts for your parcels and trips will show up here.
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => fetchReceipts()}
                activeOpacity={0.85}
              >
                <Ionicons name="refresh" size={16} color="#fff" />
                <Text style={styles.primaryButtonText}>Refresh</Text>
              </TouchableOpacity>
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

  const price = `Rs. ${Number(item.maxPrice || 0).toLocaleString()}`;

  return (
    <View style={styles.card}>
      {/* Top: pickup + status */}
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

      {/* Stub: receipt id + price */}
      <View style={styles.stub}>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldLabel}>Receipt</Text>
          <Text style={styles.receiptId} numberOfLines={1}>
            {item.receiptId}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.fieldLabel}>Maximum price</Text>
          <Text style={styles.price}>{price}</Text>
        </View>
      </View>

      {/* Expandable details */}
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
            <Detail
              label="Name"
              value={`${item.pfirstName ?? ""} ${item.plastName ?? ""}`.trim()}
            />
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

  /* Header */
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
  headerSubtitle: {
    fontSize: 13,
    color: "#cfe0ff",
    marginTop: 2,
  },
  countChip: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  countChipText: { color: C.brand, fontWeight: "800", fontSize: 15 },

  /* List */
  list: { padding: 16, paddingTop: 20, paddingBottom: 40 },
  emptyContainer: { flexGrow: 1, justifyContent: "center", padding: 20 },

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
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 14,
  },
  meta: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontSize: 13, color: C.muted, fontWeight: "500" },

  /* Perforation */
  perforation: {
    height: NOTCH,
    justifyContent: "center",
    marginTop: -2,
  },
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
