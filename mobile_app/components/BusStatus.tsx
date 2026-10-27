import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Alert } from "./JetAlert";
import { C } from "./JetUI";
import { emergencyTimeAgo, formatEmergencyTime } from "../utils/emergencyTime";

/**
 * Accident / breakdown status of a bus.
 * Works with a bus ({ status, emergency, emergencyAt })
 * or a schedule from /schedules ({ busStatus, busEmergency, busEmergencyAt }).
 */
type WithStatus = {
  status?: string | null;
  emergency?: boolean | null;
  emergencyAt?: string | Date | null;
  busStatus?: string | null;
  busEmergency?: boolean | null;
  busEmergencyAt?: string | Date | null;
  busNo?: string | null;
  busNumber?: string | null;
};

export function busProblem(item?: WithStatus | null): "accident" | "breakdown" | null {
  if (!item) return null;
  const status = String(item.busStatus ?? item.status ?? "").toLowerCase();
  if (status === "accident" || status === "breakdown") return status;
  if (item.busEmergency === true || item.emergency === true) return "breakdown";
  return null;
}

export const isBusBlocked = (item?: WithStatus | null) => busProblem(item) !== null;

const problemText = (p: "accident" | "breakdown") =>
  p === "accident" ? "Accident reported" : "Breakdown reported";

export function showBusBlockedAlert(item: WithStatus) {
  const p = busProblem(item);
  if (!p) return;
  const bus = item.busNo || item.busNumber || "This bus";
  const at = item.busEmergencyAt ?? item.emergencyAt;
  Alert.alert(
    p === "accident" ? "Bus had an accident" : "Bus broke down",
    `${bus} reported ${p === "accident" ? "an accident" : "a breakdown"}${
      at ? ` at ${formatEmergencyTime(at)}` : ""
    }. It can't be booked until it's back in service. Please choose another bus.`
  );
}

// Red notice shown inside a bus / schedule card
export function BusStatusNotice({ item, note }: { item?: WithStatus | null; note?: string }) {
  const p = busProblem(item);
  if (!p) return null;
  const at = item?.busEmergencyAt ?? item?.emergencyAt;
  const ago = emergencyTimeAgo(at as any);
  return (
    <View style={styles.box}>
      <Ionicons name={p === "accident" ? "warning" : "construct"} size={18} color={C.red} />
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>
          {problemText(p)}{ago ? ` · ${ago}` : ""}
        </Text>
        <Text style={styles.text}>{note || "This bus is not available. You can't book it right now."}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.redSoft,
    borderWidth: 1,
    borderColor: C.redBorder,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  title: { color: C.red, fontWeight: "800", fontSize: 13.5 },
  text: { color: C.red, fontSize: 12.5, marginTop: 2 },
});
