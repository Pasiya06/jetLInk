import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { C, GRADIENT } from "./JetUI";
import { BusStatusNotice, isBusBlocked } from "./BusStatus";

/**
 * Shared bus card used by the admin fleet list and the passenger tour bus picker.
 *
 *  ┌─▌───────────────────────────────────────────┐
 *  │ ▌ [bus]  Jetlink Express          ● Online  │
 *  │ ▌        [ NB-1234 ]                        │
 *  │ ▌  54 seats   ● Green   Tour                │
 *  │ ▌ ───────────────────────────────────────── │
 *  │ ▌ footer (actions)                          │
 *  └─▌───────────────────────────────────────────┘
 */

export type BusTone = "green" | "grey" | "red" | "blue";

const TONES: Record<BusTone, { fg: string; bg: string; dot: string }> = {
  green: { fg: C.green, bg: C.greenSoft, dot: "#22C55E" },
  grey: { fg: C.muted, bg: "#EEF2F7", dot: "#9AA6B6" },
  red: { fg: C.red, bg: C.redSoft, dot: C.red },
  blue: { fg: C.blue, bg: C.blueSoft, dot: C.blue },
};

// Common colour names -> swatch colour. Unknown names show a neutral swatch.
const SWATCH: Record<string, string> = {
  RED: "#D33A2C", MAROON: "#7A1F1F", GREEN: "#1E9E5A", DARKGREEN: "#14633A",
  BLUE: "#2563EB", DARKBLUE: "#1E3A8A", NAVY: "#1E2F5C", SKYBLUE: "#38BDF8",
  YELLOW: "#F5C518", ORANGE: "#F08A24", WHITE: "#FFFFFF", BLACK: "#1B1B1B",
  SILVER: "#C0C6CF", GREY: "#8A94A3", GRAY: "#8A94A3", BROWN: "#7B4A2A",
  PURPLE: "#7C3AED", PINK: "#EC4899", GOLD: "#C9A227", CREAM: "#F3E9D2",
};

const TYPE_LABEL: Record<string, string> = {
  NormalWay: "Normal way",
  Highway: "Highway",
  tour: "Tour",
};

export type BusCardBus = {
  busNumber: string;
  busName?: string;
  noOfSeats?: string | number;
  colour?: string;
  busType?: string;
  status?: string;
  emergency?: boolean;
  emergencyAt?: string;
};

export default function BusCard({
  bus,
  statusLabel,
  tone = "blue",
  onPress,
  footer,
  blockedNote,
  disabled,
}: {
  bus: BusCardBus;
  statusLabel: string;
  tone?: BusTone;
  onPress?: () => void;
  footer?: React.ReactNode;
  blockedNote?: string;
  disabled?: boolean;
}) {
  const blocked = isBusBlocked(bus);
  const t = TONES[blocked ? "red" : tone];
  const title = bus.busName?.trim() || bus.busNumber;
  const colourKey = String(bus.colour || "").replace(/\s/g, "").toUpperCase();
  const swatch = SWATCH[colourKey];
  const seats = String(bus.noOfSeats ?? "").trim();
  const typeLabel = bus.busType ? TYPE_LABEL[bus.busType] ?? bus.busType : "";

  return (
    <TouchableOpacity
      style={[styles.card, blocked && styles.cardBlocked]}
      onPress={onPress}
      activeOpacity={disabled ? 1 : 0.88}
      accessibilityRole="button"
      accessibilityLabel={`${title}, bus ${bus.busNumber}, ${statusLabel}`}
    >
      <View style={[styles.accent, { backgroundColor: t.dot }]} />

      <View style={styles.inner}>
        {/* Top: icon, name + plate, status */}
        <View style={styles.top}>
          <LinearGradient
            colors={blocked ? ["#C2410C", C.red] : GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.icon}
          >
            <MaterialCommunityIcons name="bus-side" size={26} color="#FFFFFF" />
          </LinearGradient>

          <View style={styles.titleWrap}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {bus.busName?.trim() ? (
              <View style={styles.plate}>
                <Text style={styles.plateText}>{bus.busNumber}</Text>
              </View>
            ) : (
              <Text style={styles.noName}>No name set</Text>
            )}
          </View>

          <View style={[styles.status, { backgroundColor: t.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: t.dot }]} />
            <Text style={[styles.statusText, { color: t.fg }]} numberOfLines={1}>
              {blocked ? "Unavailable" : statusLabel}
            </Text>
          </View>
        </View>

        {/* Specs */}
        {(seats || bus.colour || typeLabel) ? (
          <View style={styles.specs}>
            {seats ? (
              <View style={styles.spec}>
                <MaterialCommunityIcons name="seat-passenger" size={15} color={C.blue} />
                <Text style={styles.specText}>
                  <Text style={styles.specStrong}>{seats}</Text> seats
                </Text>
              </View>
            ) : null}
            {bus.colour ? (
              <View style={styles.spec}>
                <View
                  style={[
                    styles.swatch,
                    { backgroundColor: swatch ?? "#D5DBE3" },
                    colourKey === "WHITE" && { borderColor: "#CBD3DD" },
                  ]}
                />
                <Text style={styles.specText}>{titleCase(bus.colour)}</Text>
              </View>
            ) : null}
            {typeLabel ? (
              <View style={styles.spec}>
                <Ionicons name="navigate-outline" size={14} color={C.blue} />
                <Text style={styles.specText}>{typeLabel}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {blocked ? (
          <View style={{ marginTop: 12 }}>
            <BusStatusNotice item={bus} note={blockedNote} />
          </View>
        ) : null}

        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </TouchableOpacity>
  );
}

/* Small action button for card footers */
export function BusCardAction({
  icon,
  label,
  onPress,
  tone = "blue",
  accessibilityLabel,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label?: string;
  onPress?: () => void;
  tone?: BusTone;
  accessibilityLabel?: string;
}) {
  const t = TONES[tone];
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.action, { backgroundColor: t.bg }, !label && styles.actionIcon]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      hitSlop={6}
    >
      <Ionicons name={icon} size={18} color={t.fg} />
      {label ? <Text style={[styles.actionText, { color: t.fg }]}>{label}</Text> : null}
    </TouchableOpacity>
  );
}

const titleCase = (s: string) =>
  String(s)
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: C.card,
    borderRadius: 20,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#0F1B2D",
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardBlocked: { borderWidth: 1, borderColor: C.redBorder },
  accent: { width: 5 },
  inner: { flex: 1, padding: 14, paddingLeft: 13 },

  top: { flexDirection: "row", alignItems: "center" },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: { flex: 1, marginLeft: 12, marginRight: 8 },
  title: { fontSize: 17, fontWeight: "800", color: C.ink, letterSpacing: 0.2 },
  plate: {
    alignSelf: "flex-start",
    marginTop: 5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#1F2A3A",
    backgroundColor: "#FFF8D6",
  },
  noName: { fontSize: 12, fontWeight: "600", color: C.chevron, marginTop: 4, fontStyle: "italic" },
  plateText: { fontSize: 12, fontWeight: "800", color: "#1F2A3A", letterSpacing: 1.2 },

  status: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    maxWidth: 120,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: "800" },

  specs: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  spec: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F5F8FC",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  specText: { fontSize: 12.5, fontWeight: "600", color: C.muted },
  specStrong: { fontWeight: "800", color: C.ink },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  action: {
    height: 38,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionIcon: { width: 38, paddingHorizontal: 0 },
  actionText: { fontSize: 13, fontWeight: "800" },
});
