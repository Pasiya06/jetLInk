import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  BackHandler,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { C } from "./JetUI";

/**
 * Search bar opened from the "Search" button in the bottom nav.
 *
 *  - Shows matching app pages (tap to open). Login details are passed on automatically.
 *  - On list screens the same text also filters the list (the screen does that with `query`).
 */

export type SearchRole = "passenger" | "staff" | "admin";

type Page = {
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  pathname: string;
  keywords?: string;
  extra?: Record<string, string>;
};

const PAGES: Record<SearchRole, Page[]> = {
  passenger: [
    { title: "Home", subtitle: "Passenger home", icon: "home-outline", pathname: "/passenger/index1", keywords: "main start dashboard" },
    { title: "Search buses", subtitle: "Find a bus and book seats", icon: "bus-outline", pathname: "/passenger/dailyBuses/searchBus", keywords: "bus book seat ticket route daily highway normal timetable travel" },
    { title: "Parcels", subtitle: "Send or track a parcel", icon: "cube-outline", pathname: "/passenger/parcel/index1", keywords: "parcel package delivery courier" },
    { title: "Send a parcel", subtitle: "Send a parcel on the next bus", icon: "send-outline", pathname: "/passenger/parcel/index2", keywords: "parcel send new booking courier delivery" },
    { title: "Track a parcel", subtitle: "Follow your parcel live", icon: "locate-outline", pathname: "/passenger/parcel/pickupParcel", keywords: "parcel track where location pickup status" },
    { title: "Tours", subtitle: "Plan a trip", icon: "map-outline", pathname: "/passenger/tours/index1", keywords: "tour trip travel holiday hire charter" },
    { title: "Tour packages", subtitle: "Browse packages and book a tour bus", icon: "albums-outline", pathname: "/passenger/tours/PackagesScreen1", keywords: "tour package book trip hire charter golden silver platinum" },
    { title: "Additional payment", subtitle: "Pay extra km for your tour", icon: "card-outline", pathname: "/passenger/tours/additionalPay", keywords: "extra km kilometre pay payment tour additional" },
    { title: "Find a friend", subtitle: "Find a friend's bus", icon: "people-outline", pathname: "/passenger/friend/index1", keywords: "friend passenger people find" },
    { title: "Receipts", subtitle: "All your receipts", icon: "receipt-outline", pathname: "/passenger/receipt/index1", keywords: "receipt booking history bill" },
    { title: "Parcel receipts", subtitle: "Pending and delivered parcels", icon: "document-text-outline", pathname: "/passenger/receipt/parcelReceipt", keywords: "parcel receipt pending delivered history" },
    { title: "Tour receipts", subtitle: "Active and past tours, tour QR", icon: "qr-code-outline", pathname: "/passenger/receipt/ReceiptList", keywords: "tour receipt qr code active gone booking" },
    { title: "Tickets", subtitle: "Active and used tickets", icon: "ticket-outline", pathname: "/passenger/ticket/normalwayAndHighway", keywords: "ticket qr active used" },
    { title: "Normal way tickets", subtitle: "Active and used normal way tickets", icon: "ticket-outline", pathname: "/passenger/ticket/usedAndActiveTicket", keywords: "ticket normal way qr active used", extra: { busType: "NormalWay", busTypeTopic: "Normal Way" } },
    { title: "Highway tickets", subtitle: "Active and used highway tickets", icon: "ticket-outline", pathname: "/passenger/ticket/usedAndActiveTicket", keywords: "ticket highway expressway qr active used", extra: { busType: "Highway", busTypeTopic: "High Way" } },
    { title: "Alerts", subtitle: "Your notifications", icon: "notifications-outline", pathname: "/notifications", keywords: "alert notification message", extra: { role: "passenger" } },
    { title: "Profile", subtitle: "Your account", icon: "person-outline", pathname: "/passenger/passengerProfile", keywords: "profile account me logout settings", extra: { role: "passenger" } },
  ],
  staff: [
    { title: "Home", subtitle: "Bus staff home", icon: "home-outline", pathname: "/busStaff/index1", keywords: "main start dashboard" },
    { title: "Scan bus ticket", subtitle: "Check a passenger's ticket", icon: "scan-outline", pathname: "/busStaff/VerifyTicketScreen", keywords: "scan ticket qr verify passenger" },
    { title: "Parcels", subtitle: "Scan, book and track parcels", icon: "cube-outline", pathname: "/busStaff/manageParcel", keywords: "parcel package delivery" },
    { title: "Scan parcel", subtitle: "Scan a parcel at pickup or delivery", icon: "qr-code-outline", pathname: "/busStaff/parcelQrScan", keywords: "parcel scan qr pickup delivery" },
    { title: "Pending parcels", subtitle: "Parcels waiting on this bus", icon: "time-outline", pathname: "/busStaff/pendingParcel", keywords: "parcel pending waiting list" },
    { title: "Book a parcel", subtitle: "Register a parcel for transport", icon: "add-circle-outline", pathname: "/busStaff/busBookedParcel", keywords: "parcel book new register" },
    { title: "Tour receipts", subtitle: "Tours assigned to this bus", icon: "receipt-outline", pathname: "/busStaff/ReceiptList", keywords: "tour receipt trip booking passenger pickup" },
    { title: "Scan tour QR", subtitle: "Board a tour passenger", icon: "qr-code-outline", pathname: "/busStaff/TourQrScan", keywords: "tour qr scan board verify" },
    { title: "Emergency", subtitle: "Alert the control room", icon: "warning-outline", pathname: "/busStaff/emergencyState", keywords: "emergency sos accident breakdown help alert" },
    { title: "Help", subtitle: "Support and FAQs", icon: "help-circle-outline", pathname: "/busStaff/help", keywords: "help support faq question contact" },
    { title: "Alerts", subtitle: "Notifications for this bus", icon: "notifications-outline", pathname: "/notifications", keywords: "alert notification message", extra: { role: "staff" } },
    { title: "Profile", subtitle: "Bus and crew details", icon: "person-outline", pathname: "/busStaff/busProfile", keywords: "profile account driver conductor logout" },
  ],
  admin: [
    { title: "Home", subtitle: "Admin home", icon: "home-outline", pathname: "/admin/index1", keywords: "main start dashboard" },
    { title: "Payment history", subtitle: "Parcel, tour and ticket income", icon: "wallet-outline", pathname: "/admin/PaymentHistory/paymentHistory", keywords: "payment income money finance revenue history" },
    { title: "Parcel payments", subtitle: "Parcel delivery payments", icon: "cube-outline", pathname: "/admin/PaymentHistory/AllParcelsScreen", keywords: "parcel payment income" },
    { title: "Tour payments", subtitle: "Tour package payments", icon: "map-outline", pathname: "/admin/PaymentHistory/AllReceipts", keywords: "tour payment income receipt" },
    { title: "Ticket payments", subtitle: "Daily bus ticket payments", icon: "ticket-outline", pathname: "/admin/PaymentHistory/AllTicketsScreen", keywords: "ticket payment income" },
    { title: "Buses", subtitle: "Bus profiles and schedules", icon: "bus-outline", pathname: "/admin/buses/busAndSchedule", keywords: "bus fleet vehicle" },
    { title: "Bus profiles", subtitle: "Add and manage buses", icon: "bus-outline", pathname: "/admin/buses/busType", keywords: "bus profile add new manage vehicle" },
    { title: "Bus schedules", subtitle: "Add and manage schedules", icon: "calendar-outline", pathname: "/admin/buses/chooseBusType", keywords: "schedule timetable time route bus" },
    { title: "Parcels", subtitle: "Parcel history", icon: "cube-outline", pathname: "/admin/Parcelhistory/parcelDetails", keywords: "parcel package delivery history" },
    { title: "Pending parcels", subtitle: "Parcels not delivered yet", icon: "time-outline", pathname: "/admin/Parcelhistory/pendingParcel", keywords: "parcel pending waiting" },
    { title: "Parcel fees", subtitle: "Set parcel prices", icon: "pricetag-outline", pathname: "/admin/Parcelhistory/parcelFees", keywords: "parcel fee price rate cost" },
    { title: "Tours", subtitle: "Packages and tour history", icon: "map-outline", pathname: "/admin/Tour/Tour", keywords: "tour trip" },
    { title: "Tour packages", subtitle: "Create and edit tour packages", icon: "albums-outline", pathname: "/admin/Tour/PackagesScreen1", keywords: "tour package create edit places" },
    { title: "Tour receipts", subtitle: "Active and past tours", icon: "receipt-outline", pathname: "/admin/Tour/AllReceipts", keywords: "tour receipt booking history active gone" },
    { title: "Passengers", subtitle: "Registered passengers", icon: "people-outline", pathname: "/admin/regpassengers/index1", keywords: "passenger user customer registered" },
    { title: "Find passenger by NIC", subtitle: "Search a passenger", icon: "search-outline", pathname: "/admin/regpassengers/searchByNIC", keywords: "passenger nic search find id" },
    { title: "Staff", subtitle: "Drivers and conductors", icon: "briefcase-outline", pathname: "/admin/Staff/index1", keywords: "staff crew employee" },
    { title: "Drivers", subtitle: "All drivers", icon: "person-outline", pathname: "/admin/Staff/index2", keywords: "driver staff list" },
    { title: "Add driver", subtitle: "Register a new driver", icon: "person-add-outline", pathname: "/admin/Staff/index3", keywords: "driver add new register staff" },
    { title: "Conductors", subtitle: "All conductors", icon: "person-outline", pathname: "/admin/Staff/index5", keywords: "conductor staff list" },
    { title: "Add conductor", subtitle: "Register a new conductor", icon: "person-add-outline", pathname: "/admin/Staff/index6", keywords: "conductor add new register staff" },
    { title: "Emergency", subtitle: "Buses with active alerts", icon: "warning-outline", pathname: "/admin/emergency/EmergencyBuses", keywords: "emergency sos alert accident breakdown" },
    { title: "Alerts", subtitle: "Admin notifications", icon: "notifications-outline", pathname: "/notifications", keywords: "alert notification message", extra: { role: "admin" } },
    { title: "Profile", subtitle: "Your admin account", icon: "person-circle-outline", pathname: "/admin/Profile/adminProfile", keywords: "profile account me logout" },
    { title: "Create admin", subtitle: "Add another admin", icon: "shield-checkmark-outline", pathname: "/admin/Profile/createAdmin", keywords: "admin create new add account" },
  ],
};

