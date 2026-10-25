import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Passenger = {
  _id?: string;
  passengerId?: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  NIC: string;
  address?: string;
  createdAt?: string;
};

const getPassengerByNIC = async (
  NIC: string
): Promise<{ passenger: Passenger | null; error?: string }> => {
  try {
    const API_URL = process.env.EXPO_PUBLIC_API_URL;

    const response = await fetch(
      `${API_URL}/passengers/NIC/${encodeURIComponent(NIC.trim())}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to get passenger");
    }

    return { passenger: data.passenger };
  } catch (error: any) {
    console.error("Get passenger error:", error);
    return { passenger: null, error: error?.message || "Something went wrong" };
  }
};

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
}

const InfoRow = ({
  icon,
  label,
  value,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  color: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    activeOpacity={onPress ? 0.7 : 1}
    disabled={!onPress}
    onPress={onPress}
    style={styles.row}
  >
    <View style={[styles.rowIcon, { backgroundColor: `${color}1A` }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <View style={styles.rowText}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={2}>
        {value || "—"}
      </Text>
    </View>
    {onPress && <Ionicons name="chevron-forward" size={18} color="#C0C8D4" />}
  </TouchableOpacity>
);

export default function PassengerProfile() {
  const router = useRouter();
  const params = useLocalSearchParams<{ NIC?: string; nic?: string }>();
  const paramNic = String(params.NIC ?? params.nic ?? "").trim();
  // Many screens return to home without the NIC, so fall back to the one saved at login
  const [nic, setNic] = useState(paramNic);
  const [nicReady, setNicReady] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // First visit: use the NIC passed in (or saved at login).
  // Coming back from Edit: use the saved NIC, since it may have been changed there.
  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      const resolveNic = async () => {
        if (firstFocus.current && paramNic) {
          firstFocus.current = false;
          setNic(paramNic);
          await AsyncStorage.setItem("@jetlink_passenger_nic", paramNic).catch(() => {});
        } else {
          firstFocus.current = false;
          const saved = await AsyncStorage.getItem("@jetlink_passenger_nic").catch(() => null);
          setNic((saved ?? paramNic ?? "").trim());
        }
        setNicReady(true);
        setReloadKey((k) => k + 1);
      };
      resolveNic();
    }, [paramNic])
  );

  const [loading, setLoading] = useState(true);
  const [passenger, setPassenger] = useState<Passenger | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;

  const animateIn = useCallback(() => {
    fade.setValue(0);
    slide.setValue(24);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, friction: 7, useNativeDriver: true }),
    ]).start();
  }, [fade, slide]);

  const loadPassenger = useCallback(async () => {
    if (!nic) {
      setLoading(false);
      setPassenger(null);
      setError("We couldn't find your account details. Please sign in again.");
      animateIn();
      return;
    }

    setLoading(true);
    setError(null);

    const result = await getPassengerByNIC(nic);

    setLoading(false);
    setPassenger(result.passenger);
    setError(result.passenger ? null : result.error || "Passenger not found");
    animateIn();
  }, [nic, animateIn]);

  useEffect(() => {
    if (nicReady) loadPassenger();
  }, [nicReady, loadPassenger, reloadKey]);

  const openEdit = () => {
    if (!passenger) return;
    router.push({
      pathname: "/passenger/editPassengerProfile",
      params: {
        id: passenger._id,
        firstName: passenger.firstName,
        lastName: passenger.lastName,
        phoneNumber: passenger.phoneNumber,
        address: passenger.address ?? "",
        NIC: passenger.NIC,
        email: passenger.email,
      },
    });
  };

  const initials =
    `${passenger?.firstName?.charAt(0) ?? ""}${passenger?.lastName?.charAt(0) ?? ""}`.toUpperCase();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <LinearGradient
            colors={["#173C79", "#155B8A", "#159B79"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerTop}>
              <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={22} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.brand}>Passenger Profile</Text>
              <TouchableOpacity
                style={[styles.backBtn, !passenger && { opacity: 0.4 }]}
                onPress={openEdit}
                disabled={!passenger}
              >
                <Ionicons name="create-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Loading */}
          {loading && (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#0057D9" />
              <Text style={styles.loadingText}>Loading passenger details…</Text>
            </View>
          )}

          {/* Error / not found */}
          {!loading && error && (
            <Animated.View
              style={[styles.errorCard, { opacity: fade, transform: [{ translateY: slide }] }]}
            >
              <View style={styles.errorIcon}>
                <Ionicons name="alert-circle" size={30} color="#E5484D" />
              </View>
              <Text style={styles.errorTitle}>Couldn&apos;t load passenger</Text>
              <Text style={styles.errorText}>{error}</Text>
              {!!nic && (
                <TouchableOpacity onPress={loadPassenger} style={styles.retryBtn}>
                  <Ionicons name="refresh" size={16} color="#fff" />
                  <Text style={styles.retryText}>Try again</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}

          {/* Result */}
          {!loading && passenger && (
            <Animated.View
              style={[styles.resultCard, { opacity: fade, transform: [{ translateY: slide }] }]}
            >
              <LinearGradient
                colors={["#EAF2FF", "#E8F7F2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.profileTop}
              >
                <LinearGradient colors={["#0057D9", "#159B79"]} style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials || "?"}</Text>
                </LinearGradient>
                <Text style={styles.name}>
                  {passenger.firstName} {passenger.lastName}
                </Text>
                <View style={styles.badgeRow}>
                  {passenger.passengerId != null && (
                    <View style={styles.badge}>
                      <Ionicons name="pricetag" size={12} color="#0057D9" />
                      <Text style={[styles.badgeText, { color: "#0057D9" }]}>
                        ID #{passenger.passengerId}
                      </Text>
                    </View>
                  )}
                  <View style={styles.badge}>
                    <View style={styles.activeDot} />
                    <Text style={[styles.badgeText, { color: "#159B79" }]}>Registered</Text>
                  </View>
                </View>
              </LinearGradient>

              {/* Quick actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => Linking.openURL(`tel:${passenger.phoneNumber}`)}
                >
                  <Ionicons name="call" size={18} color="#159B79" />
                  <Text style={[styles.actionText, { color: "#159B79" }]}>Call</Text>
                </TouchableOpacity>
                <View style={styles.actionDivider} />
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => Linking.openURL(`mailto:${passenger.email}`)}
                >
                  <Ionicons name="mail" size={18} color="#0057D9" />
                  <Text style={[styles.actionText, { color: "#0057D9" }]}>Email</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.details}>
                <Text style={styles.sectionTitle}>Personal Details</Text>
                <InfoRow icon="card-outline" label="NIC" value={passenger.NIC} color="#7C3AED" />
                <InfoRow
                  icon="call-outline"
                  label="Phone Number"
                  value={passenger.phoneNumber}
                  color="#159B79"
                  onPress={() => Linking.openURL(`tel:${passenger.phoneNumber}`)}
                />
                <InfoRow
                  icon="mail-outline"
                  label="Email"
                  value={passenger.email}
                  color="#0057D9"
                  onPress={() => Linking.openURL(`mailto:${passenger.email}`)}
                />
                <InfoRow
                  icon="location-outline"
                  label="Address"
                  value={passenger.address}
                  color="#F59E0B"
                />
                <InfoRow
                  icon="calendar-outline"
                  label="Member Since"
                  value={formatDate(passenger.createdAt)}
                  color="#E5484D"
                />

                
              </View>
            </Animated.View>
          )}
        </ScrollView>
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
    </>
  );
}

const cardShadow = {
  shadowColor: "#173C79",
  shadowOpacity: 0.12,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 8 },
  elevation: 6,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F6FB" },

  header: {
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) + 12 : 12,
    paddingHorizontal: 20,
    paddingBottom: 70,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  brand: { color: "#fff", fontSize: 18, fontWeight: "700", letterSpacing: 0.5 },
  headerTitle: { color: "#fff", fontSize: 26, fontWeight: "800", marginTop: 22 },
  headerSub: { color: "rgba(255,255,255,0.8)", fontSize: 14, marginTop: 4, letterSpacing: 0.5 },

  loadingCard: {
    ...cardShadow,
    marginHorizontal: 18,
    marginTop: -48,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 44,
    alignItems: "center",
    gap: 14,
  },
  loadingText: { fontSize: 14, color: "#5B6475", fontWeight: "600" },

  errorCard: {
    ...cardShadow,
    alignItems: "center",
    marginHorizontal: 18,
    marginTop: -48,
    padding: 24,
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  errorIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FFE1E2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  errorTitle: { fontSize: 16, fontWeight: "700", color: "#B4232A" },
  errorText: { fontSize: 13, color: "#C2474D", marginTop: 4, textAlign: "center" },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    backgroundColor: "#0057D9",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  resultCard: {
    ...cardShadow,
    marginHorizontal: 18,
    marginTop: -48,
    backgroundColor: "#fff",
    borderRadius: 22,
    overflow: "hidden",
  },
  profileTop: { alignItems: "center", paddingVertical: 24, paddingHorizontal: 16 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#fff",
  },
  avatarText: { color: "#fff", fontSize: 30, fontWeight: "800" },
  name: { fontSize: 22, fontWeight: "800", color: "#1A2233", marginTop: 12, textAlign: "center" },
  badgeRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: { fontWeight: "700", fontSize: 12 },
  activeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#159B79" },

  actions: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#EEF1F6" },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  actionDivider: { width: 1, backgroundColor: "#EEF1F6", marginVertical: 10 },
  actionText: { fontWeight: "700", fontSize: 14 },

  details: { padding: 18, paddingTop: 14 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8A94A6",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F4F8",
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 12, color: "#8A94A6", fontWeight: "600" },
  rowValue: { fontSize: 15, color: "#1A2233", fontWeight: "600", marginTop: 2 },

  editBtnWrap: { marginTop: 18, borderRadius: 14, overflow: "hidden" },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  editBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

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
