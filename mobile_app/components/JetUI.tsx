// Shared JetLink UI pieces for the redesigned screens.
// Header gradient, nav bar and footer colours are the same as before.
import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleProp,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export const GRADIENT = ["#173C79", "#155B8A", "#159B79"] as const;

export const C = {
  bg: "#F3F6FA",
  card: "#FFFFFF",
  ink: "#0F1B2D",
  muted: "#5B6B7F",
  chevron: "#8A97A8",
  navy: "#173C79",
  blue: "#155B8A",
  blueSoft: "#EAF1FB",
  green: "#0B6B53",
  greenSoft: "#E3F5EE",
  amber: "#B26A00",
  amberSoft: "#FFF4DC",
  purple: "#6D3FD6",
  purpleSoft: "#F0EBFE",
  pink: "#B0306A",
  pinkSoft: "#FCE8F1",
  red: "#B42318",
  redSoft: "#FDE2E2",
  redTint: "#FFF5F5",
  redBorder: "#F7D4D4",
  lime: "#4A7A12",
  limeSoft: "#EDF7DF",
  line: "#EDF1F6",
};

// Space to leave at the bottom of scrolling content so the nav bar never covers it
export const NAV_SPACE = 190;

/* ---------- Header ---------- */
export function ScreenHeader({
  title,
  eyebrow,
  right,
  center,
}: {
  title: string;
  eyebrow?: string;
  right?: React.ReactNode;
  center?: boolean;
}) {
  return (
    <LinearGradient
      colors={GRADIENT}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={ui.header}
    >
      <View style={[ui.headerRow, center && { justifyContent: "center" }]}>
        <View style={center ? { alignItems: "center" } : { flex: 1 }}>
          {eyebrow ? (
            <Text style={ui.eyebrow} numberOfLines={1}>
              {eyebrow}
            </Text>
          ) : null}
          <Text style={ui.headerTitle} numberOfLines={1}>
            {title}
          </Text>
        </View>
        {right}
      </View>
    </LinearGradient>
  );
}

export function HeaderIconButton({
  icon,
  onPress,
  label,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  onPress?: () => void;
  label: string;
}) {
  return (
    <TouchableOpacity
      style={ui.headerBtn}
      onPress={onPress}
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={22} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

/* ---------- Small building blocks ---------- */
export function IconBox({
  children,
  bg,
  size = 48,
  radius,
}: {
  children: React.ReactNode;
  bg: string;
  size?: number;
  radius?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius ?? Math.round(size / 3.2),
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </View>
  );
}

export function SectionLabel({
  children,
  right,
  style,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[ui.sectionRow, style]}>
      <Text style={ui.sectionLabel}>{children}</Text>
      {right}
    </View>
  );
}

export function Pill({
  text,
  bg = C.blueSoft,
  color = C.blue,
}: {
  text: string;
  bg?: string;
  color?: string;
}) {
  return (
    <View style={[ui.pill, { backgroundColor: bg }]}>
      <Text style={[ui.pillText, { color }]}>{text}</Text>
    </View>
  );
}

export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const initials =
    String(name || "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "?";
  return (
    <LinearGradient
      colors={GRADIENT}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: size * 0.36 }}>
        {initials}
      </Text>
    </LinearGradient>
  );
}

/* ---------- Cards ---------- */