// Login details each role carries from screen to screen
const SESSION_KEYS: Record<SearchRole, string[]> = {
  passenger: ["Pid", "Pid1", "pfirstName", "plastName", "pphoneNumber", "pemail", "NIC"],
  staff: [
    "Cid", "conductorId", "conductorNIC", "cfirstName", "clastName", "cphoneNumber",
    "driverId", "dfirstName", "dlastName", "dphoneNumber", "busNo", "busNumber",
  ],
  admin: ["Aid", "firstName", "lastName", "email"],
};

const norm = (t: string) => t.toLowerCase().replace(/\s+/g, " ").trim();

export function searchPages(role: SearchRole, query: string): Page[] {
  const q = norm(query);
  if (!q) return [];
  const words = q.split(" ");
  return PAGES[role]
    .map((p) => {
      const title = norm(p.title);
      const hay = `${title} ${norm(p.subtitle)} ${p.keywords || ""}`;
      if (!words.every((w) => hay.includes(w))) return null;
      const score = title.startsWith(q) ? 0 : title.includes(q) ? 1 : 2;
      return { p, score };
    })
    .filter(Boolean)
    .sort((a, b) => a!.score - b!.score)
    .map((x) => x!.p);
}

/* ---------- List filtering ---------- */

// All text inside an item (looks 2 levels deep, e.g. { parcel: { parcelId } })
const itemText = (value: any, depth = 0): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "boolean") return "";
  if (depth >= 2) return "";
  if (Array.isArray(value)) return value.map((v) => itemText(v, depth + 1)).join(" ");
  if (typeof value === "object") return Object.values(value).map((v) => itemText(v, depth + 1)).join(" ");
  return "";
};

