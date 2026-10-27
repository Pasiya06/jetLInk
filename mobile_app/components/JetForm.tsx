// Shared form pieces so every admin / staff form looks the same as the rest of JetLink.
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, IconBox, ui } from "./JetUI";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

// White card with a coloured icon + title, holding a group of fields
export function FormSection({
  title,
  subtitle,
  icon,
  color = C.blue,
  bg = C.blueSoft,
  children,
  style,
}: {
  title: string;
  subtitle?: string;
  icon: IconName;
  color?: string;
  bg?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[ui.card, f.section, style]}>
      <View style={f.sectionHead}>
        <IconBox bg={bg} size={40} radius={13}>
          <Ionicons name={icon} size={20} color={color} />
        </IconBox>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={f.sectionTitle}>{title}</Text>
          {subtitle ? <Text style={f.sectionSub}>{subtitle}</Text> : null}
        </View>
      </View>
      {children}
    </View>
  );
}

// Label + icon + text input (+ optional error / hint)
export function FormField({
  label,
  icon,
  error,
  hint,
  suffix,
  readOnly,
  ...input
}: TextInputProps & {
  label: string;
  icon?: IconName;
  error?: string | null;
  hint?: string;
  suffix?: string;
  readOnly?: boolean;
}) {
  return (
    <View style={f.field}>
      <Text style={f.label}>{label}</Text>
      <View style={[f.inputWrap, readOnly && f.readOnly, !!error && f.inputError]}>
        {icon ? <Ionicons name={icon} size={19} color={error ? C.red : C.muted} style={{ marginRight: 10 }} /> : null}
        <TextInput
          placeholderTextColor="#8A97A8"
          editable={!readOnly}
          {...input}
          style={[f.input, input.multiline && { minHeight: 80, textAlignVertical: "top", paddingTop: 12 }, input.style]}
        />
        {suffix ? <Text style={f.suffix}>{suffix}</Text> : null}
      </View>
      {error ? (
        <View style={f.errorRow}>
          <Ionicons name="alert-circle" size={14} color={C.red} />
          <Text style={f.errorText}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={f.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

// Looks like a field, opens a picker when tapped (date, time, list...)
export function PickerField({
  label,
  icon,
  value,
  placeholder,
  onPress,
  error,
  right = "chevron-down",
}: {
  label: string;
  icon?: IconName;
  value?: string;
  placeholder?: string;
  onPress: () => void;
  error?: string | null;
  right?: IconName;
}) {
  return (
    <View style={f.field}>
      <Text style={f.label}>{label}</Text>
      <TouchableOpacity
        style={[f.inputWrap, !!error && f.inputError]}
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityLabel={label}
      >
        {icon ? <Ionicons name={icon} size={19} color={error ? C.red : C.muted} style={{ marginRight: 10 }} /> : null}
        <Text style={[f.pickerText, !value && f.placeholder]} numberOfLines={1}>
          {value || placeholder || "Choose"}
        </Text>
        <Ionicons name={right} size={18} color={C.chevron} />
      </TouchableOpacity>
      {error ? (
        <View style={f.errorRow}>
          <Ionicons name="alert-circle" size={14} color={C.red} />
          <Text style={f.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

// Two fields side by side
export function FieldRow({ children }: { children: React.ReactNode }) {
  return <View style={f.row}>{React.Children.map(children, (c) => <View style={{ flex: 1 }}>{c}</View>)}</View>;
}

// Label / value line used on detail cards
export function DetailLine({
  icon,
  label,
  value,
  last,
  color = C.blue,
}: {
  icon: IconName;
  label: string;
  value?: string | number | null;
  last?: boolean;
  color?: string;
}) {
  const empty = value === undefined || value === null || value === "";
  return (
    <View style={[f.detail, !last && f.detailDivider]}>
      <View style={f.detailIcon}>
        <Ionicons name={icon} size={17} color={color} />
      </View>
      <Text style={f.detailLabel}>{label}</Text>
      <Text style={[f.detailValue, empty && { color: C.chevron, fontWeight: "500" }]} numberOfLines={2}>
        {empty ? "—" : String(value)}
      </Text>
    </View>
  );
}

const f = StyleSheet.create({
  section: { padding: 18 },
  sectionHead: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: C.ink },
  sectionSub: { fontSize: 12.5, color: C.muted, marginTop: 1 },

  field: { marginTop: 12 },
  label: { fontSize: 13, fontWeight: "700", color: C.muted, marginBottom: 7, marginLeft: 2 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: "#E3E9F1",
    backgroundColor: "#F7F9FC",
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  readOnly: { backgroundColor: "#EEF2F7" },
  inputError: { borderColor: C.redBorder, backgroundColor: C.redTint },
  input: { flex: 1, fontSize: 15, fontWeight: "600", color: C.ink, paddingVertical: 12 },
  suffix: { fontSize: 14, fontWeight: "700", color: C.muted, marginLeft: 6 },
  pickerText: { flex: 1, fontSize: 15, fontWeight: "600", color: C.ink, paddingVertical: 14 },
  placeholder: { color: "#8A97A8" },
  hint: { fontSize: 12, color: C.muted, marginTop: 5, marginLeft: 2 },
  errorRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 5, marginLeft: 2 },
  errorText: { fontSize: 12.5, color: C.red, fontWeight: "600" },
  row: { flexDirection: "row", gap: 12 },

  detail: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  detailDivider: { borderBottomWidth: 1, borderBottomColor: C.line },
  detailIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: C.blueSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  detailLabel: { flex: 1, fontSize: 14, color: C.muted, fontWeight: "600" },
  detailValue: { maxWidth: "55%", fontSize: 14.5, color: C.ink, fontWeight: "800", textAlign: "right" },
});