// Big feature card: icon on top, title + subtitle, footer link
export function FeatureCard({
  icon,
  iconBg,
  title,
  subtitle,
  cta = "Open",
  tag,
  onPress,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle?: string;
  cta?: string;
  tag?: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={[ui.card, ui.featureCard]} onPress={onPress} activeOpacity={0.85}>
      <View style={ui.featureTop}>
        <IconBox bg={iconBg} size={58}>
          {icon}
        </IconBox>
        {tag}
      </View>
      <Text style={ui.featureTitle}>{title}</Text>
      {subtitle ? <Text style={ui.featureSub}>{subtitle}</Text> : null}
      <View style={ui.featureFoot}>
        <Text style={ui.featureCta}>{cta}</Text>
        <View style={ui.arrowDot}>
          <Ionicons name="arrow-forward" size={18} color={C.blue} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// List row: icon, title, subtitle, chevron
export function RowCard({
  icon,
  iconBg,
  title,
  subtitle,
  onPress,
  right,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      style={[ui.card, ui.rowCard]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={!onPress}
    >
      <IconBox bg={iconBg} size={50}>
        {icon}
      </IconBox>
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={ui.rowTitle}>{title}</Text>
        {subtitle ? <Text style={ui.rowSub}>{subtitle}</Text> : null}
      </View>
      {right ?? <Ionicons name="chevron-forward" size={20} color={C.chevron} />}
    </TouchableOpacity>
  );
}

// Grid tile (use two per row)
export function Tile({
  icon,
  iconBg,
  title,
  subtitle,
  onPress,
  danger,
  compact,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  danger?: boolean;
  compact?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        ui.card,
        compact ? ui.tileCompact : ui.tile,
        danger && { backgroundColor: C.redTint, borderWidth: 1.5, borderColor: C.redBorder, elevation: 0, shadowOpacity: 0 },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <IconBox bg={iconBg} size={compact ? 44 : 44}>
        {icon}
      </IconBox>
      <View style={compact ? { marginLeft: 12, flex: 1 } : undefined}>
        <Text style={[ui.tileTitle, danger && { color: C.red }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[ui.tileSub, danger && { color: "#7A2E2E" }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

// Gradient call-to-action card
export function GradientAction({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={ui.gradShadow}>
      <LinearGradient
        colors={GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={ui.gradAction}
      >
        <View style={ui.gradIcon}>{icon}</View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={ui.gradTitle}>{title}</Text>
          {subtitle ? <Text style={ui.gradSub}>{subtitle}</Text> : null}
        </View>
        <Ionicons name="chevron-forward" size={22} color="#FFFFFF" />
      </LinearGradient>
    </TouchableOpacity>
  );
}

// Full-width gradient button
export function GradientButton({
  label,
  onPress,
  icon,
  disabled,
  style,
}: {
  label: React.ReactNode;
  onPress?: () => void;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.88}
      style={[ui.gradBtnWrap, disabled && { opacity: 0.6 }, style]}
    >
      <LinearGradient
        colors={GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={ui.gradBtn}
      >
        {icon ? <Ionicons name={icon} size={20} color="#FFFFFF" style={{ marginRight: 8 }} /> : null}
        {typeof label === "string" ? <Text style={ui.gradBtnText}>{label}</Text> : label}
      </LinearGradient>
    </TouchableOpacity>
  );
}

// Search field shown under the header
export function SearchBox({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
}) {
  return (
    <View style={[ui.card, ui.search]}>
      <Ionicons name="search" size={20} color={C.muted} />
      <TextInput
        style={ui.searchInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#7A8799"
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel={placeholder}
      />
      {value ? (
        <TouchableOpacity onPress={() => onChangeText("")} accessibilityLabel="Clear search">
          <Ionicons name="close-circle" size={20} color={C.chevron} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={[ui.card, ui.empty]}>
      <IconBox bg={C.amberSoft} size={64} radius={32}>
        {icon}
      </IconBox>
      <Text style={ui.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={ui.emptySub}>{subtitle}</Text> : null}
    </View>
  );
}

// Parcel list row: id, route, date/time, bus number
export function ParcelRow({
  id,
  from,
  to,
  date,
  time,
  bus,
  delivered,
  showChevron = true,
  kind = "parcel",
  status,
  muted,
}: {
  id?: string;
  from?: string;
  to?: string;
  date?: string;
  time?: string;
  bus?: string;
  delivered?: boolean;
  showChevron?: boolean;
  kind?: "parcel" | "ticket";
  status?: string; // optional tag, e.g. "Active" / "Used"
  muted?: boolean; // grey look for used / past items
}) {
  const when = [date, time].filter(Boolean).join(" · ");
  const icon = delivered ? "checkmark-done" : kind === "ticket" ? "ticket-outline" : "gift-outline";
  const tone = muted
    ? { bg: "#EEF2F7", fg: C.muted }
    : delivered
    ? { bg: C.greenSoft, fg: C.green }
    : kind === "ticket"
    ? { bg: C.blueSoft, fg: C.blue }
    : { bg: C.amberSoft, fg: C.amber };
  return (
    <View style={[ui.card, ui.parcelRow]}>
      <IconBox bg={tone.bg} size={48}>
        <Ionicons name={icon} size={24} color={tone.fg} />
      </IconBox>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <View style={ui.parcelTop}>
          <Text style={[ui.parcelId, muted && { color: C.muted }]}>{id}</Text>
          {status ? (
            <Pill
              text={status}
              bg={muted ? "#EEF2F7" : C.greenSoft}
              color={muted ? C.muted : C.green}
            />
          ) : delivered ? (
            <Pill text="Delivered" bg={C.greenSoft} color={C.green} />
          ) : bus ? (
            <Pill text={bus} />
          ) : null}
        </View>
        <View style={ui.parcelRoute}>
          <Text style={ui.parcelPlace} numberOfLines={1}>
            {from}
          </Text>
          <Ionicons name="arrow-forward" size={15} color="#159B79" style={{ marginHorizontal: 6 }} />
          <Text style={[ui.parcelPlace, { flexShrink: 1 }]} numberOfLines={1}>
            {to}
          </Text>
        </View>
        <View style={ui.parcelMeta}>
          <Ionicons name="time-outline" size={13} color={C.muted} />
          <Text style={ui.parcelMetaText}>
            {when}
            {(delivered || status) && bus ? ` · ${bus}` : ""}
          </Text>
        </View>
      </View>
      {showChevron ? <Ionicons name="chevron-forward" size={18} color={C.chevron} /> : null}
    </View>
  );
}

export const ui = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingTop: 54,
    paddingHorizontal: 24,
    paddingBottom: 80,
  },
  headerRow: { flexDirection: "row", alignItems: "flex-start" },
  eyebrow: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  headerTitle: { fontSize: 28, fontWeight: "800", color: "#FFFFFF" },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  // Content area that overlaps the header
  body: { flex: 1, marginTop: -64 },
  bodyContent: { paddingHorizontal: 16, paddingBottom: NAV_SPACE, gap: 14 },

  card: {
    backgroundColor: C.card,
    borderRadius: 20,
    shadowColor: "#0F1B2D",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    marginHorizontal: 4,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: C.muted,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  pillText: { fontSize: 12, fontWeight: "700" },

  featureCard: { padding: 20, borderRadius: 24 },
  featureTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  featureTitle: { fontSize: 21, fontWeight: "800", color: C.ink },
  featureSub: { fontSize: 14, fontWeight: "500", color: C.muted, marginTop: 4 },
  featureFoot: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  featureCta: { fontSize: 14, fontWeight: "700", color: C.blue },
  arrowDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.blueSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  rowCard: { flexDirection: "row", alignItems: "center", padding: 16 },
  rowTitle: { fontSize: 17, fontWeight: "800", color: C.ink },
  rowSub: { fontSize: 13, fontWeight: "500", color: C.muted, marginTop: 2 },

  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12 },
  tile: {
    width: "48.3%",
    height: 112,
    padding: 16,
    justifyContent: "space-between",
  },
  tileCompact: {
    width: "48.3%",
    height: 84,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  tileTitle: { fontSize: 16, fontWeight: "800", color: C.ink },
  tileSub: { fontSize: 12, fontWeight: "500", color: C.muted, marginTop: 2 },

  gradShadow: {
    borderRadius: 20,
    shadowColor: "#155B8A",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  gradAction: {
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  gradIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  gradTitle: { fontSize: 17, fontWeight: "800", color: "#FFFFFF" },
  gradSub: { fontSize: 13, fontWeight: "500", color: "rgba(255,255,255,0.88)", marginTop: 2 },

  gradBtnWrap: {
    borderRadius: 27,
    overflow: "hidden",
    shadowColor: "#155B8A",
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  gradBtn: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  gradBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },

  search: {
    height: 54,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15, color: C.ink, height: "100%" },

  parcelRow: { flexDirection: "row", alignItems: "center", padding: 14, marginBottom: 10 },
  parcelTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  parcelId: { fontSize: 17, fontWeight: "800", color: C.navy },
  parcelRoute: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  parcelPlace: { fontSize: 14, fontWeight: "700", color: C.ink, textTransform: "capitalize" },
  parcelMeta: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  parcelMetaText: { fontSize: 12, fontWeight: "500", color: C.muted },

  empty: { padding: 28, alignItems: "center", gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: "800", color: C.ink, marginTop: 4 },
  emptySub: { fontSize: 14, color: C.muted, textAlign: "center" },
});
