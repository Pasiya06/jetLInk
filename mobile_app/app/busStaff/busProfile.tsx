import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ScreenHeader, Pill, C, GRADIENT, ui } from "../../components/JetUI";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AlertBadge from "../../components/AlertBadge";
import { subscribeBusLocation, BusShareState } from "../../services/busLocationService";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Bus = {
  busId?: number;
  busNumber: string;
  chassisNo?: string;
  engineNo?: string;
  noOfSeats?: string;
  colour?: string;
  serviceDate?: string;
  licenseDate?: string;
  emissionDate?: string;
  busType?: "NormalWay" | "Highway" | "tour";
  status?: "normal" | "accident" | "breakdown";
  emergency?: boolean;
};

const BUS_TYPE_LABEL: Record<string, string> = {
  NormalWay: "Normal Way",
  Highway: "Highway",
  tour: "Tour",
};

// Expired / due within 30 days / OK, for service, license and emission dates
function dateStatus(value?: string): { text: string; color: string } | null {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  const days = Math.ceil((d.getTime() - Date.now()) / 86400000);
  if (days < 0) return { text: "Expired", color: "#E5484D" };
  if (days <= 30) return { text: `${days}d left`, color: "#F59E0B" };
  return { text: "Valid", color: "#159B79" };
}

const InfoRow = ({
  icon,
  label,
  value,
  badge,
  onPress,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  badge?: { text: string; color: string } | null;
  onPress?: () => void;
  last?: boolean;
}) => (
  <TouchableOpacity style={[styles.row, !last && styles.rowDivider]} activeOpacity={onPress ? 0.7 : 1} disabled={!onPress} onPress={onPress}>
    <View style={styles.iconWrap}>{icon}</View>
    <View style={{ flex: 1 }}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "—"}</Text>
    </View>
    {badge ? (
      <View style={[styles.smallBadge, { backgroundColor: `${badge.color}1A` }]}>
        <Text style={[styles.smallBadgeText, { color: badge.color }]}>{badge.text}</Text>
      </View>
    ) : null}
    {onPress ? <View style={styles.callBtn}><Ionicons name="call" size={16} color="#FFFFFF" /></View> : null}
  </TouchableOpacity>
);

