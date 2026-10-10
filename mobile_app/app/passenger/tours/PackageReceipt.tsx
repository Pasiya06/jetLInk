import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
  Platform,
  StatusBar,
} from "react-native";

import {
  Stack,
  useLocalSearchParams,
  useRouter,
  useFocusEffect,
} from "expo-router";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// ------------------------------------------------------------
// THEME
// ------------------------------------------------------------

const C = {
  blue: "#0047AB",
  blueDeep: "#003580",
  blueSoft: "#E6EFFC",
  lime: "#32CD32",
  limeDark: "#0B3D12",
  limeSoft: "#E7F7E7",
  page: "#EEF2F8",
  card: "#FFFFFF",
  ink: "#101828",
  body: "#475467",
  muted: "#8A94A6",
  line: "#E4E9F1",
};

const TOP_INSET =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 54;

// ------------------------------------------------------------
// SCREEN
// ------------------------------------------------------------

export default function PackageReceipt() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const receiptId = params.receiptId as string;

  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReceipt = useCallback(async () => {
    try {
      setLoading(true);

      if (!receiptId) {
        Alert.alert("Error", "Receipt ID is missing.");
        return;
      }

      const API_URL = process.env.EXPO_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/receipts/${receiptId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load receipt");
      }

      setReceipt(data.receipt);
    } catch (error: any) {
      console.error("Fetch receipt error:", error);
      Alert.alert("Error", error.message || "Unable to load receipt.");
    } finally {
      setLoading(false);
    }
  }, [receiptId]);

  useFocusEffect(
    useCallback(() => {
      fetchReceipt();
    }, [fetchReceipt])
  );

  // ---------------- LOADING ----------------

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.blue} />
          <Text style={styles.centerText}>Loading your receipt…</Text>
        </View>
      </>
    );
  }

  // ---------------- NOT FOUND ----------------

  if (!receipt) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.center}>
          <View style={styles.emptyIcon}>
            <MaterialCommunityIcons
              name="receipt-text-remove-outline"
              size={44}
              color={C.blue}
            />
          </View>
          <Text style={styles.emptyTitle}>We can't find this receipt</Text>
          <Text style={styles.emptyText}>
            It may have been removed, or the link is no longer valid.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Text style={styles.emptyButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  // ---------------- DERIVED ----------------

  const price = Number(receipt.maxPrice || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const passengerName =
    `${receipt.pfirstName || ""} ${receipt.plastName || ""}`.trim() || "-";

  const handleDone = () => router.push({
    pathname: "/passenger/tours/selectPackeges",
    params: {
      
      Pid: params.Pid,
      Pid1: params.Pid1,
      pfirstName: params.pfirstName,
      plastName:params.plastName,
      pphoneNumber: params.pphoneNumber,
      pemail: params.pemail,
      
    },
  })

  const handleHome = () => router.push({
    pathname: "/passenger/index1",
    params: {
      
      Pid: params.Pid,
      Pid1: params.Pid1,
      pfirstName: params.pfirstName,
      plastName:params.plastName,
      pphoneNumber: params.pphoneNumber,
      pemail: params.pemail,
      
    },
  })

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          `Jetlink package receipt\n` +
          `Receipt: ${receipt.receiptId}\n` +
          `Package: ${receipt.packageId} (${receipt.packageType})\n` +
          `Pickup: ${receipt.pickup}\n` +
          `Date: ${receipt.date} at ${receipt.time}\n` +
          `Bus: ${receipt.busNumber}\n` +
          `Total: Rs. ${price}`,
      });
    } catch {
      // user dismissed the share sheet
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />

      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ======================= HERO ======================= */}
          <View style={styles.hero}>
            <View style={styles.heroBlobA} />
            <View style={styles.heroBlobB} />

            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.roundBtn}
                onPress={() => router.back()}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
              </TouchableOpacity>

              <Text style={styles.brand}>Jetlink</Text>

              <TouchableOpacity
                style={styles.roundBtn}
                onPress={handleShare}
                activeOpacity={0.7}
              >
                <Ionicons name="share-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.heroBody}>
              <View style={styles.checkRing}>
                <View style={styles.checkCore}>
                  <Ionicons name="checkmark" size={30} color={C.limeDark} />
                </View>
              </View>
              <Text style={styles.heroTitle}>Booking confirmed</Text>
              <Text style={styles.heroSub}>
                Your package is booked. Show this receipt when you hand it over.
              </Text>
            </View>
          </View>

          {/* ======================= TICKET ======================= */}
          <View style={styles.ticketWrap}>
            <View style={styles.ticket}>
              {/* Top: ID + type */}
              <View style={styles.ticketTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.metaLabel}>Receipt ID</Text>
                  <Text style={styles.receiptId} numberOfLines={1}>
                    {receipt.receiptId}
                  </Text>
                </View>

                <View style={styles.typePill}>
                  <MaterialCommunityIcons
                    name="package-variant-closed"
                    size={15}
                    color={C.blue}
                  />
                  <Text style={styles.typePillText} numberOfLines={1}>
                    {receipt.packageType || "Package"}
                  </Text>
                </View>
              </View>

              {/* Route */}
              <View style={styles.route}>
                <View style={styles.routeRail}>
                  <View style={styles.routeDot} />
                  <View style={styles.routeLine} />
                  <View style={styles.routeSquare} />
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.routeStop}>
                    <Text style={styles.metaLabel}>Pickup</Text>
                    <Text style={styles.routeValue}>
                      {receipt.pickup || "-"}
                    </Text>
                  </View>

                  <View style={[styles.routeStop, { marginBottom: 0 }]}>
                    <Text style={styles.metaLabel}>Total distance</Text>
                    <Text style={styles.routeValue}>
                      {receipt.totalDistance
                        ? `${receipt.totalDistance} km`
                        : "-"}
                      {receipt.tripDuration
                        ? `  •  ${receipt.tripDuration}`
                        : ""}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Date / time / bus */}
              <View style={styles.triple}>
                <TripleCell
                  icon="calendar-blank-outline"
                  label="Date"
                  value={receipt.date}
                />
                <View style={styles.tripleDivider} />
                <TripleCell
                  icon="clock-outline"
                  label="Departs"
                  value={receipt.time}
                />
                <View style={styles.tripleDivider} />
                <TripleCell
                  icon="bus"
                  label="Bus"
                  value={receipt.busNumber}
                />
              </View>

              {/* Perforation */}
              <View style={styles.perforation}>
                <View style={[styles.notch, styles.notchLeft]} />
                <View style={styles.dashes}>
                  {Array.from({ length: 26 }).map((_, i) => (
                    <View key={i} style={styles.dash} />
                  ))}
                </View>
                <View style={[styles.notch, styles.notchRight]} />
              </View>

              {/* Bottom: price */}
              <View style={styles.ticketBottom}>
                <View>
                  <Text style={styles.metaLabel}>Total paid</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.currency}>Rs.</Text>
                    <Text style={styles.price}>{price}</Text>
                  </View>
                </View>

                
              </View>
            </View>
          </View>

        <View style={styles.bottomBar1}>
          <TouchableOpacity
            style={styles.shareBtn}
            onPress={handleHome}
            activeOpacity={0.8}
          >
            <Text style={styles.shareBtnText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.doneBtn}
            onPress={handleDone}
            activeOpacity={0.85}
          >
            <Text style={styles.doneBtnText}>Book Another</Text>
          </TouchableOpacity>
        </View>
      
        </ScrollView>

        {/* ======================= BOTTOM BAR ======================= */}
        
      </View>
    </>
  );
}

