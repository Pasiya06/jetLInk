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
  TextInput,
} from "react-native";
import SearchPanel, { filterBySearch } from "../../../components/SearchPanel";
import { router, Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, FontAwesome, Feather } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useBusNames, getBusLabel } from "../../../components/BusName";
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
  brand: "#155B8A",
  brandDark: "#173C79",
  brandSoft: "#EAF1FB",
  bg: "#F3F6FA",
  card: "#ffffff",
  ink: "#0F1B2D",
  muted: "#5B6B7F",
  line: "#DCE3EC",
  success: "#0B6B53",
  successSoft: "#E3F5EE",
  neutral: "#5B6B7F",
  neutralSoft: "#EDF1F6",
  danger: "#B42318",
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
  extraKm?: number;
  extraKmAmount?: number;
}

/* ---------- Screen ---------- */
export default function ReceiptList() {
  const router = useRouter();
  
  const params = useLocalSearchParams();
  
  useBusNames();
  const pemail = Array.isArray(params.pemail)
    ? params.pemail[0]
    : params.pemail;

  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
   
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

  // Reload every time the list is shown (e.g. after paying for extra km)
  useFocusEffect(
    useCallback(() => {
      fetchReceipts();
    }, [fetchReceipts])
  );

  const packagede = () => {
    router.push({
        pathname: "/passenger/parcel/pickupParcel",
        params:{ 
          Pid: params.Pid,
          Pid1: params.Pid1,
          pfirstName: params.pfirstName,
          plastName:params.plastName,
          pphoneNumber: params.pphoneNumber,
          pemail: params.pemail,

        } 
        
    });
  };

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
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>Tours</Text>
            <Text style={styles.title}>
              Additional payment
            </Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="wallet-outline" size={24} color="#fff" />
          </View>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={[styles.center, styles.stateCard]}>
          <ActivityIndicator size="large" color={C.brand} />
          <Text style={styles.infoText}>Loading your receipts…</Text>
        </View>
      ) : error ? (
        <View style={[styles.center, styles.stateCard]}>
          <View style={[styles.stateIcon, { backgroundColor: "#FDE2E2" }]}>
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
          data={filterBySearch(receipts, searchQuery)}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <ReceiptCard item={item} />}
          showsVerticalScrollIndicator={false}
          style={styles.listView}
          contentContainerStyle={
            receipts.length === 0 ? styles.emptyContainer : styles.list
          }
          ListHeaderComponent={
            receipts.length > 0 ? (
              <View style={styles.introCard}>
                <View style={styles.introIcon}>
                  <Ionicons name="information-circle" size={22} color={C.brand} />
                </View>
                <Text style={styles.introText}>
                  Choose a booked tour to add extra kilometers or view its package.
                </Text>
              </View>
            ) : null
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
            <View style={[styles.center, styles.stateCard, { marginTop: 0 }]}>
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
      <SearchPanel
          visible={isSearching}
          query={searchQuery}
          onChangeQuery={setSearchQuery}
          onClose={() => { setIsSearching(false); setSearchQuery(""); }}
          role={"passenger"}
          params={params}
          listLabel="tours"
        />

        <View style={styles.bottomNav}>

          {/* BACK */}
          <TouchableOpacity
            style={styles.item}
            onPress={() => {
              setActiveTab("home");
              if (isSearching) {
                setIsSearching(false); setSearchQuery("");
              }

              else {
                router.push({
                  pathname: "/passenger/tours/index1",
                  params: {
                    Pid: params.Pid,
                    Pid1: params.Pid1,
                    pfirstName: params.pfirstName,
                    plastName: params.plastName,
                    pemail: params.pemail,
                    pphoneNumber: params.pphoneNumber,
                    busType: params.busType,
                    busTypeTopic: params.busTypeTopic,
                  },
                });
              }
            }}
          >
            <Ionicons name={isSearching ? "arrow-back" : "arrow-back-outline"} size={24} color={activeTab === "home" ? "#0057D9" : "#8A8A8A"}/>
            <Text style={[styles.label1, activeTab === "home" && styles.activeLabel,]}>
              Back
            </Text>
          </TouchableOpacity>


          {/* SEARCH */}

          <TouchableOpacity
            style={styles.item}
            onPress={() => {setActiveTab("routes"); if (isSearching) setSearchQuery(""); setIsSearching(!isSearching);}}
          >
            <FontAwesome name={isSearching ? "close" : "search"} size={24} color={activeTab === "routes" ? "#0057D9" : "#8A8A8A"}/>
            <Text style={[styles.label1, activeTab === "routes" && styles.activeLabel,]}>
              Search
            </Text>
          </TouchableOpacity>

          {/* HOME CENTER */}

          <TouchableOpacity
            style={styles.centerButton}
            onPress={() => {
              setActiveTab("tickets");
              router.push({
                pathname: "/passenger/index1",
                params: {
                  Pid: params.Pid,
                  Pid1: params.Pid1,
                  pfirstName: params.pfirstName,
                  plastName: params.plastName,
                  pphoneNumber: params.pphoneNumber,
                  pemail: params.pemail,
                },
              });
            }}
          >
            <Ionicons name="home-outline" size={28} color="#fff"/>
          </TouchableOpacity>

          {/* ALERTS */}

          <TouchableOpacity
            style={styles.item}
            onPress={() => {setActiveTab("routes"); router.push({ pathname: "/notifications", params: { role: "passenger" } });}}
          >
            <View><Ionicons name="notifications-outline" size={24} color={ activeTab === "alerts" ? "#0057D9" : "#8A8A8A"}/><AlertBadge role="passenger" /></View>
            <Text style={[styles.label1, activeTab === "alerts" && styles.activeLabel,]}>
              Alerts
            </Text>
          </TouchableOpacity>


          {/* PROFILE */}

          <TouchableOpacity
            style={styles.item}
            onPress={() => {router.push({ pathname: "/passenger/passengerProfile", params: { role: "passenger",NIC: params.NIC } });}}
          >
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
          />
        </View>


        <View style={styles.footerGraphic1}>

          <LinearGradient
            colors={["#173C79","#155B8A","#159B79",]}
            start={{x: 0, y: 0,}}
            end={{x: 1, y: 1,}}
            style={styles.submitGradient}
          />
        </View>
    </SafeAreaView>
  );
}

