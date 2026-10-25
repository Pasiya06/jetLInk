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
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  badge?: { text: string; color: string } | null;
  onPress?: () => void;
}) => (
  <TouchableOpacity style={styles.row} activeOpacity={onPress ? 0.7 : 1} disabled={!onPress} onPress={onPress}>
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
    {onPress ? <Ionicons name="call-outline" size={18} color="#159B79" style={{ marginLeft: 8 }} /> : null}
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
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#173C79", "#155B8A", "#159B79"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGradient}>
          <View style={styles.header}>
            <Text style={styles.title}>Jetlink</Text>
          </View>
        </LinearGradient>

        <View style={styles.card}>
          {/* Top: bus number, type, status */}
          <View style={styles.cardHeader}>
            <View style={styles.avatar}>
              <MaterialIcons name="directions-bus" size={34} color="#fff" />
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.busNumber}>{bus?.busNumber || busNo || "—"}</Text>
              <View style={styles.badgeRow}>
                {bus?.busType ? (
                  <View style={[styles.badge, { backgroundColor: "#EAF0FB" }]}>
                    <Text style={[styles.badgeText, { color: "#0057D9" }]}>{BUS_TYPE_LABEL[bus.busType] ?? bus.busType}</Text>
                  </View>
                ) : null}
                <View style={[styles.badge, { backgroundColor: `${status.color}1A` }]}>
                  <Text style={[styles.badgeText, { color: status.color }]}>{status.text}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Live sharing strip */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.liveStrip, { backgroundColor: share.active ? "#EAF7EC" : "#FFF0F0" }]}
            onPress={() => router.push({ pathname: "/busStaff/loaction", params: { ...staffParams, busNumber: busNo } })}
          >
            <View style={[styles.liveDot, { backgroundColor: share.active ? "#32CD32" : "#FF6B6B" }]} />
            <Text style={[styles.liveText, { color: share.active ? "#2F9E44" : "#E5484D" }]}>
              {share.active
                ? `Sharing live location${share.lastSent ? ` · last sent ${share.lastSent}` : ""}`
                : "Location sharing is OFF"}
            </Text>
            <Ionicons name="map-outline" size={18} color={share.active ? "#2F9E44" : "#E5484D"} />
          </TouchableOpacity>

          {loading && !bus ? (
            <ActivityIndicator size="large" color="#155B8A" style={{ marginTop: 40 }} />
          ) : (
            <ScrollView
              contentContainerStyle={styles.body}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadBus(); }} />}
            >
              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Text style={styles.section}>Crew</Text>
              <InfoRow
                icon={<MaterialCommunityIcons name="steering" size={18} color="#4A6FA5" />}
                label="Driver"
                value={driverName ? `${driverName}${params.dphoneNumber ? ` · ${params.dphoneNumber}` : ""}` : undefined}
                onPress={params.dphoneNumber ? () => call(params.dphoneNumber) : undefined}
              />
              <InfoRow
                icon={<Ionicons name="person-outline" size={18} color="#4A6FA5" />}
                label="Conductor"
                value={conductorName ? `${conductorName}${params.cphoneNumber ? ` · ${params.cphoneNumber}` : ""}` : undefined}
                onPress={params.cphoneNumber ? () => call(params.cphoneNumber) : undefined}
              />

              <Text style={styles.section}>Bus Details</Text>
              <InfoRow icon={<Ionicons name="pricetag-outline" size={18} color="#4A6FA5" />} label="Bus ID" value={bus?.busId != null ? `#${bus.busId}` : undefined} />
              <InfoRow icon={<MaterialCommunityIcons name="car-cog" size={18} color="#4A6FA5" />} label="Chassis No" value={bus?.chassisNo} />
              <InfoRow icon={<MaterialCommunityIcons name="engine-outline" size={18} color="#4A6FA5" />} label="Engine No" value={bus?.engineNo} />
              <InfoRow icon={<MaterialCommunityIcons name="seat-passenger" size={18} color="#4A6FA5" />} label="No. of Seats" value={bus?.noOfSeats} />
              <InfoRow icon={<Ionicons name="color-palette-outline" size={18} color="#4A6FA5" />} label="Colour" value={bus?.colour} />

              <Text style={styles.section}>Documents</Text>
              <InfoRow icon={<MaterialCommunityIcons name="wrench-outline" size={18} color="#4A6FA5" />} label="Service Date" value={bus?.serviceDate} badge={dateStatus(bus?.serviceDate)} />
              <InfoRow icon={<Ionicons name="document-text-outline" size={18} color="#4A6FA5" />} label="License Date" value={bus?.licenseDate} badge={dateStatus(bus?.licenseDate)} />
              <InfoRow icon={<MaterialCommunityIcons name="smoke" size={18} color="#4A6FA5" />} label="Emission Date" value={bus?.emissionDate} badge={dateStatus(bus?.emissionDate)} />
            </ScrollView>
          )}
        </View>

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
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#4A6FA5",
    justifyContent: "center",
    alignItems: "center",
  },
  busNumber: { fontSize: 20, fontWeight: "800", color: "#1E293B" },
  badgeRow: { flexDirection: "row", gap: 6, marginTop: 8, flexWrap: "wrap" },
  badge: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: "700" },

  liveStrip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 8,
  },
  liveDot: { width: 9, height: 9, borderRadius: 5 },
  liveText: { flex: 1, fontSize: 13, fontWeight: "600" },

  body: { paddingHorizontal: 20, paddingBottom: 30 },
  section: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EAF0FB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  label: { fontSize: 12, color: "#94A3B8", marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.5 },
  value: { fontSize: 15, color: "#1E293B", fontWeight: "500" },
  smallBadge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 10 },
  smallBadgeText: { fontSize: 11, fontWeight: "700" },
  error: { color: "#D32F2F", textAlign: "center", marginTop: 12 },

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
