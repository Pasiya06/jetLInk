import React, { useMemo, useState } from "react";
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SRI_LANKA_TOWNS } from "../utils/sriLankaTowns";

type Props = {
  visible: boolean;
  title?: string;
  selected?: string | null;
  allowClear?: boolean;
  onSelect: (town: string | null) => void;
  onClose: () => void;
};

// Bottom-sheet list of Sri Lankan towns with search
export default function PickupTownPicker({ visible, title = "Choose pickup town", selected, allowClear, onSelect, onClose }: Props) {
  const [query, setQuery] = useState("");
  const towns = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? SRI_LANKA_TOWNS.filter((t) => t.name.toLowerCase().includes(q)) : SRI_LANKA_TOWNS;
  }, [query]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.close}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.search}>
            <Ionicons name="search" size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search town"
              placeholderTextColor="#94A3B8"
              value={query}
              onChangeText={setQuery}
            />
          </View>

          {allowClear && selected ? (
            <TouchableOpacity
              style={styles.clearRow}
              onPress={() => {
                onSelect(null);
                setQuery("");
              }}
            >
              <Ionicons name="close-circle-outline" size={18} color="#E5484D" />
              <Text style={styles.clearText}>Clear selection</Text>
            </TouchableOpacity>
          ) : null}

          <FlatList
            data={towns}
            keyExtractor={(t) => t.name}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const active = item.name === selected;
              return (
                <TouchableOpacity
                  style={[styles.row, active && styles.rowActive]}
                  onPress={() => {
                    onSelect(item.name);
                    setQuery("");
                  }}
                >
                  <Ionicons name="location-outline" size={18} color={active ? "#12966F" : "#64748B"} />
                  <Text style={[styles.rowText, active && { color: "#12966F", fontWeight: "700" }]}>{item.name}</Text>
                  {active ? <Ionicons name="checkmark" size={18} color="#12966F" /> : null}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={<Text style={styles.empty}>No town found</Text>}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.45)", justifyContent: "flex-end" },
  sheet: {
    height: "75%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    paddingHorizontal: 18,
  },
  handle: { alignSelf: "center", width: 44, height: 5, borderRadius: 3, backgroundColor: "#E2E8F0" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 10 },
  title: { fontSize: 18, fontWeight: "800", color: "#182B45" },
  close: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  searchInput: { flex: 1, height: 44, fontSize: 14, color: "#334155" },
  clearRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 10 },
  clearText: { color: "#E5484D", fontWeight: "600" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 13,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  rowActive: { backgroundColor: "#F0FBF7", borderRadius: 10 },
  rowText: { flex: 1, fontSize: 15, color: "#334155" },
  empty: { textAlign: "center", color: "#94A3B8", marginTop: 20 },
});
