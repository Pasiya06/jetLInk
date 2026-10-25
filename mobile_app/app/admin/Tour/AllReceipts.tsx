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
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, FontAwesome, Feather } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import AlertBadge from "../../../components/AlertBadge";

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
  const params = useLocalSearchParams();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [activeTab, setActiveTab] = useState('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  

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

  

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={C.brand} />

      {/* Header */}
      <LinearGradient
        colors={["#173C79","#155B8A","#159B79",]}
        start={{x: 0, y: 0,}}
        end={{x: 1, y: 1,}}
        style={styles.submitGradient1}>
        <View style={styles.header}>
          <TouchableOpacity>
            <Text style={styles.title}>
              Tour Receipt
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

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
          <Text style={styles.stateTitle}>Couldn&apos;t load receipts</Text>
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
      {isSearching ? (
        <TextInput
          style={styles.searchBarInput}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus={true}
        />
      ) : null}
      
      <View style={styles.bottomNav}>

        <TouchableOpacity 
          style={styles.item} 
          onPress={() => { 
            setActiveTab("home"); 
            if (isSearching) {
              setIsSearching(false); 
            }

            else {
              router.push({
                pathname: "/admin/Tour/Tour",
                params: {
                  Aid: params.Aid,
                  firstName: params.firstName,
                  lastName: params.lastName,
                  email: params.email,
                },                    
              });
            };
          }}
        >
          <Ionicons name={isSearching ? "arrow-back" : "arrow-back-outline"} size={24} color={activeTab === "home" ? "#0057D9" : "#8A8A8A"}/>
          <Text style={[styles.label1,activeTab === "home" && styles.activeLabel,]}>
            Back
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("routes"); setIsSearching(!isSearching); }}>
          <FontAwesome name={isSearching ? "close" : "search"} size={24} color={activeTab  === "routes" ? "#0057D9" : "#8A8A8A"}/>
          <Text style={[ styles.label1,activeTab === "routes" && styles.activeLabel,]}>
            Routes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.centerButton} 
          onPress={() => {
            setActiveTab("tickets"); 
            router.push({
              pathname: "/admin/index1",
              params: {
                Aid: params.Aid,
                firstName: params.firstName,
                lastName: params.lastName,
                email: params.email,
              },                    
            });
          }} 
        > 
          <Ionicons name="home-outline" size={28} color="#fff" />             
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("alerts"); router.push({ pathname: "/notifications", params: { role: "admin" } }); }}>
          <View><Ionicons name="notifications-outline" size={24} color={activeTab === "alerts" ? "#0057D9" : "#8A8A8A"}/><AlertBadge role="admin" /></View>
          <Text style={[styles.label1,activeTab === "alerts" && styles.activeLabel, ]}>
            Alerts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={() => {setActiveTab("profile"); router.push({
                      pathname: "/admin/Profile/adminProfile",
                      params: {
                        Aid: params.Aid,
                        firstName: params.firstName,
                        lastName: params.lastName,
                        email: params.email,
                      },
                    });}}>
                    <Feather name="user" size={24} color={activeTab === "profile" ? "#0057D9" : "#8A8A8A"}/>
                    <Text style={[styles.label1, activeTab === "profile" && styles.activeLabel,]}>
                      Profile
                    </Text>
                  </TouchableOpacity>
      </View>  

      
      <View style={styles.footerGraphic}>
        <LinearGradient
          colors={["#173C79","#155B8A","#159B79",]}
          start={{x: 0, y: 0,}}
          end={{x: 1, y: 1,}}
          style={styles.submitGradient}
        >
        </LinearGradient>
      </View>
      <View style={styles.footerGraphic1}>
        <LinearGradient
          colors={["#173C79","#155B8A","#159B79",]}
          start={{x: 0, y: 0,}}
          end={{x: 1, y: 1,}}
          style={styles.submitGradient}
        >
        </LinearGradient>
      </View>
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

          <Section title="Passenger" icon="person-outline" last>
            <Detail label="Passenger ID" value={item.Pid} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  submitGradient1: {
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
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

  list: { padding: 16, paddingTop: 18, paddingBottom: 150 },

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
  bottomNav: {
    position: "absolute",
    bottom: 15,
    left: 10,
    right: 10,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 60,
    height: 75,
    backgroundColor: "#fff",
    borderRadius: 25,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    elevation: 10,
  },

  searchBarInput: {
    position: "absolute",
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginLeft: 15,
    marginTop: 45,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    width:'90%' 
  },

  subHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },

  item: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  label1: {
    marginTop: 4,
    fontSize: 13,
    color: "#8A8A8A",
  },

  activeLabel: {
    color: "#0057D9",
    fontWeight: "600",
  },

  centerButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#2F80ED",

    justifyContent: "center",
    alignItems: "center",

    marginTop: -28,

    shadowColor: "#2F80ED",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 12,
  },

  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  footerGraphic: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    overflow: 'hidden',
  },

  footerGraphic1: {

    position: 'absolute',
    bottom: 20,
    width: '100%',
    overflow: 'hidden',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25, 
  },
});