// ------------------------------------------------------------
// SMALL COMPONENTS
// ------------------------------------------------------------

function TripleCell({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: any;
}) {
  return (
    <View style={styles.tripleCell}>
      <MaterialCommunityIcons name={icon} size={18} color={C.blue} />
      <Text style={styles.tripleValue} numberOfLines={1}>
        {value || "-"}
      </Text>
      <Text style={styles.tripleLabel}>{label}</Text>
    </View>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function Row({
  label,
  value,
  last,
}: {
  label: string;
  value: any;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={3}>
        {value || "-"}
      </Text>
    </View>
  );
}

function initials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
}

function Crew({
  role,
  name,
  nic,
  icon,
}: {
  role: string;
  name?: string;
  nic?: string;
  icon: any;
}) {
  return (
    <View style={styles.crew}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials(name).toUpperCase()}</Text>
        <View style={styles.avatarBadge}>
          <MaterialCommunityIcons name={icon} size={12} color="#FFFFFF" />
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.crewRole}>{role}</Text>
        <Text style={styles.crewName} numberOfLines={1}>
          {name || "-"}
        </Text>
        <Text style={styles.crewNic}>NIC {nic || "-"}</Text>
      </View>
    </View>
  );
}

// ------------------------------------------------------------
// STYLES
// ------------------------------------------------------------