export default function BusStaffBusProfile() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const busNo = String(params.busNo ?? "");
  const [activeTab, setActiveTab] = useState("profile");

  const [bus, setBus] = useState<Bus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [share, setShare] = useState<BusShareState>({ active: false, updates: 0 });

  // Same params every busStaff screen passes around
  const staffParams = {
    Cid: params.Cid,
    conductorId: params.conductorId,
    conductorNIC: params.conductorNIC,
    cfirstName: params.cfirstName,
    clastName: params.clastName,
    cphoneNumber: params.cphoneNumber,
    driverId: params.driverId,
    dfirstName: params.dfirstName,
    dlastName: params.dlastName,
    dphoneNumber: params.dphoneNumber,
    busNo: params.busNo,
  };

  const loadBus = useCallback(async () => {
    if (!busNo) {
      setError("Bus number missing. Please log in again.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/buses/profile/${encodeURIComponent(busNo)}`);
      const data = await res.json();
      if (data.success) {
        setBus(data.data);
        setError("");
      } else {
        setError(data.message || "Could not load bus details");
      }
    } catch (e) {
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [busNo]);

  useFocusEffect(
    useCallback(() => {
      loadBus();
    }, [loadBus])
  );

  useEffect(() => subscribeBusLocation(setShare), []);

  const driverName = `${params.dfirstName ?? ""} ${params.dlastName ?? ""}`.trim();
  const conductorName = `${params.cfirstName ?? ""} ${params.clastName ?? ""}`.trim();
  const call = (n?: unknown) => {
    if (n) Linking.openURL(`tel:${String(n)}`);
  };

  const status = bus?.emergency
    ? { text: bus.status === "accident" ? "Accident" : bus.status === "breakdown" ? "Breakdown" : "Emergency", color: "#E5484D" }
    : { text: "Normal", color: "#159B79" };

  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
        <ScreenHeader eyebrow="My bus" title={bus?.busNumber || busNo || "Bus profile"} />

        <ScrollView
          style={ui.body}
          contentContainerStyle={ui.bodyContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadBus(); }} />}
        >
          <View style={[ui.card, styles.heroCard]}>
            <View style={styles.heroTop}>
              <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
                <MaterialIcons name="directions-bus" size={32} color="#fff" />
              </LinearGradient>
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={styles.busNumber}>{bus?.busNumber || busNo || "—"}</Text>
                <View style={styles.badgeRow}>
                  {bus?.busType ? (
                    <Pill text={BUS_TYPE_LABEL[bus.busType] ?? bus.busType} bg={C.blueSoft} color={C.blue} />
                  ) : null}
                  <Pill text={status.text} bg={`${status.color}1A`} color={status.color} />
                </View>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.liveStrip, { backgroundColor: share.active ? C.greenSoft : C.redSoft }]}
              onPress={() => router.push({ pathname: "/busStaff/loaction", params: { ...staffParams, busNumber: busNo } })}
            >
              <View style={[styles.liveDot, { backgroundColor: share.active ? "#22C55E" : C.red }]} />
              <Text style={[styles.liveText, { color: share.active ? C.green : C.red }]}>
                {share.active
                  ? `Sharing live location${share.lastSent ? ` · last sent ${share.lastSent}` : ""}`
                  : "Location sharing is off"}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={share.active ? C.green : C.red} />
            </TouchableOpacity>
          </View>

          {loading && !bus ? (
            <ActivityIndicator size="large" color={C.blue} style={{ marginTop: 30 }} />
          ) : (
            <>
              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={18} color={C.red} />
                  <Text style={styles.error}>{error}</Text>
                </View>
              ) : null}

              <View style={[ui.card, styles.sectionCard]}>
                <Text style={styles.section}>Crew</Text>
                <InfoRow
                  icon={<MaterialCommunityIcons name="steering" size={18} color={C.amber} />}
                  label="Driver"
                  value={driverName ? `${driverName}${params.dphoneNumber ? ` · ${params.dphoneNumber}` : ""}` : undefined}
                  onPress={params.dphoneNumber ? () => call(params.dphoneNumber) : undefined}
                />
                <InfoRow
                  icon={<Ionicons name="person-outline" size={18} color={C.purple} />}
                  label="Conductor"
                  value={conductorName ? `${conductorName}${params.cphoneNumber ? ` · ${params.cphoneNumber}` : ""}` : undefined}
                  onPress={params.cphoneNumber ? () => call(params.cphoneNumber) : undefined}
                  last
                />
              </View>

              <View style={[ui.card, styles.sectionCard]}>
                <Text style={styles.section}>Bus details</Text>
                <InfoRow icon={<Ionicons name="pricetag-outline" size={18} color={C.blue} />} label="Bus ID" value={bus?.busId != null ? `#${bus.busId}` : undefined} />
                <InfoRow icon={<MaterialCommunityIcons name="car-cog" size={18} color={C.blue} />} label="Chassis number" value={bus?.chassisNo} />
                <InfoRow icon={<MaterialCommunityIcons name="engine-outline" size={18} color={C.blue} />} label="Engine number" value={bus?.engineNo} />
                <InfoRow icon={<MaterialCommunityIcons name="seat-passenger" size={18} color={C.blue} />} label="Seats" value={bus?.noOfSeats} />
                <InfoRow icon={<Ionicons name="color-palette-outline" size={18} color={C.blue} />} label="Colour" value={bus?.colour} last />
              </View>

              <View style={[ui.card, styles.sectionCard]}>
                <Text style={styles.section}>Documents</Text>
                <InfoRow icon={<MaterialCommunityIcons name="wrench-outline" size={18} color={C.green} />} label="Service date" value={bus?.serviceDate} badge={dateStatus(bus?.serviceDate)} />
                <InfoRow icon={<Ionicons name="document-text-outline" size={18} color={C.green} />} label="Licence date" value={bus?.licenseDate} badge={dateStatus(bus?.licenseDate)} />
                <InfoRow icon={<MaterialCommunityIcons name="smoke" size={18} color={C.green} />} label="Emission date" value={bus?.emissionDate} badge={dateStatus(bus?.emissionDate)} last />
              </View>
            </>
          )}
        </ScrollView>


        {/* Bottom nav */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("back"); router.back(); }}>
            <Ionicons name="arrow-back-outline" size={24} color={activeTab === "back" ? "#0057D9" : "#8A8A8A"} />
            <Text style={[styles.label1, activeTab === "back" && styles.activeLabel]}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => { setActiveTab("map"); router.push({ pathname: "/busStaff/loaction", params: { ...staffParams, busNumber: busNo } }); }}
          >
            <Ionicons name="map-outline" size={24} color={activeTab === "map" ? "#0057D9" : "#8A8A8A"} />
            <Text style={[styles.label1, activeTab === "map" && styles.activeLabel]}>Map</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.centerButton} onPress={() => router.push({ pathname: "/busStaff/index1", params: staffParams })}>
            <Ionicons name="home-outline" size={28} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("alerts"); router.push({ pathname: "/notifications", params: { role: "staff" } }); }}>
            <View>
              <Ionicons name="notifications-outline" size={24} color={activeTab === "alerts" ? "#0057D9" : "#8A8A8A"} />
              <AlertBadge role="staff" />
            </View>
            <Text style={[styles.label1, activeTab === "alerts" && styles.activeLabel]}>Alerts</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => setActiveTab("profile")}>
            <Feather name="user" size={24} color={activeTab === "profile" ? "#0057D9" : "#8A8A8A"} />
            <Text style={[styles.label1, activeTab === "profile" && styles.activeLabel]}>Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerGraphic}>
          <LinearGradient colors={["#173C79", "#155B8A", "#159B79"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.submitGradient} />
        </View>
        <View style={styles.footerGraphic1}>
          <LinearGradient colors={["#173C79", "#155B8A", "#159B79"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.submitGradient} />
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  heroCard: { padding: 18 },
  heroTop: { flexDirection: "row", alignItems: "center" },
  sectionCard: { paddingHorizontal: 18, paddingVertical: 8 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: "#EDF1F6" },
  callBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#159B79", alignItems: "center", justifyContent: "center", marginLeft: 10 },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FDE2E2", borderRadius: 14, padding: 12, marginBottom: 12 },
  container: { flex: 1, backgroundColor: "#fff" },
  headerGradient: { borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
  header: { alignItems: "center", justifyContent: "center", paddingTop: 50, paddingBottom: 70 },
  title: { fontSize: 28, fontWeight: "800", color: "#fff", letterSpacing: 0.5 },

  card: {
    width: "90%",
    flex: 1,
    maxHeight: "68%",
    backgroundColor: "#FFF",
    marginTop: -50,
    alignSelf: "center",
    borderRadius: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 14,
    backgroundColor: "#F4F7FC",
  },
  avatar: { width: 62, height: 62, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  busNumber: { fontSize: 22, fontWeight: "800", color: "#0F1B2D" },
  badgeRow: { flexDirection: "row", gap: 6, marginTop: 8, flexWrap: "wrap" },
  badge: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: "700" },

  liveStrip: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 14, gap: 10, borderRadius: 14, marginTop: 16 },
  liveDot: { width: 10, height: 10, borderRadius: 5 },
  liveText: { flex: 1, fontSize: 13, fontWeight: "600" },

  body: { paddingHorizontal: 20, paddingBottom: 30 },
  section: { fontSize: 16, fontWeight: "800", color: "#0F1B2D", marginTop: 10, marginBottom: 2 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  iconWrap: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#F3F6FA", justifyContent: "center", alignItems: "center", marginRight: 12 },
  label: { fontSize: 12.5, color: "#5B6B7F", fontWeight: "600", marginBottom: 2 },
  value: { fontSize: 15, color: "#0F1B2D", fontWeight: "700" },
  smallBadge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 10 },
  smallBadgeText: { fontSize: 11, fontWeight: "700" },
  error: { flex: 1, color: "#C62828", fontWeight: "600", fontSize: 13 },

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
    shadowOffset: { width: 0, height: -2 },
    elevation: 10,
  },
  item: { alignItems: "center", justifyContent: "center", flex: 1 },
  label1: { marginTop: 4, fontSize: 13, color: "#8A8A8A" },
  activeLabel: { color: "#0057D9", fontWeight: "600" },
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
    shadowOffset: { width: 0, height: 4 },
    elevation: 12,
  },
  submitGradient: { paddingVertical: 16 },
  footerGraphic: { position: "absolute", bottom: 0, width: "100%", overflow: "hidden" },
  footerGraphic1: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    overflow: "hidden",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
});
