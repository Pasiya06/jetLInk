import React, { useCallback, useState } from "react";
import { Stack, useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getAdminById, AdminProfile } from "../../../services/adminService";
import AdminBottomNav from "../../../components/AdminBottomNav";

export default function AdminProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const Aid = String(params.Aid ?? "");

  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Reload every time the screen is shown (so edits appear straight away)
  useFocusEffect(
    useCallback(() => {
      let active = true;
      const load = async () => {
        if (!Aid) {
          setError("Admin ID missing. Please log in again.");
          setLoading(false);
          return;
        }
        try {
          setLoading(true);
          const res = await getAdminById(Aid);
          if (!active) return;
          if (res.success) {
            setAdmin(res.data);
            setError("");
          } else {
            setError(res.message || "Could not load profile");
          }
        } catch (e) {
          if (active) setError("Unable to connect to server");
        } finally {
          if (active) setLoading(false);
        }
      };
      load();
      return () => {
        active = false;
      };
    }, [Aid])
  );

  // Use fresh server data, fall back to the params passed from login
  const firstName = admin?.firstName ?? String(params.firstName ?? "");
  const lastName = admin?.lastName ?? String(params.lastName ?? "");
  const email = admin?.email ?? String(params.email ?? "");
  const phoneNumber = admin?.phoneNumber ?? "";
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const memberSince = admin?.createdAt
    ? new Date(admin.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

  const navParams = { Aid, firstName, lastName, email };

  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#173C79", "#155B8A", "#159B79"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGradient}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.push({
                      pathname: "/admin/index1",
                      params: {
                        Aid: params.Aid,
                        firstName: params.firstName,
                        lastName: params.lastName,
                        email: params.email,
                      },
                    })}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>Jetlink</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.row1}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials || "A"}</Text>
              </View>
              <View style={{ marginLeft: 12, flexShrink: 1 }}>
                <Text style={styles.fullName}>{firstName} {lastName}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Admin</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.editBtn}
              activeOpacity={0.85}
              disabled={!admin}
              onPress={() =>
                router.push({
                  pathname: "/admin/Profile/editAdminProfile",
                  params: { ...navParams, phoneNumber },
                })
              }
            >
              <Ionicons name="create-outline" size={26} color={admin ? "#8A8A8A" : "#D0D0D0"} />
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>

          

          {loading && !admin ? (
            <ActivityIndicator size="large" color="#155B8A" style={{ marginTop: 40 }} />
          ) : (
            <ScrollView contentContainerStyle={styles.body}>
              {error ? <Text style={styles.error}>{error}</Text> : null}

              <InfoRow icon={<Ionicons name="mail-outline" size={18} color="#4A6FA5" />} label="Email" value={email} />
              <InfoRow icon={<Ionicons name="call-outline" size={18} color="#4A6FA5" />} label="Phone" value={phoneNumber || "—"} />
              <InfoRow icon={<Ionicons name="calendar-outline" size={18} color="#4A6FA5" />} label="Member Since" value={memberSince} />

            </ScrollView>
          )}
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.addBtnWrap}
          onPress={() => router.push({ pathname: "/admin/Profile/createAdmin", params: navParams })}
        >
          <LinearGradient colors={["#173C79", "#155B8A", "#159B79"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.addBtn}>
            <MaterialCommunityIcons name="account-plus-outline" size={22} color="#fff" />
            <Text style={styles.addBtnText}>Add New Admin</Text>
          </LinearGradient>
        </TouchableOpacity>

        
      </SafeAreaView>
    </>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerGradient: { borderBottomLeftRadius: 25, borderBottomRightRadius: 25, paddingTop: 50, paddingBottom: 70, paddingHorizontal: 20,  },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 28, fontWeight: "800", color: "#fff", letterSpacing: 0.5 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    width: "90%",
    flex: 1,
    maxHeight: "45%",
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 14,
    backgroundColor: "#F4F7FC",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  row1: { flexDirection: "row", alignItems: "center", flexShrink: 1 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#4A6FA5",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#FFF", fontSize: 22, fontWeight: "700" },
  fullName: { fontSize: 18, fontWeight: "700", color: "#1E293B" },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#EAF7EC",
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  badgeText: { fontSize: 11, color: "#2F9E44", fontWeight: "600" },
  editBtn: { alignItems: "center", paddingLeft: 8 },
  editText: { color: "#8A8A8A", fontSize: 13, fontWeight: "bold" },

  body: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 30 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
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
  error: { color: "#D32F2F", textAlign: "center", marginVertical: 10 },

  addBtnWrap: { marginTop: 24, borderRadius: 25, overflow: "hidden", elevation: 6, marginLeft: 24, marginRight: 24, },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 52, gap: 8 },
  addBtnText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
});
