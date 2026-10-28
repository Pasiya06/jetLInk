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
  Modal,
} from "react-native";
import SearchPanel, { filterBySearch } from "../../../components/SearchPanel";
import QRCode from "react-native-qrcode-svg";
import { router, Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, FontAwesome, Feather } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenHeader } from "../../../components/JetUI";
import { useBusNames, getBusLabel } from "../../../components/BusName";

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
  ink: "#0f1b2d",
  muted: "#5B6B7F",
  line: "#DCE3EC",
  success: "#0B6B53",
  successSoft: "#E3F5EE",
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
  extraKm?: number;
  extraKmAmount?: number;
  status?: "active" | "gone";
  tripEnd?: string;
  scanned?: boolean;
  scannedAt?: string | null;
}

type ListTab = "active" | "gone";

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
  const [listTab, setListTab] = useState<ListTab>("active");
  const [qrFor, setQrFor] = useState<Receipt | null>(null);

  const activeReceipts = receipts.filter((r) => (r.status || "active") === "active");
  const goneReceipts = receipts.filter((r) => r.status === "gone");
  const shown = listTab === "active" ? activeReceipts : goneReceipts;
   
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
      <ScreenHeader eyebrow="Your bookings" title="Tour receipts" />

      <View style={styles.bodyWrap}>
      {/* Active / Gone tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, listTab === "active" && styles.activeTabButton]}
          onPress={() => setListTab("active")}
          activeOpacity={0.85}
        >
          <Ionicons name="ticket-outline" size={17} color={listTab === "active" ? "#FFFFFF" : C.brand} />
          <Text style={[styles.tabButtonText, listTab === "active" && styles.activeTabButtonText]}>
            Active ({activeReceipts.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, listTab === "gone" && styles.activeTabButton]}
          onPress={() => setListTab("gone")}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-done" size={17} color={listTab === "gone" ? "#FFFFFF" : C.brand} />
          <Text style={[styles.tabButtonText, listTab === "gone" && styles.activeTabButtonText]}>
            Gone ({goneReceipts.length})
          </Text>
        </TouchableOpacity>
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
          data={filterBySearch(shown, searchQuery)}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <ReceiptCard item={item} onShowQr={() => setQrFor(item)} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            shown.length === 0 ? styles.emptyContainer : styles.list
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
              <Text style={styles.stateTitle}>
                {listTab === "active" ? "No active tours" : "No past tours"}
              </Text>
              <Text style={styles.infoText}>
                {listTab === "active"
                  ? "Tours you book will show up here with their QR code."
                  : "Tours that are scanned or finished will show up here."}
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
      </View>

      <TourQrModal receipt={qrFor} onClose={() => setQrFor(null)} />

      <SearchPanel
          visible={isSearching}
          query={searchQuery}
          onChangeQuery={setSearchQuery}
          onClose={() => { setIsSearching(false); setSearchQuery(""); }}
          role={"passenger"}
          params={params}
          listLabel="tour receipts"
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
                  pathname: "/passenger/receipt/index1",
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
            <Ionicons name="notifications-outline" size={24} color={ activeTab === "alerts" ? "#0057D9" : "#8A8A8A"}/>
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
function ReceiptCard({ item, onShowQr }: { item: Receipt; onShowQr: () => void }) {
  const [open, setOpen] = useState(false);
  const params = useLocalSearchParams();
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((v) => !v);
  };

  const price = `Rs. ${Number(item.maxPrice || 0).toLocaleString()}`;
  const isGone = item.status === "gone";

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => {
        router.push({
          pathname: "/passenger/receipt/PackageDetails",
          params: {
            packageId: item.packageId,
            description: item.description,
            packageType: item.packageType,
            totalDistance: item.totalDistance,
            tripDuration: item.tripDuration,
            maxPassengers: item.maxPassengers,
            maxPrice: item.maxPrice,
            Pid: params.Pid,
            Pid1: params.Pid1,
            pfirstName: params.pfirstName,
            plastName:params.plastName,
            pphoneNumber: params.pphoneNumber,
            pemail: params.pemail,
          },
        });
      }}
    >
      
      {/* Top: pickup + status */}
      <View style={styles.cardTop}>
        <View style={styles.topRow}>
          <View style={styles.busBadge}>
            <Ionicons name="bus" size={14} color={C.brand} />
            <Text style={styles.busBadgeText}>{item.busNumber ? getBusLabel(item.busNumber) : "—"}</Text>
          </View>

          <View
            style={[
              styles.status,
              { backgroundColor: isGone ? C.neutralSoft : C.successSoft },
            ]}
          >
            <View style={[styles.statusDot, { backgroundColor: isGone ? C.neutral : C.success }]} />
            <Text style={[styles.statusText, { color: isGone ? C.neutral : C.success }]}>
              {isGone ? (item.scanned ? "Boarded" : "Ended") : "Active"}
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

      {/* QR code (active tours only) */}
      {!isGone ? (
        <TouchableOpacity style={styles.qrButton} onPress={onShowQr} activeOpacity={0.85}>
          <Ionicons name="qr-code-outline" size={18} color="#FFFFFF" />
          <Text style={styles.qrButtonText}>Show QR code</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.goneRow}>
          <Ionicons name={item.scanned ? "checkmark-circle" : "flag-outline"} size={16} color={C.neutral} />
          <Text style={styles.goneText}>
            {item.scanned
              ? `QR scanned${item.scannedAt ? ` on ${new Date(item.scannedAt).toLocaleDateString()}` : ""}`
              : `Tour ended${item.tripEnd ? ` on ${item.tripEnd}` : ""}`}
          </Text>
        </View>
      )}

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

          <Section title="Crew on this trip" icon="people-outline">
            <Detail label="Driver" value={item.driverD} />
            <Detail label="Driver NIC" value={item.driverNIC} />
            <Detail label="Conductor" value={item.conductorD} />
            <Detail label="Conductor NIC" value={item.conductorNIC} />
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
    </TouchableOpacity>
  );
}