const NOTCH = 26;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.page },
  scrollContent: { paddingBottom: 120 },

  // ---------- states ----------
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.page,
    paddingHorizontal: 32,
  },
  centerText: { marginTop: 14, fontSize: 15, color: C.body },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: C.blueSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: "700",
    color: C.ink,
    textAlign: "center",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: C.body,
    textAlign: "center",
  },
  emptyButton: {
    marginTop: 26,
    backgroundColor: C.blue,
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 14,
  },
  emptyButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },

  // ---------- hero ----------
  hero: {
    backgroundColor: C.blue,
    paddingTop: TOP_INSET,
    paddingBottom: 96,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: "hidden",
  },
  heroBlobA: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: C.blueDeep,
    top: -90,
    right: -80,
    opacity: 0.7,
  },
  heroBlobB: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: C.lime,
    bottom: -60,
    left: -40,
    opacity: 0.18,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  roundBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    color: C.lime,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  heroBody: { alignItems: "center", marginTop: 22, paddingHorizontal: 32 },
  checkRing: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "rgba(50,205,50,0.28)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkCore: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: C.lime,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    marginTop: 14,
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  heroSub: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: "#C9DBF7",
    textAlign: "center",
  },

  // ---------- ticket ----------
  ticketWrap: { marginTop: -64, paddingHorizontal: 16 },
  ticket: {
    backgroundColor: C.card,
    borderRadius: 24,
    elevation: 6,
    shadowColor: "#0A2A66",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  ticketTop: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 22,
  },
  metaLabel: { fontSize: 12, color: C.muted, fontWeight: "600" },
  receiptId: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: "800",
    color: C.blue,
    letterSpacing: 0.5,
  },
  typePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.blueSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 12,
    maxWidth: 140,
  },
  typePillText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "700",
    color: C.blue,
  },

  route: {
    flexDirection: "row",
    paddingHorizontal: 22,
    marginTop: 22,
  },
  routeRail: { alignItems: "center", width: 20, marginRight: 14, paddingTop: 4 },
  routeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: C.blue,
    backgroundColor: "#FFFFFF",
  },
  routeLine: {
    flex: 1,
    width: 2,
    backgroundColor: C.line,
    marginVertical: 4,
  },
  routeSquare: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: C.lime,
    marginBottom: 22,
  },
  routeStop: { marginBottom: 18 },
  routeValue: {
    marginTop: 3,
    fontSize: 16,
    fontWeight: "700",
    color: C.ink,
    lineHeight: 22,
  },

  triple: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 22,
    marginTop: 8,
    marginBottom: 22,
    paddingVertical: 14,
    backgroundColor: "#F6F8FC",
    borderRadius: 16,
  },
  tripleCell: { flex: 1, alignItems: "center", paddingHorizontal: 6 },
  tripleDivider: { width: 1, height: 38, backgroundColor: C.line },
  tripleValue: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "800",
    color: C.ink,
  },
  tripleLabel: { marginTop: 2, fontSize: 11, color: C.muted },

  perforation: {
    height: NOTCH,
    justifyContent: "center",
  },
  notch: {
    position: "absolute",
    top: 0,
    width: NOTCH,
    height: NOTCH,
    borderRadius: NOTCH / 2,
    backgroundColor: C.page,
  },
  notchLeft: { left: -NOTCH / 2 },
  notchRight: { right: -NOTCH / 2 },
  dashes: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: NOTCH,
  },
  dash: { width: 6, height: 2, borderRadius: 1, backgroundColor: C.line },

  ticketBottom: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 22,
  },
  priceRow: { flexDirection: "row", alignItems: "baseline", marginTop: 2 },
  currency: { fontSize: 15, fontWeight: "700", color: C.body, marginRight: 5 },
  price: {
    fontSize: 32,
    fontWeight: "800",
    color: C.ink,
    letterSpacing: -0.5,
  },
  bookingChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F3F7",
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 6,
  },
  bookingChipOnline: { backgroundColor: C.limeSoft },
  bookingChipText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "700",
    color: C.body,
  },

  // ---------- sections ----------
  section: { marginTop: 26, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: C.ink,
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.line },
  rowLabel: { fontSize: 14, color: C.muted, flex: 0.9, paddingRight: 12 },
  rowValue: {
    flex: 1.4,
    fontSize: 14,
    fontWeight: "700",
    color: C.ink,
    textAlign: "right",
  },

  // ---------- crew ----------
  crew: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  crewGap: { height: 1, backgroundColor: C.line },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.blueSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: { fontSize: 17, fontWeight: "800", color: C.blue },
  avatarBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.blue,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  crewRole: { fontSize: 12, color: C.muted, fontWeight: "600" },
  crewName: { marginTop: 2, fontSize: 16, fontWeight: "800", color: C.ink },
  crewNic: { marginTop: 2, fontSize: 12, color: C.body },

  // ---------- note / footer ----------
  note: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 22,
    padding: 14,
    borderRadius: 16,
    backgroundColor: C.blueSoft,
  },
  noteText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    lineHeight: 18,
    color: C.blueDeep,
  },
  footer: {
    textAlign: "center",
    marginTop: 22,
    fontSize: 13,
    color: C.muted,
  },

  bottomBar1: {
    
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 30 : 16,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },

  // ---------- bottom bar ----------

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 30 : 16,
    backgroundColor: "rgba(255,255,255,0.97)",
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  shareBtn: {
    height: 54,
    paddingHorizontal: 22,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.blue,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  shareBtnText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "700",
    color: C.blue,
  },
  doneBtn: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    backgroundColor: C.lime,
    alignItems: "center",
    justifyContent: "center",
  },
  doneBtnText: { fontSize: 17, fontWeight: "800", color: C.limeDark },
});
