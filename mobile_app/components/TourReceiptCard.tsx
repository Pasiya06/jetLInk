// Tour receipt shown as a ticket. Used by the passenger "Tour receipts" list
// (with a QR button) and the admin "All receipts" list (shows who booked).
import React, { useState } from "react";
import { LayoutAnimation, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { TIER_COLORS, getTier } from "./TourPackageCard";
import { getBusLabel } from "./BusName";

const C = {
  brand: "#155B8A",
  brandDark: "#173C79",
  brandSoft: "#EAF1FB",
  bg: "#F3F6FA",
  ink: "#0f1b2d",
  muted: "#5B6B7F",
  line: "#DCE3EC",
  success: "#0B6B53",
  successSoft: "#E3F5EE",
  neutral: "#475569",
  neutralSoft: "#e8edf3",
};

export interface TourReceipt {
  _id: string;
  receiptId: string;
  busNumber: string;
  driverNIC?: string;
  conductorNIC?: string;
  driverD?: string;
  conductorD?: string;
  isOnline?: boolean;
  date: string;
  pickup: string;
  time: string;
  packageId: string;
  description: string;
  packageType: string;
  totalDistance: number;
  tripDuration: string;
  maxPassengers: number;
  maxPrice: number;
  Pid?: string;
  Pid1?: string;
  pfirstName: string;
  plastName: string;
  pphoneNumber: string;
  pemail: string;
  extraKm?: number;
  extraKmAmount?: number;
  status?: "active" | "gone";
  tripEnd?: string;
  scanned?: boolean;
  scannedAt?: string | null;
  // Saved with the booking
  tripEndDate?: string;
  pNIC?: string;
  packageDetails?: {
    title?: string;
    destination?: string;
    packageType?: string;
    tripDuration?: string;
    totalDistance?: string;
    extraKmPrice?: number;
    places?: { name: string; description?: string; order?: number }[];
  };
  busDetails?: { busName?: string; noOfSeats?: string; colour?: string };
  payment?: { amount?: number; nameOnCard?: string; cardLast4?: string; paidAt?: string };
}

const money = (n?: number) => `Rs. ${Number(n || 0).toLocaleString()}`;

export default function TourReceiptCard({
  item,
  mode = "passenger",
  onShowQr,
  onOpenPackage,
  notchColor = C.bg,
}: {
  item: TourReceipt;
  /** passenger: QR button. admin: shows who booked, no QR */
  mode?: "passenger" | "admin";
  onShowQr?: () => void;
  onOpenPackage?: () => void;
  /** Must match the screen background so the ticket "cut-outs" look right */
  notchColor?: string;
}) {
  const [open, setOpen] = useState(false);
  const isAdmin = mode === "admin";
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((v) => !v);
  };

  const pkg: NonNullable<TourReceipt["packageDetails"]> = item.packageDetails || {};
  const bus: NonNullable<TourReceipt["busDetails"]> = item.busDetails || {};
  const pay: NonNullable<TourReceipt["payment"]> = item.payment || {};
  const passengerName = `${item.pfirstName || ""} ${item.plastName || ""}`.trim();
  const tier = getTier(pkg.packageType || item.packageType);
  const tc = TIER_COLORS[tier];
  const isGone = item.status === "gone";
  const title =
    pkg.title?.trim() ||
    (pkg.destination ? `${pkg.destination} ${tier} Tour` : `${tier} Tour Package`);
  const endDate = item.tripEndDate || item.tripEnd || "";
  const days = item.tripDuration || pkg.tripDuration || "";
  const packagePrice = Number(pay.amount || item.maxPrice || 0);
  const extraAmount = Number(item.extraKmAmount || 0);
  const total = packagePrice + extraAmount;
  const busName = bus.busName || getBusLabel(item.busNumber);
  const places = [...(pkg.places || [])].sort((x, y) => (x.order ?? 0) - (y.order ?? 0));
  const status = isGone
    ? item.scanned
      ? { text: "Boarded", fg: C.neutral, bg: C.neutralSoft, icon: "checkmark-circle" as const }
      : { text: "Completed", fg: C.neutral, bg: C.neutralSoft, icon: "flag" as const }
    : { text: "Confirmed", fg: C.success, bg: C.successSoft, icon: "shield-checkmark" as const };


  return (
    <View style={[rc.card, isGone && rc.cardGone]}>
      {/* Header band */}
      <LinearGradient
        colors={isGone ? ["#64748B", "#475569"] : ["#173C79", "#155B8A", "#159B79"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={rc.head}
      >
        <View style={rc.headTop}>
          <View style={[rc.tier, { backgroundColor: tc.pale, borderColor: tc.border }]}>
            <Ionicons name="diamond-outline" size={11} color={tc.main} />
            <Text style={[rc.tierText, { color: tc.main }]}>{tier.toUpperCase()}</Text>
          </View>
          <View style={[rc.status, { backgroundColor: status.bg }]}>
            <Ionicons name={status.icon} size={12} color={status.fg} />
            <Text style={[rc.statusText, { color: status.fg }]}>{status.text}</Text>
          </View>
        </View>
        <Text style={rc.title} numberOfLines={2}>{title}</Text>
        {pkg.destination ? (
          <View style={rc.destRow}>
            <Ionicons name="location" size={13} color="rgba(255,255,255,0.85)" />
            <Text style={rc.destText}>{pkg.destination}</Text>
          </View>
        ) : null}
        {isAdmin ? (
          <View style={rc.booker}>
            <View style={rc.bookerAvatar}>
              <Text style={rc.bookerInitials}>
                {(item.pfirstName?.[0] || "") + (item.plastName?.[0] || "") || "?"}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={rc.bookerName} numberOfLines={1}>{passengerName || "Passenger"}</Text>
              <Text style={rc.bookerSub} numberOfLines={1}>
                {[item.pphoneNumber, item.pemail].filter(Boolean).join("  ·  ")}
              </Text>
            </View>
          </View>
        ) : null}
      </LinearGradient>

      {/* Trip: pickup -> destination, dates */}
      <View style={rc.body}>
        <View style={rc.route}>
          <View style={{ flex: 1 }}>
            <Text style={rc.k}>PICKUP</Text>
            <Text style={rc.place} numberOfLines={2}>{item.pickup || "—"}</Text>
            <Text style={rc.sub}>{item.date}</Text>
            {item.time ? <Text style={rc.subTime}>{item.time}</Text> : null}
          </View>
          <View style={rc.routeMid}>
            <View style={rc.routeLine} />
            <View style={rc.routeBus}>
              <Ionicons name="bus" size={14} color="#FFFFFF" />
            </View>
            <View style={rc.routeLine} />
          </View>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text style={rc.k}>TRIP ENDS</Text>
            <Text style={[rc.place, { textAlign: "right" }]} numberOfLines={2}>
              {pkg.destination || "Return"}
            </Text>
            <Text style={[rc.sub, { textAlign: "right" }]}>{endDate || "—"}</Text>
            {days ? <Text style={[rc.subTime, { textAlign: "right" }]}>{days}</Text> : null}
          </View>
        </View>

        <View style={rc.grid}>
          <Info icon="bus-outline" label="Bus" value={busName} sub={bus.busName ? item.busNumber : undefined} />
          <Info icon="time-outline" label="Duration" value={days || "—"} />
          <Info
            icon="people-outline"
            label="Group size"
            value={item.maxPassengers ? `Up to ${item.maxPassengers}` : "—"}
            sub={bus.noOfSeats ? `${bus.noOfSeats} seats on bus` : undefined}
          />
          <Info
            icon="navigate-outline"
            label="Distance"
            value={item.totalDistance ? `${item.totalDistance} km` : pkg.totalDistance || "—"}
            sub={item.extraKm ? `+${item.extraKm} km extra` : undefined}
          />
        </View>
      </View>

      {/* Perforation */}
      <View style={rc.perf}>
        <View style={[rc.notch, rc.notchL, { backgroundColor: notchColor }]} />
        <View style={rc.dashes}>
          {Array.from({ length: 24 }).map((_, i) => (
            <View key={i} style={rc.dash} />
          ))}
        </View>
        <View style={[rc.notch, rc.notchR, { backgroundColor: notchColor }]} />
      </View>

      {/* Stub: receipt id + total paid */}
      <View style={rc.stub}>
        <View style={{ flex: 1 }}>
          <Text style={rc.k}>RECEIPT NO.</Text>
          <Text style={rc.receiptId} numberOfLines={1}>{item.receiptId}</Text>
          <Text style={rc.sub}>
            {pay.cardLast4 ? `Card •••• ${pay.cardLast4}` : "Paid by card"}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={rc.k}>TOTAL PAID</Text>
          <Text style={rc.total}>{money(total)}</Text>
          <View style={rc.paid}>
            <Ionicons name="checkmark-circle" size={12} color={C.success} />
            <Text style={rc.paidText}>Paid</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={rc.actions}>
        {!isGone && !isAdmin && onShowQr ? (
          <TouchableOpacity style={rc.qrBtn} onPress={onShowQr} activeOpacity={0.85}>
            <Ionicons name="qr-code-outline" size={18} color="#FFFFFF" />
            <Text style={rc.qrText}>Show QR code</Text>
          </TouchableOpacity>
        ) : !isGone ? (
          <View style={[rc.goneNote, { backgroundColor: C.successSoft }]}>
            <Ionicons name="time-outline" size={16} color={C.success} />
            <Text style={[rc.goneText, { color: C.success }]} numberOfLines={1}>
              Not boarded yet · starts {item.date}
            </Text>
          </View>
        ) : (
          <View style={rc.goneNote}>
            <Ionicons name={item.scanned ? "checkmark-done" : "flag-outline"} size={16} color={C.neutral} />
            <Text style={rc.goneText} numberOfLines={1}>
              {item.scanned
                ? `Boarded${item.scannedAt ? ` on ${new Date(item.scannedAt).toLocaleDateString()}` : ""}`
                : `Tour ended${endDate ? ` on ${endDate}` : ""}`}
            </Text>
          </View>
        )}
        <TouchableOpacity style={rc.moreBtn} onPress={toggle} activeOpacity={0.8}>
          <Text style={rc.moreText}>{open ? "Less" : "Details"}</Text>
          <Ionicons name={open ? "chevron-up" : "chevron-down"} size={16} color={C.brand} />
        </TouchableOpacity>
      </View>

      {/* Expandable details */}
      {open && (
        <View style={rc.details}>
          {places.length > 0 && (
            <Section title={`Itinerary · ${places.length} place${places.length === 1 ? "" : "s"}`} icon="map-outline">
              {places.map((pl, i) => (
                <View key={`${pl.name}-${i}`} style={rc.stop}>
                  <View style={rc.stopRail}>
                    <View style={rc.stopDot}>
                      <Text style={rc.stopNum}>{i + 1}</Text>
                    </View>
                    {i < places.length - 1 && <View style={rc.stopLine} />}
                  </View>
                  <View style={{ flex: 1, paddingBottom: 12 }}>
                    <Text style={rc.stopName}>{pl.name}</Text>
                    {pl.description ? <Text style={rc.stopDesc}>{pl.description}</Text> : null}
                  </View>
                </View>
              ))}
            </Section>
          )}

          <Section title="Payment" icon="card-outline">
            <Detail label="Package price" value={money(packagePrice)} />
            {extraAmount > 0 && <Detail label={`Extra ${item.extraKm || 0} km`} value={money(extraAmount)} />}
            {pkg.extraKmPrice ? <Detail label="Extra km rate" value={`${money(pkg.extraKmPrice)} / km`} /> : null}
            <Detail label="Card" value={pay.cardLast4 ? `${pay.nameOnCard || "Card"} •••• ${pay.cardLast4}` : undefined} />
            <Detail label="Paid on" value={pay.paidAt ? new Date(pay.paidAt).toLocaleString() : undefined} />
            <View style={rc.totalRow}>
              <Text style={rc.totalLabel}>Total</Text>
              <Text style={rc.totalValue}>{money(total)}</Text>
            </View>
          </Section>

          <Section title="Bus & crew" icon="bus-outline">
            <Detail label="Bus" value={bus.busName ? `${bus.busName} (${item.busNumber})` : item.busNumber} />
            <Detail label="Seats" value={bus.noOfSeats} />
            <Detail label="Driver" value={item.driverD} />
            <Detail label="Conductor" value={item.conductorD} />
          </Section>

          <Section title="Passenger" icon="person-outline" last>
            <Detail label="Name" value={`${item.pfirstName || ""} ${item.plastName || ""}`.trim()} />
            <Detail label="Phone" value={item.pphoneNumber} />
            <Detail label="Email" value={item.pemail} />
            <Detail label="NIC" value={item.pNIC} />
          </Section>

          {onOpenPackage ? (
            <TouchableOpacity style={rc.pkgLink} onPress={onOpenPackage} activeOpacity={0.8}>
              <Ionicons name="cube-outline" size={16} color={C.brand} />
              <Text style={rc.pkgLinkText}>Open package page</Text>
              <Ionicons name="chevron-forward" size={16} color={C.brand} />
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </View>
  );
}

function Info({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <View style={rc.info}>
      <View style={rc.infoIcon}>
        <Ionicons name={icon} size={15} color={C.brand} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={rc.infoLabel}>{label}</Text>
        <Text style={rc.infoValue} numberOfLines={1}>{value}</Text>
        {sub ? <Text style={rc.infoSub} numberOfLines={1}>{sub}</Text> : null}
      </View>
    </View>
  );
}

const RC_NOTCH = 22;
const rc = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    marginBottom: 16,
    shadowColor: "#0F1B2D",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  cardGone: { opacity: 0.94 },
  head: { borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 16, paddingBottom: 18 },
  headTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tier: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  tierText: { fontSize: 10.5, fontWeight: "800", letterSpacing: 1 },
  status: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: "800" },
  title: { color: "#FFFFFF", fontSize: 20, fontWeight: "800", marginTop: 12, letterSpacing: 0.2 },
  destRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  destText: { color: "rgba(255,255,255,0.88)", fontSize: 13, fontWeight: "600" },

  body: { padding: 16, paddingBottom: 10 },
  route: { flexDirection: "row", alignItems: "flex-start" },
  routeMid: { width: 70, flexDirection: "row", alignItems: "center", marginHorizontal: 6, marginTop: 16 },
  routeLine: { flex: 1, height: 2, backgroundColor: "#D6E2F0", borderRadius: 1 },
  routeBus: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.brand, alignItems: "center", justifyContent: "center" },
  k: { fontSize: 10.5, fontWeight: "800", color: C.muted, letterSpacing: 1 },
  place: { fontSize: 15.5, fontWeight: "800", color: C.ink, marginTop: 3, textTransform: "capitalize" },
  sub: { fontSize: 12, fontWeight: "600", color: C.muted, marginTop: 3 },
  subTime: { fontSize: 12, fontWeight: "700", color: C.brand, marginTop: 1 },

  grid: { flexDirection: "row", flexWrap: "wrap", marginTop: 16, rowGap: 12 },
  info: { width: "50%", flexDirection: "row", alignItems: "flex-start", gap: 9, paddingRight: 8 },
  infoIcon: { width: 30, height: 30, borderRadius: 10, backgroundColor: C.brandSoft, alignItems: "center", justifyContent: "center" },
  infoLabel: { fontSize: 11, fontWeight: "700", color: C.muted },
  infoValue: { fontSize: 13.5, fontWeight: "800", color: C.ink, marginTop: 1 },
  infoSub: { fontSize: 11, fontWeight: "600", color: C.muted, marginTop: 1 },

  perf: { flexDirection: "row", alignItems: "center", marginVertical: 4 },
  notch: { width: RC_NOTCH, height: RC_NOTCH, borderRadius: RC_NOTCH / 2, backgroundColor: C.bg },
  notchL: { marginLeft: -RC_NOTCH / 2 },
  notchR: { marginRight: -RC_NOTCH / 2 },
  dashes: { flex: 1, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 6 },
  dash: { width: 6, height: 2, borderRadius: 1, backgroundColor: C.line },

  stub: { flexDirection: "row", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  receiptId: { fontSize: 15, fontWeight: "800", color: C.brandDark, letterSpacing: 1, marginTop: 3, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" },
  total: { fontSize: 20, fontWeight: "800", color: C.ink, marginTop: 2 },
  paid: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  paidText: { fontSize: 12, fontWeight: "800", color: C.success },

  actions: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16, paddingTop: 12 },
  qrBtn: { flex: 1, height: 44, borderRadius: 14, backgroundColor: C.brand, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  qrText: { color: "#FFFFFF", fontSize: 14.5, fontWeight: "800" },
  goneNote: { flex: 1, height: 44, borderRadius: 14, backgroundColor: C.neutralSoft, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: 10 },
  goneText: { color: C.neutral, fontSize: 13, fontWeight: "700" },
  moreBtn: { height: 44, paddingHorizontal: 14, borderRadius: 14, backgroundColor: C.brandSoft, flexDirection: "row", alignItems: "center", gap: 4 },
  moreText: { color: C.brand, fontSize: 13.5, fontWeight: "800" },

  details: { borderTopWidth: 1, borderTopColor: "#EDF1F6", paddingHorizontal: 16, paddingBottom: 14 },
  stop: { flexDirection: "row", gap: 10 },
  stopRail: { alignItems: "center", width: 24 },
  stopDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: C.successSoft, alignItems: "center", justifyContent: "center" },
  stopNum: { fontSize: 11.5, fontWeight: "800", color: C.success },
  stopLine: { flex: 1, width: 2, backgroundColor: "#D7EDE5", marginVertical: 2 },
  stopName: { fontSize: 14, fontWeight: "800", color: C.ink, marginTop: 3 },
  stopDesc: { fontSize: 12.5, color: C.muted, marginTop: 2, lineHeight: 17 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#EDF1F6", borderStyle: "dashed" },
  totalLabel: { fontSize: 14, fontWeight: "800", color: C.ink },
  totalValue: { fontSize: 16, fontWeight: "800", color: C.brandDark },
  pkgLink: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12, height: 42, borderRadius: 12, borderWidth: 1.5, borderColor: C.brandSoft },
  pkgLinkText: { color: C.brand, fontSize: 13.5, fontWeight: "800" },

  booker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    padding: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  bookerAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  bookerInitials: { color: C.brandDark, fontSize: 13, fontWeight: "800" },
  bookerName: { color: "#FFFFFF", fontSize: 14.5, fontWeight: "800" },
  bookerSub: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: "600", marginTop: 1 },

  // Detail sections
  section: { paddingVertical: 12 },
  sectionDivider: { borderBottomWidth: 1, borderBottomColor: C.line },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  sectionIcon: { width: 24, height: 24, borderRadius: 8, backgroundColor: C.brandSoft, alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: C.ink },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, gap: 12 },
  label: { flex: 1, color: C.muted, fontSize: 13 },
  value: { flex: 1.3, textAlign: "right", color: C.ink, fontSize: 13, fontWeight: "600" },
  valueEmpty: { color: "#a0aec0", fontWeight: "400" },
});


function Section({
  title,
  icon,
  children,
  last,
}: {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <View style={[rc.section, !last && rc.sectionDivider]}>
      <View style={rc.sectionHeader}>
        <View style={rc.sectionIcon}>
          <Ionicons name={icon} size={14} color={C.brand} />
        </View>
        <Text style={rc.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function Detail({ label, value }: { label: string; value?: string | number | null }) {
  const empty = value === undefined || value === null || value === "";
  return (
    <View style={rc.detailRow}>
      <Text style={rc.label}>{label}</Text>
      <Text style={[rc.value, empty && rc.valueEmpty]}>{empty ? "N/A" : String(value)}</Text>
    </View>
  );
}
