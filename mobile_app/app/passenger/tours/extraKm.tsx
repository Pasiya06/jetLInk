import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Alert } from "../../../components/JetAlert";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import FieldError from "../../../components/FieldError";
import { useFieldErrors } from "../../../utils/validation";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type ExtraPayment = { _id?: string; km: number; pricePerKm: number; amount: number; cardLast4?: string; paidAt: string };
type Booking = {
  receiptId: string;
  busNumber: string;
  date: string;
  time: string;
  pickup: string;
  packageType: string;
  totalDistance: number | string;
  tripDuration: string;
  maxPrice: number;
  pemail: string;
};

const lkr = (n: number) => `LKR ${Number(n || 0).toLocaleString()}`;

// Passenger adds extra kilometers to a booked tour and pays per km
export default function ExtraKmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { validate: validateFields, errorFor: fieldError } = useFieldErrors();
  const receiptId = String(params.receiptId ?? "");

  const [booking, setBooking] = useState<Booking | null>(null);
  const [pricePerKm, setPricePerKm] = useState(0);
  const [paidKm, setPaidKm] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [payments, setPayments] = useState<ExtraPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [paying, setPaying] = useState(false);

  const [km, setKm] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const kmNumber = Number(km);
  const total = Number.isInteger(kmNumber) && kmNumber > 0 ? kmNumber * pricePerKm : 0;

  const load = useCallback(async () => {
    if (!receiptId) {
      setLoadError("Booking not found. Open it again from My Receipts.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setLoadError("");
      const [bRes, xRes] = await Promise.all([
        fetch(`${API_URL}/receipts/${encodeURIComponent(receiptId)}`),
        fetch(`${API_URL}/receipts/${encodeURIComponent(receiptId)}/extra-km`),
      ]);
      const b = await bRes.json();
      const x = await xRes.json();
      if (!bRes.ok || !b.success) throw new Error(b.message || "Could not load booking");
      if (!xRes.ok || !x.success) throw new Error(x.message || "Could not load extra km details");
      setBooking(b.receipt);
      setPricePerKm(Number(x.pricePerKm) || 0);
      setPaidKm(Number(x.extraKm) || 0);
      setPaidAmount(Number(x.extraKmAmount) || 0);
      setPayments(Array.isArray(x.payments) ? x.payments : []);
    } catch (e: any) {
      setLoadError(e?.message || "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  }, [receiptId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onCardNumber = (text: string) =>
    setCardNumber(text.replace(/\D/g, "").substring(0, 16).replace(/(.{4})/g, "$1 ").trim());

  const onExpiry = (text: string) => {
    const d = text.replace(/\D/g, "").substring(0, 4);
    setExpiry(d.length > 2 ? `${d.substring(0, 2)}/${d.substring(2)}` : d);
  };

  const submit = async () => {
    if (!validateFields([
      { key: "km", label: "Extra kilometers", value: km, type: "int" },
      { key: "nameOnCard", label: "Name on card", value: nameOnCard },
      { key: "cardNumber", label: "Card number", value: cardNumber, type: "card" },
      { key: "expiry", label: "Expiry date", value: expiry, type: "expiry" },
      { key: "cvc", label: "CVC", value: cvc, type: "cvc" },
    ])) return;

    Alert.alert(
      "Confirm payment",
      `Pay ${lkr(total)} for ${kmNumber} extra km?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Pay now",
          onPress: async () => {
            try {
              setPaying(true);
              const res = await fetch(`${API_URL}/receipts/${encodeURIComponent(receiptId)}/extra-km`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  km: kmNumber,
                  pemail: booking?.pemail ?? params.pemail,
                  cardNumber,
                  expiry,
                  cvc,
                }),
              });
              const data = await res.json();
              if (!res.ok || !data.success) {
                Alert.alert("Payment failed", data.message || "Could not complete the payment");
                return;
              }
              setKm("");
              setNameOnCard("");
              setCardNumber("");
              setExpiry("");
              setCvc("");
              await load();
              Alert.alert("Payment successful", data.message);
            } catch {
              Alert.alert("Error", "Unable to connect to server");
            } finally {
              setPaying(false);
            }
          },
        },
      ]
    );
  };

  const navParams = {
    Pid: params.Pid,
    Pid1: params.Pid1,
    pfirstName: params.pfirstName,
    plastName: params.plastName,
    pphoneNumber: params.pphoneNumber,
    pemail: params.pemail,
  };

  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <LinearGradient colors={["#173C79", "#155B8A", "#159B79"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eyebrow}>Tour booking</Text>
              <Text style={styles.headerTitle}>Extra kilometers</Text>
            </View>
            <View style={styles.headerIcon}>
              <MaterialCommunityIcons name="map-marker-distance" size={24} color="#fff" />
            </View>
          </View>
          {receiptId ? (
            <View style={styles.idChip}>
              <Ionicons name="receipt-outline" size={13} color="#fff" />
              <Text style={styles.headerSub}>{receiptId}</Text>
            </View>
          ) : null}
        </LinearGradient>

        {loading && !booking ? (
          <View style={[styles.card, styles.center]}>
            <ActivityIndicator size="large" color="#155B8A" />
            <Text style={styles.muted}>Loading booking…</Text>
          </View>
        ) : loadError ? (
          <View style={[styles.card, styles.center]}>
            <View style={styles.errorIcon}>
              <Ionicons name="alert-circle-outline" size={34} color="#B42318" />
            </View>
            <Text style={styles.errorText}>{loadError}</Text>
            <TouchableOpacity style={styles.retry} onPress={load}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <ScrollView style={{ marginTop: -64 }} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {/* Booking summary */}
              <View style={styles.card}>
                <View style={styles.summaryTop}>
                  <View style={styles.busIcon}>
                    <Ionicons name="bus" size={22} color="#155B8A" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pkg}>{booking?.packageType}</Text>
                    <Text style={styles.muted}>{booking?.date} · {booking?.time}</Text>
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{booking?.busNumber}</Text>
                  </View>
                </View>
                <View style={styles.pickupChip}>
                  <Ionicons name="location" size={14} color="#0B6B53" />
                  <Text style={styles.pickupText}>Pickup: {booking?.pickup}</Text>
                </View>
                <View style={styles.divider} />
                <Info label="Included distance" value={booking?.totalDistance ? `${booking.totalDistance} km` : "—"} />
                <Info label="Extra km already paid" value={paidKm ? `${paidKm} km (${lkr(paidAmount)})` : "None"} />
                <Info label="Price per extra km" value={pricePerKm ? lkr(pricePerKm) : "Not available"} strong />
              </View>

              {pricePerKm <= 0 ? (
                <View style={[styles.card, styles.notice]}>
                  <Ionicons name="information-circle-outline" size={22} color="#B26A00" />
                  <Text style={styles.noticeText}>
                    Extra kilometers aren't available for this package. Please contact JetLink.
                  </Text>
                </View>
              ) : (
                <View style={styles.card}>
                  <View style={styles.sectionRow}>
                    <View style={[styles.sectionIcon, { backgroundColor: "#E3F5EE" }]}>
                      <MaterialCommunityIcons name="road-variant" size={18} color="#0B6B53" />
                    </View>
                    <Text style={styles.section}>Add kilometers</Text>
                  </View>
                  <Text style={styles.label}>How many extra km?</Text>
                  <View style={styles.inputWrap}>
                    <MaterialCommunityIcons name="map-marker-distance" size={20} color="#155B8A" />
                    <TextInput
                      style={styles.input}
                      value={km}
                      onChangeText={(t) => setKm(t.replace(/\D/g, ""))}
                      placeholder="e.g. 50"
                      placeholderTextColor="#8A97A8"
                      keyboardType="number-pad"
                      maxLength={4}
                    />
                    <Text style={styles.unit}>km</Text>
                  </View>
                  <FieldError message={fieldError("km", km)} />

                  <View style={styles.totalBox}>
                    <Text style={styles.totalLabel}>
                      {total ? `${kmNumber} km × ${lkr(pricePerKm)}` : "Total to pay"}
                    </Text>
                    <Text style={styles.total}>{lkr(total)}</Text>
                  </View>

                  <View style={[styles.sectionRow, { marginTop: 22 }]}>
                    <View style={[styles.sectionIcon, { backgroundColor: "#EAF1FB" }]}>
                      <Feather name="credit-card" size={16} color="#155B8A" />
                    </View>
                    <Text style={styles.section}>Card details</Text>
                  </View>
                  <Text style={styles.label}>Name on card</Text>
                  <View style={styles.inputWrap}>
                    <Feather name="user" size={18} color="#5B6B7F" />
                    <TextInput style={styles.input} value={nameOnCard} onChangeText={setNameOnCard} placeholder="Name on card" placeholderTextColor="#8A97A8" />
                  </View>
                  <FieldError message={fieldError("nameOnCard", nameOnCard)} />

                  <Text style={styles.label}>Card number</Text>
                  <View style={styles.inputWrap}>
                    <Feather name="credit-card" size={18} color="#5B6B7F" />
                    <TextInput style={styles.input} value={cardNumber} onChangeText={onCardNumber} placeholder="1234 5678 9012 3456" placeholderTextColor="#8A97A8" keyboardType="number-pad" maxLength={19} />
                  </View>
                  <FieldError message={fieldError("cardNumber", cardNumber)} />

                  <View style={styles.twoCol}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.label}>Expiry</Text>
                      <View style={styles.inputWrap}>
                        <TextInput style={styles.input} value={expiry} onChangeText={onExpiry} placeholder="MM/YY" placeholderTextColor="#8A97A8" keyboardType="number-pad" maxLength={5} />
                      </View>
                      <FieldError message={fieldError("expiry", expiry)} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.label}>CVC</Text>
                      <View style={styles.inputWrap}>
                        <TextInput style={styles.input} value={cvc} onChangeText={(t) => setCvc(t.replace(/\D/g, ""))} placeholder="123" placeholderTextColor="#8A97A8" keyboardType="number-pad" maxLength={4} secureTextEntry />
                      </View>
                      <FieldError message={fieldError("cvc", cvc)} />
                    </View>
                  </View>

                  <TouchableOpacity activeOpacity={0.85} onPress={submit} disabled={paying} style={styles.payWrap}>
                    <LinearGradient colors={["#173C79", "#155B8A", "#159B79"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.payBtn}>
                      {paying ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.payText}>{total ? `Pay ${lkr(total)}` : "Pay"}</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}

              {/* History */}
              {payments.length > 0 ? (
                <View style={styles.card}>
                  <View style={styles.sectionRow}>
                    <View style={[styles.sectionIcon, { backgroundColor: "#F0EBFE" }]}>
                      <Ionicons name="time-outline" size={17} color="#6D3FD6" />
                    </View>
                    <Text style={styles.section}>Extra km payments</Text>
                  </View>
                  {payments
                    .slice()
                    .reverse()
                    .map((p, i) => (
                      <View key={p._id ?? i} style={styles.payRow}>
                        <View style={styles.payIcon}>
                          <Ionicons name="checkmark" size={16} color="#0B6B53" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.payKm}>+{p.km} km</Text>
                          <Text style={styles.muted}>
                            {new Date(p.paidAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "numeric", minute: "2-digit", hour12: true })}
                            {p.cardLast4 ? ` · card •••• ${p.cardLast4}` : ""}
                          </Text>
                        </View>
                        <Text style={styles.payAmount}>{lkr(p.amount)}</Text>
                      </View>
                    ))}
                </View>
              ) : null}
            </ScrollView>
          </KeyboardAvoidingView>
        )}

        {/* Bottom nav */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.item} onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={24} color="#8A8A8A" />
            <Text style={styles.label1}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => router.push({ pathname: "/passenger/receipt/ReceiptList", params: navParams })}>
            <Ionicons name="receipt-outline" size={24} color="#8A8A8A" />
            <Text style={styles.label1}>Receipts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.centerButton} onPress={() => router.push({ pathname: "/passenger/index1", params: navParams })}>
            <Ionicons name="home-outline" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => router.push({ pathname: "/notifications", params: { role: "passenger" } })}>
            <Ionicons name="notifications-outline" size={24} color="#8A8A8A" />
            <Text style={styles.label1}>Alerts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => router.push({ pathname: "/passenger/passengerProfile", params: { role: "passenger", NIC: params.NIC } })}>
            <Feather name="user" size={24} color="#8A8A8A" />
            <Text style={styles.label1}>Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerGraphic}>
          <LinearGradient colors={["#173C79", "#155B8A", "#159B79"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.submitGradient} />
        </View>
        <View style={styles.footerGraphic1}>
          <LinearGradient colors={["#173C79", "#155B8A", "#159B79"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.submitGradient} />
        </View>
      </View>
    </>
  );
}

function Info({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, strong && { color: "#0B6B53", fontWeight: "800" }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F6FA" },
  header: {
    paddingTop: 54,
    paddingBottom: 70,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
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
  headerTitle: { fontSize: 28, fontWeight: "800", color: "#fff" },
  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  idChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.16)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  headerSub: { color: "#fff", fontSize: 12.5, fontWeight: "700" },
  center: { marginHorizontal: 16, marginTop: -50, alignItems: "center", justifyContent: "center", padding: 28, gap: 10 },
  muted: { color: "#5B6B7F", fontSize: 12.5 },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: "#FDE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: { color: "#B42318", textAlign: "center", fontWeight: "600" },
  retry: { backgroundColor: "#155B8A", paddingHorizontal: 20, paddingVertical: 11, borderRadius: 22 },
  retryText: { color: "#fff", fontWeight: "700" },

  scroll: { paddingHorizontal: 16, paddingTop: 0, paddingBottom: 240 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 18,
    marginTop: 14,
    elevation: 4,
    shadowColor: "#0F1B2D",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  summaryTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  busIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#EAF1FB",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#EAF1FB",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: { color: "#155B8A", fontWeight: "800", fontSize: 12 },
  pkg: { fontSize: 17, fontWeight: "800", color: "#0F1B2D", marginBottom: 2 },
  pickupChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    marginTop: 12,
    backgroundColor: "#E3F5EE",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  pickupText: { color: "#0B6B53", fontSize: 12.5, fontWeight: "700" },
  divider: { height: 1, backgroundColor: "#EDF1F6", marginVertical: 12 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  infoLabel: { color: "#5B6B7F", fontSize: 13.5 },
  infoValue: { color: "#0F1B2D", fontSize: 14, fontWeight: "700" },

  notice: { flexDirection: "row", gap: 10, backgroundColor: "#FFF4DC" },
  noticeText: { flex: 1, color: "#B26A00", fontSize: 13.5, lineHeight: 19, fontWeight: "600" },

  sectionRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  sectionIcon: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  section: { fontSize: 17, fontWeight: "800", color: "#0F1B2D" },
  label: { marginTop: 14, marginBottom: 7, fontSize: 13, color: "#0F1B2D", fontWeight: "700" },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 54,
    borderWidth: 1,
    borderColor: "#DCE3EC",
    backgroundColor: "#F7F9FC",
    borderRadius: 16,
    paddingHorizontal: 14,
  },
  input: { flex: 1, fontSize: 16, color: "#0F1B2D", paddingVertical: 10, fontWeight: "600" },
  unit: { color: "#155B8A", fontWeight: "800" },
  totalBox: {
    marginTop: 14,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#E3F5EE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalLabel: { color: "#0B6B53", fontSize: 13, fontWeight: "700", flexShrink: 1 },
  total: { color: "#0B6B53", fontSize: 22, fontWeight: "800" },
  twoCol: { flexDirection: "row", gap: 12 },
  payWrap: {
    marginTop: 20,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#155B8A",
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  payBtn: { height: 56, alignItems: "center", justifyContent: "center" },
  payText: { color: "#fff", fontSize: 17, fontWeight: "800" },

  payRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF1F6",
  },
  payIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E3F5EE",
    alignItems: "center",
    justifyContent: "center",
  },
  payKm: { fontSize: 15, fontWeight: "800", color: "#0F1B2D" },
  payAmount: { fontSize: 15, fontWeight: "800", color: "#0B6B53" },

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
  },
  item: { alignItems: "center", justifyContent: "center", flex: 1 },
  label1: { marginTop: 4, fontSize: 13, color: "#8A8A8A" },
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
  submitGradient: { paddingVertical: 16 },
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