/* ---------- Ticket card ---------- */
function ReceiptCard({ item }: { item: Receipt }) {
  const [open, setOpen] = useState(false);
  const params = useLocalSearchParams();
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((v) => !v);
  };

  const price = `Rs. ${Number(item.maxPrice || 0).toLocaleString()}`;

  return (
    <TouchableOpacity 
      style={styles.card}
    >
      
      {/* Top: pickup + status */}
      <View style={styles.cardTop}>
        <View style={styles.topRow}>
          <View style={styles.badgeRow}>
            <View style={styles.busBadge}>
              <Ionicons name="bus" size={14} color={C.brand} />
              <Text style={styles.busBadgeText}>{item.busNumber ? getBusLabel(item.busNumber) : "—"}</Text>
            </View>
            {!!item.packageType && (
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText} numberOfLines={1}>{item.packageType}</Text>
              </View>
            )}
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

      {/* Extra kilometers */}
      <View style={styles.extraRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldLabel}>Extra km</Text>
          <Text style={styles.extraText}>
            {item.extraKm
              ? `${item.extraKm} km · Rs. ${Number(item.extraKmAmount || 0).toLocaleString()} paid`
              : "None added"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.extraButton}
          activeOpacity={0.85}
          onPress={() =>
            router.push({
              pathname: "/passenger/tours/extraKm",
              params: {
                receiptId: item.receiptId,
                Pid: params.Pid,
                Pid1: params.Pid1,
                pfirstName: params.pfirstName,
                plastName: params.plastName,
                pphoneNumber: params.pphoneNumber,
                pemail: params.pemail,
                NIC: params.NIC,
              },
            })
          }
        >
          <Ionicons name="add-circle" size={17} color="#fff" />
          <Text style={styles.extraButtonText}>Add extra km</Text>
        </TouchableOpacity>
      </View>

      
    </TouchableOpacity>
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
      <Ionicons name={icon} size={14} color={C.brand} />
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

  eyebrow: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  listView: { flex: 1, marginTop: -56 },
  stateCard: {
    marginHorizontal: 16,
    marginTop: -56,
    backgroundColor: "#fff",
    borderRadius: 22,
    elevation: 3,
    shadowColor: "#0F1B2D",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  introCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#0F1B2D",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  introIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: C.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  introText: { flex: 1, color: C.ink, fontSize: 13.5, fontWeight: "600", lineHeight: 19 },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1 },
  typeBadge: {
    backgroundColor: "#FFF4DC",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    flexShrink: 1,
  },
  typeBadgeText: { color: "#B26A00", fontWeight: "800", fontSize: 12, textTransform: "uppercase" },
  extraRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 14,
    marginTop: 2,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#F7F9FC",
  },
  extraText: { fontSize: 13, color: "#0F1B2D", fontWeight: "600", marginTop: 2 },
  extraButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.brand,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  extraButtonText: { color: "#fff", fontWeight: "800", fontSize: 13 },

  container: { flex: 1, backgroundColor: C.bg },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: 54,
    paddingHorizontal: 24,
    paddingBottom: 76,
  },

  submitGradient1: { borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },

  title: { fontSize: 28, fontWeight: "800", color: "#ffffff" },
 

  /* List */
  list: { paddingHorizontal: 16, paddingTop: 0, paddingBottom: 220 },
  emptyContainer: { flexGrow: 1, paddingHorizontal: 16, paddingBottom: 220 },

  /* Card */
  card: {
    backgroundColor: C.card,
    borderRadius: 22,
    marginBottom: 16,
    paddingBottom: 14,
    elevation: 4,
    shadowColor: "#0F1B2D",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
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
    justifyContent: "center",
    alignItems: "center",
    padding: 28,
  },
  stateIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
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
    borderRadius: 999,
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

  searchBarInput: {
    position: "absolute",
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginLeft: 15,
    marginTop: 45,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    width: '90%',
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
