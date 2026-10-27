// Inline dropdown list of locations (from bus schedules), shown under a pickup / drop-off field.
import React, { useMemo } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C } from "./JetUI";
import type { LocationOption } from "./LocationSheet";

type Props = {
  title: string;
  options: LocationOption[];
  query: string;          // text typed in the field
  selected?: string;      // current value (highlighted)
  loading?: boolean;
  emptyText: string;
  onSelect: (name: string) => void;
};

export default function LocationDropdown({ title, options, query, selected, loading, emptyText, onSelect }: Props) {
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Field already holds a full place name -> show every option so it's easy to change
    if (!q || options.some((o) => o.name.toLowerCase() === q)) return options;
    const starts = options.filter((o) => o.name.toLowerCase().startsWith(q));
    const contains = options.filter((o) => !o.name.toLowerCase().startsWith(q) && o.name.toLowerCase().includes(q));
    return [...starts, ...contains];
  }, [options, query]);

  return (
    <View style={styles.box}>
      <Text style={styles.title}>{title}</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={C.blue} />
        </View>
      ) : shown.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="location-outline" size={20} color={C.chevron} />
          <Text style={styles.empty}>{query.trim() ? `No match for "${query.trim()}"` : emptyText}</Text>
        </View>
      ) : (
        <ScrollView style={{ maxHeight: 250 }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
          {shown.map((o) => {
            const active = selected === o.name;
            return (
              <TouchableOpacity
                key={o.name}
                style={[styles.row, active && styles.rowActive]}
                onPress={() => onSelect(o.name)}
                activeOpacity={0.75}
              >
                <View style={[styles.pin, active && { backgroundColor: C.blue }]}>
                  <Ionicons name="location" size={15} color={active ? "#FFFFFF" : C.blue} />
                </View>
                <Text style={[styles.name, active && { color: C.blue }]} numberOfLines={1}>
                  {o.name}
                </Text>
                <Text style={styles.count}>
                  {o.count} {o.count === 1 ? "bus" : "buses"}
                </Text>
                {active && <Ionicons name="checkmark" size={18} color={C.blue} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DCE3EC",
    paddingVertical: 8,
    elevation: 6,
    shadowColor: "#0F1B2D",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  title: { fontSize: 11.5, fontWeight: "800", color: C.muted, letterSpacing: 0.6, marginHorizontal: 14, marginBottom: 4, textTransform: "uppercase" },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 11, paddingHorizontal: 14 },
  rowActive: { backgroundColor: C.blueSoft },
  pin: { width: 30, height: 30, borderRadius: 10, backgroundColor: C.blueSoft, alignItems: "center", justifyContent: "center" },
  name: { flex: 1, fontSize: 15, fontWeight: "700", color: C.ink },
  count: { fontSize: 12, color: C.muted, fontWeight: "600" },
  center: { alignItems: "center", paddingVertical: 16, gap: 6 },
  empty: { color: C.muted, fontSize: 13, fontWeight: "600", textAlign: "center", paddingHorizontal: 14 },
});