const isHeader = (item: any) => item && typeof item === "object" && item.type === "date";

/**
 * Keep only the list items that contain every word typed in the search bar.
 * Date header rows ({ type: "date" }) are kept when at least one item under them matches.
 */
export function filterBySearch<T>(items: T[] | null | undefined, query: string): T[] {
  const list = Array.isArray(items) ? items : [];
  const q = norm(query || "");
  if (!q) return list;
  const words = q.split(" ");
  const matches = (item: any) => {
    const text = itemText(item).toLowerCase();
    return words.every((w) => text.includes(w));
  };

  const out: T[] = [];
  let pendingHeader: T | null = null;
  for (const item of list) {
    if (isHeader(item)) {
      pendingHeader = item;
      continue;
    }
    if (matches(item)) {
      if (pendingHeader) {
        out.push(pendingHeader);
        pendingHeader = null;
      }
      out.push(item);
    }
  }
  return out;
}

type Props = {
  visible: boolean;
  query: string;
  onChangeQuery: (text: string) => void;
  onClose: () => void;
  role: SearchRole;
  params?: Record<string, any>;
  /** Set on list screens, e.g. "receipts" -> "Also filtering receipts on this page" */
  listLabel?: string;
  placeholder?: string;
};

export default function SearchPanel({
  visible,
  query,
  onChangeQuery,
  onClose,
  role,
  params = {},
  listLabel,
  placeholder,
}: Props) {
  const router = useRouter();
  const anim = useRef(new Animated.Value(0)).current;
  const results = useMemo(() => searchPages(role, query), [role, query]);

  useEffect(() => {
    Animated.timing(anim, { toValue: visible ? 1 : 0, duration: 180, useNativeDriver: true }).start();
  }, [visible]);

  // Android back button closes the search first
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, onClose]);

  if (!visible) return null;

  const openPage = (page: Page) => {
    const session: Record<string, string> = {};
    for (const key of SESSION_KEYS[role]) {
      const v = params[key];
      const value = Array.isArray(v) ? v[0] : v;
      if (value !== undefined && value !== null && value !== "") session[key] = String(value);
    }
    Keyboard.dismiss();
    onClose();
    router.push({ pathname: page.pathname as any, params: { ...session, ...(page.extra || {}) } });
  };

  const hasQuery = !!query.trim();

  return (
    <Animated.View
      style={[
        styles.wrap,
        { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }] },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.bar}>
        <Ionicons name="search" size={20} color={C.blue} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={onChangeQuery}
          placeholder={placeholder || (listLabel ? `Search ${listLabel} or pages…` : "Search pages…")}
          placeholderTextColor="#7A8799"
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={() => {
            if (!listLabel && results[0]) openPage(results[0]);
            else Keyboard.dismiss();
          }}
        />
        {hasQuery ? (
          <TouchableOpacity onPress={() => onChangeQuery("")} hitSlop={8} accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={20} color={C.chevron} />
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close search">
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>

      {hasQuery && (
        <View style={styles.results}>
          {!!listLabel && (
            <View style={styles.listChip}>
              <Ionicons name="funnel-outline" size={14} color={C.green} />
              <Text style={styles.listChipText}>Filtering {listLabel} on this page</Text>
            </View>
          )}

          {results.length > 0 ? (
            <>
              <Text style={styles.sectionLabel}>PAGES</Text>
              <ScrollView style={{ maxHeight: listLabel ? 190 : 330 }} keyboardShouldPersistTaps="handled">
                {results.map((page) => (
                  <TouchableOpacity
                    key={page.title}
                    style={styles.row}
                    onPress={() => openPage(page)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.rowIcon}>
                      <Ionicons name={page.icon} size={18} color={C.blue} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle}>{page.title}</Text>
                      <Text style={styles.rowSub} numberOfLines={1}>{page.subtitle}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={C.chevron} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          ) : (
            !listLabel && (
              <View style={styles.empty}>
                <Ionicons name="search-outline" size={22} color={C.chevron} />
                <Text style={styles.emptyText}>No pages match "{query.trim()}"</Text>
              </View>
            )
          )}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", top: 44, left: 12, right: 12, zIndex: 50, elevation: 50 },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 54,
    paddingLeft: 16,
    paddingRight: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    elevation: 10,
    shadowColor: "#0F1B2D",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  input: { flex: 1, height: "100%", fontSize: 16, color: C.ink, fontWeight: "600" },
  closeBtn: { paddingHorizontal: 12, height: 40, borderRadius: 12, backgroundColor: C.blueSoft, justifyContent: "center" },
  closeText: { color: C.blue, fontWeight: "800", fontSize: 13 },

  results: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 8,
    elevation: 10,
    shadowColor: "#0F1B2D",
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  listChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginHorizontal: 12,
    marginTop: 2,
    marginBottom: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: C.greenSoft,
  },
  listChipText: { color: C.green, fontWeight: "700", fontSize: 12 },
  sectionLabel: { fontSize: 11, fontWeight: "800", color: C.muted, letterSpacing: 1, marginHorizontal: 16, marginTop: 4, marginBottom: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, paddingHorizontal: 14 },
  rowIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: C.blueSoft, alignItems: "center", justifyContent: "center" },
  rowTitle: { fontSize: 15, fontWeight: "800", color: C.ink },
  rowSub: { fontSize: 12.5, color: C.muted, marginTop: 1 },
  empty: { alignItems: "center", paddingVertical: 14, gap: 6 },
  emptyText: { color: C.muted, fontSize: 13, fontWeight: "600" },
});
