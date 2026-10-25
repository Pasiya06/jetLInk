import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AlertBadge from "./AlertBadge";

type AdminParams = {
  Aid?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

type Props = {
  admin: AdminParams;
  active?: "back" | "alerts" | "profile" | "";
  onBack?: () => void;
};

// Bottom navigation used by the admin profile screens (same look as the other admin pages)
export default function AdminBottomNav({ admin, active = "", onBack }: Props) {
  const router = useRouter();
  const params = {
    Aid: admin.Aid,
    firstName: admin.firstName,
    lastName: admin.lastName,
    email: admin.email,
  };

  return (
    <>
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.item}
          onPress={() => (onBack ? onBack() : router.back())}
        >
          <Ionicons name="arrow-back-outline" size={24} color={active === "back" ? "#0057D9" : "#8A8A8A"} />
          <Text style={[styles.label, active === "back" && styles.activeLabel]}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push({ pathname: "/notifications", params: { role: "admin" } })}
        >
          <View>
            <Ionicons name="notifications-outline" size={24} color={active === "alerts" ? "#0057D9" : "#8A8A8A"} />
            <AlertBadge role="admin" />
          </View>
          <Text style={[styles.label, active === "alerts" && styles.activeLabel]}>Alerts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.centerButton}
          onPress={() => router.push({ pathname: "/admin/index1", params })}
        >
          <Ionicons name="home-outline" size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push({ pathname: "/admin/Profile/adminProfile", params })}
        >
          <Feather name="user" size={22} color={active === "profile" ? "#0057D9" : "#8A8A8A"} />
          <Text style={[styles.label, active === "profile" && styles.activeLabel]}>Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footerGraphic}>
        <LinearGradient colors={["#173C79", "#155B8A", "#159B79"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient} />
      </View>
      <View style={styles.footerGraphic1}>
        <LinearGradient colors={["#173C79", "#155B8A", "#159B79"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
    zIndex: 10,
  },
  item: { alignItems: "center", justifyContent: "center", flex: 1 },
  label: { marginTop: 4, fontSize: 13, color: "#8A8A8A" },
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
  gradient: { paddingVertical: 16 },
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
