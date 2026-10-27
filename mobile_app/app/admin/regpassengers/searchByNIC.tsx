import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

type Passenger = {
  passengerId?: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  NIC: string;
  address?: string;
  createdAt?: string;
};

// Old NIC: 9 digits + V/X   ·   New NIC: 12 digits
const NIC_PATTERN = /^(\d{9}[VvXx]|\d{12})$/;

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

export default function SearchPassengerByNIC() {
  const router = useRouter();
  const [nic, setNic] = useState("");
  const [loading, setLoading] = useState(false);
  const [passenger, setPassenger] = useState<Passenger | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;

  const isValid = NIC_PATTERN.test(nic.trim());

  const animateIn = () => {
    fade.setValue(0);
    slide.setValue(24);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, friction: 7, useNativeDriver: true }),
    ]).start();
  };

  const handleSearch = async () => {
    Keyboard.dismiss();
    if (!isValid) {
      setPassenger(null);
      setError("Enter a valid NIC (e.g. 200012345678 or 991234567V)");
      animateIn();
      return;
    }
    setLoading(true);
    setError(null);
    setPassenger(null);

    const result = await getPassengerByNIC(nic);

    setLoading(false);
    setPassenger(result.passenger);
    setError(result.passenger ? null : result.error || "Passenger not found");
    animateIn();
  };

  const clear = () => {
    setNic("");
    setPassenger(null);
    setError(null);
  };

  const initials =
    `${passenger?.firstName?.charAt(0) ?? ""}${passenger?.lastName?.charAt(0) ?? ""}`.toUpperCase();

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

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={{ paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
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
                <Text style={styles.brand}>JetLink</Text>
                <View style={{ width: 40 }} />
              </View>
              <Text style={styles.headerTitle}>Find a Passenger</Text>
              <Text style={styles.headerSub}>Search registered passengers by NIC number</Text>
            </LinearGradient>

            {/* Search card */}
            <View style={styles.searchCard}>
              <Text style={styles.inputLabel}>NIC Number</Text>
              <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
                <Ionicons
                  name="card-outline"
                  size={20}
                  color={focused ? "#155B8A" : "#5B6B7F"}
                />
                <TextInput
                  style={styles.input}
                  value={nic}
                  onChangeText={(t) => setNic(t.replace(/\s/g, ""))}
                  placeholder="200012345678 or 991234567V"
                  placeholderTextColor="#A9B2C1"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={12}
                  returnKeyType="search"
                  onSubmitEditing={handleSearch}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                />
                {nic.length > 0 && (
                  <TouchableOpacity onPress={clear} hitSlop={10}>
                    <Ionicons name="close-circle" size={20} color="#C0C8D4" />
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSearch}
                disabled={loading || nic.length === 0}
                style={{ marginTop: 16 }}
              >
                <LinearGradient
                  colors={
                    nic.length === 0 ? ["#B8C4D6", "#B8C4D6"] : ["#173C79", "#155B8A", "#159B79"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.searchBtn}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="search" size={18} color="#fff" />
                      <Text style={styles.searchBtnText}>Search Passenger</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Idle state */}
            {!loading && !passenger && !error && (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="people-outline" size={40} color="#155B8A" />
                </View>
                <Text style={styles.emptyTitle}>Look up a passenger</Text>
                <Text style={styles.emptyText}>
                  Enter an old (9 digits + V/X) or new (12 digits) NIC to see the passenger&apos;s
                  details.
                </Text>
              </View>
            )}

            {/* Error / not found */}
            {!loading && error && (
              <Animated.View
                style={[styles.errorCard, { opacity: fade, transform: [{ translateY: slide }] }]}
              >
                <View style={styles.errorIcon}>
                  <Ionicons name="alert-circle" size={28} color="#E5484D" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.errorTitle}>No result</Text>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              </Animated.View>
            )}

            {/* Result */}
            {!loading && passenger && (
              <Animated.View
                style={[styles.resultCard, { opacity: fade, transform: [{ translateY: slide }] }]}
              >
                <LinearGradient
                  colors={["#EAF1FB", "#E3F5EE"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.profileTop}
                >
                  <LinearGradient
                    colors={["#173C79", "#155B8A", "#159B79"]}
                    style={styles.avatar}
                  >
                    <Text style={styles.avatarText}>{initials || "?"}</Text>
                  </LinearGradient>
                  <Text style={styles.name}>
                    {passenger.firstName} {passenger.lastName}
                  </Text>
                  <View style={styles.badgeRow}>
                    {passenger.passengerId != null && (
                      <View style={styles.idBadge}>
                        <Ionicons name="pricetag" size={12} color="#155B8A" />
                        <Text style={styles.idBadgeText}>ID #{passenger.passengerId}</Text>
                      </View>
                    )}
                    <View style={styles.activeBadge}>
                      <View style={styles.activeDot} />
                      <Text style={styles.activeText}>Registered</Text>
                    </View>
                  </View>
                </LinearGradient>

                {/* Quick actions */}
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => Linking.openURL(`tel:${passenger.phoneNumber}`)}
                  >
                    <Ionicons name="call" size={18} color="#0B6B53" />
                    <Text style={[styles.actionText, { color: "#0B6B53" }]}>Call</Text>
                  </TouchableOpacity>
                  <View style={styles.actionDivider} />
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => Linking.openURL(`mailto:${passenger.email}`)}
                  >
                    <Ionicons name="mail" size={18} color="#155B8A" />
                    <Text style={[styles.actionText, { color: "#155B8A" }]}>Email</Text>
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
                    color="#155B8A"
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
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F6FA" },

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
  headerTitle: { color: "#fff", fontSize: 28, fontWeight: "800", marginTop: 22 },
  headerSub: { color: "rgba(255,255,255,0.8)", fontSize: 14, marginTop: 4 },

  searchCard: {
    marginHorizontal: 18,
    marginTop: -48,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    shadowColor: "#173C79",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  inputLabel: { fontSize: 13, fontWeight: "600", color: "#5B6B7F", marginBottom: 8 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
    borderColor: "#E3E8F0",
    backgroundColor: "#F8FAFD",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  inputWrapFocused: { borderColor: "#155B8A", backgroundColor: "#fff" },
  input: { flex: 1, fontSize: 16, color: "#0F1B2D", letterSpacing: 1, fontWeight: "600" },
  searchBtn: {
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  searchBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  emptyState: { alignItems: "center", paddingHorizontal: 40, marginTop: 40 },
  emptyIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#EAF1FB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#0F1B2D" },
  emptyText: { fontSize: 14, color: "#5B6B7F", textAlign: "center", marginTop: 6, lineHeight: 20 },

  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 18,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFF1F1",
    borderWidth: 1,
    borderColor: "#FBD5D6",
  },
  errorIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFE1E2",
    alignItems: "center",
    justifyContent: "center",
  },
  errorTitle: { fontSize: 15, fontWeight: "700", color: "#B4232A" },
  errorText: { fontSize: 13, color: "#C2474D", marginTop: 2 },

  resultCard: {
    marginHorizontal: 18,
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#173C79",
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
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
  name: { fontSize: 22, fontWeight: "800", color: "#173C79", marginTop: 12, textAlign: "center" },
  badgeRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  idBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  idBadgeText: { color: "#155B8A", fontWeight: "700", fontSize: 12 },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  activeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#159B79" },
  activeText: { color: "#0B6B53", fontWeight: "700", fontSize: 12 },

  actions: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F6",
  },
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
    color: "#5B6B7F",
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
  rowLabel: { fontSize: 12, color: "#5B6B7F", fontWeight: "600" },
  rowValue: { fontSize: 15, color: "#0F1B2D", fontWeight: "600", marginTop: 2 },
});
