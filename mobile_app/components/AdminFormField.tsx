import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = TextInputProps & {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  secure?: boolean;
  error?: string;
};

// Labelled input with the green-bordered style used in the admin forms
export default function AdminFormField({ label, icon, secure, error, ...input }: Props) {
  const [hidden, setHidden] = useState(true);

  return (
    <View style={{ width: "100%" }}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.wrapper, error ? styles.wrapperError : null]}>
        <Ionicons name={icon} size={20} color="#4A6FA5" style={{ marginRight: 10 }} />
        <TextInput
          style={styles.input}
          placeholderTextColor="#A3A3A3"
          secureTextEntry={secure ? hidden : false}
          autoCorrect={false}
          {...input}
        />
        {secure ? (
          <TouchableOpacity onPress={() => setHidden(!hidden)} style={{ padding: 4 }}>
            <Ionicons name={hidden ? "eye-off-outline" : "eye-outline"} size={20} color="#8A8A8A" />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 15, color: "#0056b3", fontWeight: "500", marginBottom: 8 },
  wrapper: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F4F5",
    borderWidth: 1,
    borderColor: "#32CD32",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 4,
  },
  wrapperError: { borderColor: "#D32F2F" },
  input: { flex: 1, fontSize: 16, color: "#0056b3", fontWeight: "500", padding: 0 },
  error: { color: "#D32F2F", fontSize: 12, marginBottom: 10 },
});
