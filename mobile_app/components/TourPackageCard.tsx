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
  Silver: { main: "#5B6B7F", pale: "#F3F6FA", border: "#CBD5E1" },
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
      {/* Tier colour strip */}
      <View style={[styles.strip, { backgroundColor: colors.border }]} />

      <View style={styles.inner}>
        {/* Tier + destination */}
        <View style={styles.topRow}>
          <View style={[styles.tierBadge, { backgroundColor: colors.pale, borderColor: colors.border }]}>
            <MaterialCommunityIcons
              name={tier === "Diamond" ? "diamond-stone" : tier === "Gold" ? "crown" : "medal"}
              size={13}
              color={colors.main}
            />
            <Text style={[styles.tierText, { color: colors.main }]}>{tier.toUpperCase()}</Text>
          </View>

          <View style={styles.topRight}>
            {pkg.destination ? (
              <View style={styles.destRow}>
                <Ionicons name="location" size={14} color="#0B6B53" />
                <Text style={styles.destText} numberOfLines={1}>{pkg.destination}</Text>
              </View>
            ) : null}
            {onEdit ? (
              <TouchableOpacity onPress={onEdit} style={[styles.iconBtn, { backgroundColor: "#FFF4DC" }]} accessibilityLabel="Edit package">
                <Octicons name="pencil" size={16} color="#B26A00" />
              </TouchableOpacity>
            ) : null}
            {onDelete ? (
              <TouchableOpacity onPress={onDelete} style={[styles.iconBtn, { backgroundColor: "#FDE2E2" }]} accessibilityLabel="Delete package">
                <MaterialIcons name="delete-outline" size={19} color="#B42318" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <Text style={styles.title}>{packageTitle(pkg)}</Text>

        <View style={styles.pickupRow}>
          <Ionicons name="navigate" size={14} color="#155B8A" />
          <Text style={styles.pickupText}>{pickupRangeText(pkg)}</Text>
        </View>

        {pickupTown && pickupKm != null ? (
          <View style={styles.yourTown}>
            <Ionicons name="checkmark-circle" size={14} color="#0B6B53" />
            <Text style={styles.yourTownText}>
              ~{pickupKm} km from {pickupTown}
            </Text>
          </View>
        ) : null}

        {shownPlaces.length > 0 ? (
          <View style={styles.placeWrap}>
            {shownPlaces.map((name, i) => (
              <View key={`${name}-${i}`} style={styles.placeChip}>
                <Text style={styles.placeChipText} numberOfLines={1}>{name}</Text>
              </View>
            ))}
            {morePlaces > 0 ? (
              <View style={[styles.placeChip, styles.moreChip]}>
                <Text style={styles.more}>+{morePlaces} more</Text>
              </View>
            ) : null}
          </View>
        ) : pkg.description ? (
          <Text style={styles.places} numberOfLines={2}>
            {pkg.description}
          </Text>
        ) : null}

        {/* Trip info */}
        <View style={styles.metaWrap}>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="calendar-month" size={16} color="#155B8A" />
            <Text style={styles.metaText}>{tripLine || "Duration not set"}</Text>
          </View>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="bus" size={16} color="#155B8A" />
            <Text style={styles.metaText}>{busLine || "Bus details not set"}</Text>
          </View>
          {pkg.extraKmPrice ? (
            <View style={styles.metaRow}>
              <MaterialCommunityIcons name="map-marker-distance" size={16} color="#155B8A" />
              <Text style={styles.metaText}>Extra km · LKR {Number(pkg.extraKmPrice).toLocaleString()}/km</Text>
            </View>
          ) : null}
        </View>

        {/* Price */}
        <View style={styles.bottomRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.wholeBus}>Whole bus</Text>
            <Text style={styles.price}>
              <Text style={styles.currency}>LKR </Text>
              {Number(pkg.maxPrice || 0).toLocaleString()}
            </Text>
          </View>
          {onPress ? (
            <View style={styles.viewBtn}>
              <Text style={styles.viewText}>View</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    marginBottom: 14,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#0F1B2D",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  strip: { height: 5, width: "100%" },
  inner: { padding: 18 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  tierText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.8 },
  topRight: { flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1, marginLeft: 10 },
  destRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E3F5EE",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    flexShrink: 1,
  },
  destText: { color: "#0B6B53", fontWeight: "700", fontSize: 13, flexShrink: 1 },
  iconBtn: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },

  title: { marginTop: 14, fontSize: 19, fontWeight: "800", color: "#0F1B2D", letterSpacing: -0.2 },
  pickupRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  pickupText: { color: "#155B8A", fontSize: 13.5, fontWeight: "600", flexShrink: 1 },
  yourTown: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    backgroundColor: "#E3F5EE",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 8,
  },
  yourTownText: { color: "#0B6B53", fontSize: 11.5, fontWeight: "700" },
  places: { marginTop: 10, fontSize: 13, color: "#5B6B7F", lineHeight: 20 },
  placeWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
  placeChip: {
    backgroundColor: "#F3F6FA",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    maxWidth: "100%",
  },
  placeChipText: { fontSize: 12, fontWeight: "600", color: "#0F1B2D" },
  moreChip: { backgroundColor: "#EAF1FB" },
  more: { color: "#155B8A", fontWeight: "700", fontSize: 12 },

  metaWrap: {
    marginTop: 14,
    backgroundColor: "#F7F9FC",
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  metaText: { color: "#5B6B7F", fontSize: 13, fontWeight: "500", flexShrink: 1 },

  bottomRow: { flexDirection: "row", alignItems: "center", marginTop: 14 },
  wholeBus: { color: "#5B6B7F", fontSize: 12, fontWeight: "600" },
  currency: { fontSize: 13, fontWeight: "700", color: "#5B6B7F" },
  price: { fontSize: 22, fontWeight: "800", color: "#173C79", letterSpacing: -0.3, marginTop: 1 },
  viewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#155B8A",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  viewText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
});
