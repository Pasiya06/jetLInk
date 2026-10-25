import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Red validation message shown under a TextInput
export default function FieldError({ message, style }: { message?: string; style?: StyleProp<ViewStyle> }) {
  if (!message) return null;
  return (
    <View style={[styles.row, style]}>
      <Ionicons name="alert-circle" size={14} color="#D32F2F" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4, marginBottom: 8 },
  text: { color: "#D32F2F", fontSize: 12, fontWeight: "500", flexShrink: 1 },
});
