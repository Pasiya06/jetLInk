import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// Helper to safely coerce useLocalSearchParams values (string | string[]) to string
const toStr = (v: string | string[] | undefined): string =>
  Array.isArray(v) ? v[0] ?? "" : v ?? "—";

interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  tint: string;
}

const InfoRow = ({ icon, label, value, tint }: InfoRowProps) => (
  <View style={styles.infoRow}>
    <View style={[styles.iconWrap, { backgroundColor: tint }]}>
      <Ionicons name={icon} size={18} color="#fff" />
    </View>
    <View style={styles.infoTextWrap}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const SectionHeader = ({ title }: { title: string }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

export default function ParcelDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const parcelId = toStr(params.parcelId);
  const senderName = toStr(params.sendername);
  const senderMobile = toStr(params.Smobilenumber);
  const senderEmail = toStr(params.Semail);
  const receiverName = toStr(params.receivername);
  const receiverMobile = toStr(params.Rmobilenumber);
  const receiverEmail = toStr(params.Remail);
  const weight = toStr(params.weight);
  const pickup = toStr(params.pickup);
  const drop = toStr(params.drop);
  const date = toStr(params.date);
  const time = toStr(params.time);
  const busNumber = toStr(params.Bnumber);

  return (
    <View style={styles.container}>
      {/* <LinearGradient
        colors={["#4338ca", "#6366f1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerIconCircle}>
          <Ionicons name="cube" size={30} color="#4338ca" />
        </View>
        <Text style={styles.headerTitle}>Parcel Details</Text>
        <View style={styles.parcelIdPill}>
          <Text style={styles.parcelIdText}>#{parcelId}</Text>
        </View>
      </LinearGradient> */}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sender */}
        <View style={styles.card}>
          <SectionHeader title="Sender" />
          <View style={styles.infoRow}>
            <View style={[styles.iconWrap, { backgroundColor: "#6366f1" }]}>
            <Ionicons name="person" size={18} color="#fff" />
            </View>
            <View style={styles.infoTextWrap}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{params.sendername}</Text>
          </View>
        </View>
          {/* <InfoRow icon="person" label="Name" value={senderName} tint="#6366f1" />
          <InfoRow icon="call" label="Mobile Number" value={senderMobile} tint="#6366f1" />
          <InfoRow icon="mail" label="Email" value={senderEmail} tint="#6366f1" /> */}
        </View>

        {/* Receiver */}
        <View style={styles.card}>
          <SectionHeader title="Receiver" />
          <View style={styles.infoRow}>
            <View style={[styles.iconWrap, { backgroundColor: "#059669" }]}>
            <Ionicons name="person" size={18} color="#fff" />
            </View>
            <View style={styles.infoTextWrap}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{params.sendername}</Text>
          </View>
        </View>
          {/* <InfoRow icon="person" label="Name" value={receiverName} tint="#059669" />
          <InfoRow icon="call" label="Mobile Number" value={receiverMobile} tint="#059669" />
          <InfoRow icon="mail" label="Email" value={receiverEmail} tint="#059669" /> */}
        </View>

        {/* Trip / Parcel info */}
        <View style={styles.card}>
          <SectionHeader title="Shipment" />
          <View style={styles.infoRow}>
            <View style={[styles.iconWrap, { backgroundColor: "#ea580c" }]}>
            <Ionicons name="person" size={18} color="#fff" />
            </View>
            <View style={styles.infoTextWrap}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{params.sendername}</Text>
          </View>
        </View>
          {/* <InfoRow icon="scale" label="Weight" value={`${weight} kg`} tint="#ea580c" />
          <InfoRow icon="location" label="Pickup" value={pickup} tint="#ea580c" />
          <InfoRow icon="flag" label="Drop-off" value={drop} tint="#ea580c" />
          <InfoRow icon="calendar" label="Date" value={date} tint="#ea580c" />
          <InfoRow icon="time" label="Time" value={time} tint="#ea580c" />
          <InfoRow icon="bus" label="Bus Number" value={busNumber} tint="#ea580c" /> */}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    paddingTop: 56,
    paddingBottom: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backButton: {
    position: "absolute",
    top: 56,
    left: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
  parcelIdPill: {
    marginTop: 8,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  parcelIdText: { color: "#fff", fontSize: 13, fontWeight: "600", letterSpacing: 0.5 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40, gap: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoTextWrap: { flex: 1 },
  infoLabel: { fontSize: 12, color: "#94a3b8", marginBottom: 2 },
  infoValue: { fontSize: 15, color: "#1e293b", fontWeight: "600" },
});
