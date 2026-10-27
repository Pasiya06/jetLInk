// Bottom-sheet dropdown for choosing a location from a list of options.
// Used by the passenger "Search Bus" screen (pickup / drop-off from schedules).
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C } from "./JetUI";

export type LocationOption = {
  name: string;
  count: number; // how many schedules use this location
};

type Props = {
  visible: boolean;
  title: string;
  subtitle?: string;
  options: LocationOption[];
  selected?: string;
  loading?: boolean;
  emptyText?: string;
  onSelect: (name: string) => void;
  onClear?: () => void;
  onClose: () => void;
};

export default function LocationSheet({
  visible,
  title,
  subtitle,
  options,
  selected,
  loading,
  emptyText = "No locations available",
  onSelect,
  onClear,
  onClose,
}: Props) {
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.name.toLowerCase().includes(q)) : options;
  }, [options, query]);

  const close = () => {
    setQuery("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Close" />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            <TouchableOpacity onPress={close} style={styles.close} accessibilityLabel="Close">
              <Ionicons name="close" size={22} color={C.muted} />
            </TouchableOpacity>
          </View>

          <View style={styles.search}>
            <Ionicons name="search" size={18} color={C.muted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search location"
              placeholderTextColor="#7A8799"
              value={query}
              onChangeText={setQuery}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            {query ? (
              <TouchableOpacity onPress={() => setQuery("")} accessibilityLabel="Clear search">
                <Ionicons name="close-circle" size={18} color="#8A97A8" />
              </TouchableOpacity>
            ) : null}
          </View>

          {onClear && selected ? (
            <TouchableOpacity
              style={styles.clearRow}
              onPress={() => {
                setQuery("");
                onClear();
              }}
            >
              <Ionicons name="close-circle-outline" size={18} color={C.red} />
              <Text style={styles.clearText}>Clear selection</Text>
            </TouchableOpacity>
          ) : null}

          <FlatList
            data={shown}
            keyExtractor={(item) => item.name}
            keyboardShouldPersistTaps="handled"
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ paddingBottom: 24 }}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons
                  name={loading ? "hourglass-outline" : "map-outline"}
                  size={30}
                  color="#8A97A8"
                />
                <Text style={styles.emptyText}>
                  {loading ? "Loading routes…" : query ? "No matching location" : emptyText}
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const active = item.name === selected;
              return (
                <TouchableOpacity
                  style={[styles.row, active && styles.rowActive]}
                  onPress={() => {
                    setQuery("");
                    onSelect(item.name);
                  }}
                >
                  <View style={[styles.pin, active && { backgroundColor: C.blue }]}>
                    <Ionicons
                      name="location-outline"
                      size={18}
                      color={active ? "#FFFFFF" : C.blue}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowText, active && { color: C.blue }]}>{item.name}</Text>
                    <Text style={styles.rowSub}>
                      {item.count} {item.count === 1 ? "schedule" : "schedules"}
                    </Text>
                  </View>
                  {active ? <Ionicons name="checkmark-circle" size={22} color={C.blue} /> : null}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(15,27,45,0.45)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 10,
    maxHeight: "78%",
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#DCE3EC",
    marginBottom: 12,
  },
  header: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  title: { fontSize: 19, fontWeight: "800", color: C.ink },
  subtitle: { fontSize: 13, color: C.muted, marginTop: 2 },
  close: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F6FA",
    alignItems: "center",
    justifyContent: "center",
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E3E9F1",
    backgroundColor: "#F7F9FC",
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: C.ink, height: "100%" },
  clearRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 10 },
  clearText: { color: C.red, fontWeight: "700", fontSize: 14 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    marginTop: 4,
  },
  rowActive: { backgroundColor: C.blueSoft },
  pin: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: C.blueSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { fontSize: 15, fontWeight: "800", color: C.ink, letterSpacing: 0.3 },
  rowSub: { fontSize: 12, color: C.muted, marginTop: 1 },
  empty: { alignItems: "center", paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 14, color: C.muted, textAlign: "center" },
});
