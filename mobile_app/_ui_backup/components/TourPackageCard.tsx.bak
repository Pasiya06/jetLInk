import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons, MaterialCommunityIcons, MaterialIcons, Octicons } from "@expo/vector-icons";

export type TourPackage = {
  _id: string;
  title?: string;
  destination?: string;
  pickupMinKm?: number;
  pickupMaxKm?: number;
  busType?: string;
  extraKmPrice?: number;
  description: string;
  packageType: string;
  totalDistance: string;
  tripDuration: string;
  maxPassengers: number;
  maxPrice: number;
  places?: { _id?: string; name: string }[];
  createdAt?: string;
};

export type PackageTier = "Silver" | "Gold" | "Diamond";

export const TIER_COLORS: Record<PackageTier, { main: string; pale: string; border: string }> = {
  Silver: { main: "#475569", pale: "#EEF2F6", border: "#CBD5E1" },
  Gold: { main: "#B45309", pale: "#FEF3C7", border: "#F59E0B" },
  Diamond: { main: "#0369A1", pale: "#E0F2FE", border: "#38BDF8" },
};

export const getTier = (value?: string): PackageTier => {
  const v = (value || "").toLowerCase();
  if (v.includes("gold")) return "Gold";
  if (v.includes("diamond")) return "Diamond";
  return "Silver";
};

export const packageTitle = (p: TourPackage) =>
  p.title?.trim() ||
  (p.destination ? `${p.destination} ${getTier(p.packageType)} Tour` : `${getTier(p.packageType)} Package`);

export const pickupRangeText = (p: TourPackage) => {
  const min = p.pickupMinKm ?? 0;
  const max = p.pickupMaxKm ?? 0;
  const from = p.destination ? ` from ${p.destination}` : "";
  if (!min && !max) return "Pickup from any town";
  if (min && max) return `Pickup towns ${min}–${max}km${from}`;
  if (max) return `Pickup towns up to ${max}km${from}`;
  return `Pickup towns ${min}km+${from}`;
};

type Props = {
  pkg: TourPackage;
  onPress?: () => void;
  // Passenger: distance from their chosen pickup town
  pickupTown?: string | null;
  pickupKm?: number | null;
  // Admin
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function TourPackageCard({ pkg, onPress, pickupTown, pickupKm, onEdit, onDelete }: Props) {
  const tier = getTier(pkg.packageType);
  const colors = TIER_COLORS[tier];
  const places = pkg.places ?? [];
  const shownPlaces = places.slice(0, 3).map((p) => p.name);
  const morePlaces = places.length - shownPlaces.length;

  const tripLine = [pkg.tripDuration, pkg.totalDistance].filter(Boolean).join(" · ");
  const busLine = [pkg.maxPassengers ? `${pkg.maxPassengers} seats` : "", pkg.busType || ""]
    .filter(Boolean)
    .join(" · ");

  return (
    <TouchableOpacity activeOpacity={0.88} onPress={onPress} style={styles.card}>
      {/* Tier + destination */}
      <View style={styles.topRow}>
        <View style={[styles.tierBadge, { backgroundColor: colors.pale }]}>
          <Text style={[styles.tierText, { color: colors.main }]}>{tier.toUpperCase()}</Text>
        </View>

        <View style={styles.topRight}>
          {pkg.destination ? (
            <View style={styles.destRow}>
              <Ionicons name="location-outline" size={18} color="#12966F" />
              <Text style={styles.destText}>{pkg.destination}</Text>
            </View>
          ) : null}
          {onEdit ? (
            <TouchableOpacity onPress={onEdit} style={styles.iconBtn} accessibilityLabel="Edit package">
              <Octicons name="pencil" size={18} color="#F59E0B" />
            </TouchableOpacity>
          ) : null}
          {onDelete ? (
            <TouchableOpacity onPress={onDelete} style={styles.iconBtn} accessibilityLabel="Delete package">
              <MaterialIcons name="delete-outline" size={21} color="#EF4444" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <Text style={styles.title}>{packageTitle(pkg)}</Text>

      <View style={styles.pickupRow}>
        <Ionicons name="navigate-outline" size={17} color="#12966F" />
        <Text style={styles.pickupText}>{pickupRangeText(pkg)}</Text>
      </View>

      {pickupTown && pickupKm != null ? (
        <View style={styles.yourTown}>
          <Ionicons name="checkmark-circle" size={14} color="#12966F" />
          <Text style={styles.yourTownText}>
            ~{pickupKm} km from {pickupTown}
          </Text>
        </View>
      ) : null}

      {shownPlaces.length > 0 ? (
        <Text style={styles.places}>
          {shownPlaces.join(" · ")}
          {morePlaces > 0 ? <Text style={styles.more}>{"\n"}+{morePlaces} more</Text> : null}
        </Text>
      ) : pkg.description ? (
        <Text style={styles.places} numberOfLines={2}>
          {pkg.description}
        </Text>
      ) : null}

      <View style={styles.divider} />

      {/* Trip info + price */}
      <View style={styles.bottomRow}>
        <View style={{ flex: 1, gap: 8 }}>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="calendar-month" size={18} color="#12966F" />
            <Text style={styles.metaText}>{tripLine || "Duration not set"}</Text>
          </View>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="bus" size={18} color="#12966F" />
            <Text style={styles.metaText}>{busLine || "Bus details not set"}</Text>
          </View>
          {pkg.extraKmPrice ? (
            <View style={styles.metaRow}>
              <MaterialCommunityIcons name="map-marker-distance" size={18} color="#12966F" />
              <Text style={styles.metaText}>Extra km · LKR {Number(pkg.extraKmPrice).toLocaleString()}/km</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.priceBox}>
          <Text style={styles.wholeBus}>Whole bus</Text>
          <Text style={styles.price}>
            <Text style={styles.currency}>LKR </Text>
            {Number(pkg.maxPrice || 0).toLocaleString()}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#94A3B8" style={{ marginLeft: 6 }} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    elevation: 3,
    shadowColor: "#1E293B",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  tierBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16 },
  tierText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.6 },
  topRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  destRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  destText: { color: "#173C79", fontWeight: "700", fontSize: 14 },
  iconBtn: { padding: 4, marginLeft: 2 },

  title: { marginTop: 12, fontSize: 18, fontWeight: "800", color: "#182B45" },
  pickupRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  pickupText: { color: "#155B8A", fontSize: 13.5, fontWeight: "600", flexShrink: 1 },
  yourTown: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    backgroundColor: "#E8F7F2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 6,
  },
  yourTownText: { color: "#12966F", fontSize: 11.5, fontWeight: "700" },
  places: { marginTop: 10, fontSize: 13, color: "#64748B", lineHeight: 20 },
  more: { color: "#12966F", fontWeight: "700" },

  divider: { height: 1, backgroundColor: "#EEF2F6", marginTop: 14, marginBottom: 12 },
  bottomRow: { flexDirection: "row", alignItems: "center" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  metaText: { color: "#475569", fontSize: 13, flexShrink: 1 },
  priceBox: { alignItems: "flex-end", marginLeft: 8 },
  wholeBus: { color: "#64748B", fontSize: 11.5 },
  currency: { fontSize: 12, fontWeight: "600", color: "#475569" },
  price: { fontSize: 20, fontWeight: "800", color: "#182B45", letterSpacing: -0.3 },
});