/* ---------- Tour QR modal ---------- */
function TourQrModal({ receipt, onClose }: { receipt: Receipt | null; onClose: () => void }) {
  const [qrToken, setQrToken] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState("");

  const loadQr = useCallback(async () => {
    if (!receipt) return;
    try {
      setQrLoading(true);
      setQrError("");
      setQrToken("");
      const res = await fetch(`${API_URL}/receipts/receiptId/${encodeURIComponent(receipt.receiptId)}/qr`);
      const data = await res.json();
      if (!res.ok || !data.qrToken) throw new Error(data.error || "Could not create QR code.");
      setQrToken(data.qrToken);
    } catch (err) {
      setQrError(err instanceof Error ? err.message : "Could not create QR code.");
    } finally {
      setQrLoading(false);
    }
  }, [receipt]);

  useEffect(() => {
    if (receipt) loadQr();
  }, [receipt, loadQr]);

  return (
    <Modal visible={!!receipt} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.qrBackdrop}>
        <View style={styles.qrCard}>
          <Text style={styles.qrTitle}>Tour QR code</Text>
          <Text style={styles.qrSub}>
            {receipt?.receiptId}  ·  {receipt?.date}
          </Text>

          <View style={styles.qrFrame}>
            {qrLoading ? (
              <ActivityIndicator size="large" color={C.brand} />
            ) : qrToken ? (
              <QRCode value={qrToken} size={210} />
            ) : (
              <View style={{ alignItems: "center", padding: 10 }}>
                <Ionicons name="alert-circle-outline" size={32} color={C.danger} />
                <Text style={styles.qrErrorText}>{qrError}</Text>
              </View>
            )}
          </View>

          <View style={styles.qrHint}>
            <Ionicons name="scan-outline" size={16} color={C.muted} />
            <Text style={styles.qrHintText}>Show this code to the bus conductor when you board</Text>
          </View>

          <View style={styles.qrBtnRow}>
            {!!qrError && (
              <TouchableOpacity style={styles.qrSecondaryBtn} onPress={loadQr} activeOpacity={0.85}>
                <Ionicons name="refresh" size={16} color={C.brand} />
                <Text style={styles.qrSecondaryText}>Retry</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.qrCloseBtn} onPress={onClose} activeOpacity={0.85}>
              <Text style={styles.qrCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
  bodyWrap: { flex: 1, marginTop: -64 },
  tabContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    flexDirection: "row",
    padding: 6,
    gap: 6,
    height: 58,
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 6,
    shadowColor: "#0F1B2D",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
  },
  tabButton: { flex: 1, flexDirection: "row", gap: 8, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  activeTabButton: { backgroundColor: C.brand },
  tabButtonText: { fontSize: 15, fontWeight: "700", color: C.brand },
  activeTabButtonText: { color: "#FFFFFF" },

  qrButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 18,
    marginBottom: 6,
    height: 46,
    borderRadius: 14,
    backgroundColor: C.brand,
  },
  qrButtonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 15 },
  goneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 18,
    marginBottom: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: C.neutralSoft,
  },
  goneText: { color: C.neutral, fontWeight: "600", fontSize: 13 },

  qrBackdrop: { flex: 1, backgroundColor: "rgba(15,27,45,0.55)", alignItems: "center", justifyContent: "center", padding: 20 },
  qrCard: { width: "100%", maxWidth: 360, backgroundColor: "#FFFFFF", borderRadius: 24, padding: 22, alignItems: "center" },
  qrTitle: { fontSize: 20, fontWeight: "800", color: C.ink },
  qrSub: { fontSize: 13, color: C.muted, marginTop: 4, fontWeight: "600" },
  qrFrame: {
    width: 250,
    height: 250,
    marginTop: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  qrErrorText: { marginTop: 8, color: C.danger, textAlign: "center", fontSize: 13, fontWeight: "600" },
  qrHint: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 14 },
  qrHintText: { color: C.muted, fontSize: 12.5, flexShrink: 1 },
  qrBtnRow: { flexDirection: "row", gap: 10, marginTop: 18, alignSelf: "stretch" },
  qrSecondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 48,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: C.brandSoft,
  },
  qrSecondaryText: { color: C.brand, fontWeight: "800" },
  qrCloseBtn: { flex: 1, height: 48, borderRadius: 14, backgroundColor: C.brandDark, alignItems: "center", justifyContent: "center" },
  qrCloseText: { color: "#FFFFFF", fontWeight: "800", fontSize: 15 },
  extraRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 18,
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#EEF2F6",
  },
  extraText: { fontSize: 13, color: "#0f1b2d", fontWeight: "600", marginTop: 2 },
  extraButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#12966F",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  extraButtonText: { color: "#fff", fontWeight: "700", fontSize: 12.5 },

  container: { flex: 1, backgroundColor: C.bg },

  /* Header */
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
 

  /* List */
  list: { paddingHorizontal: 16, paddingTop: 0, paddingBottom: 190 },
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
