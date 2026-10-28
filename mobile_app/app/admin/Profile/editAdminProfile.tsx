import React, { useState } from "react";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Alert } from "../../../components/JetAlert";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { updateAdmin } from "../../../services/adminService";
import AdminBottomNav from "../../../components/AdminBottomNav";
import AdminFormField from "../../../components/AdminFormField";
import { useFieldErrors } from "../../../utils/validation";

export default function EditAdminProfile() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const Aid = String(params.Aid ?? "");

  const [firstName, setFirstName] = useState(String(params.firstName ?? ""));
  const [lastName, setLastName] = useState(String(params.lastName ?? ""));
  const [email, setEmail] = useState(String(params.email ?? ""));
  const [phoneNumber, setPhoneNumber] = useState(String(params.phoneNumber ?? ""));

  const [changePassword, setChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);

  // Messages show while typing and after pressing Save
  const { validate: validateFields, errorFor } = useFieldErrors({
    optional: ["phoneNumber"],
    rules: {
      currentPassword: { label: "Current password" },
      newPassword: { label: "New password", type: "password" },
      confirmPassword: { label: "Confirm password", equalsKey: "newPassword", message: "Passwords do not match" },
    },
  });

  const navParams = {
    Aid,
    firstName: String(params.firstName ?? ""),
    lastName: String(params.lastName ?? ""),
    email: String(params.email ?? ""),
  };

  const validate = () =>
    validateFields([
      { key: "firstName", label: "First name", value: firstName },
      { key: "lastName", label: "Last name", value: lastName },
      { key: "email", label: "Email", value: email, type: "email" },
      { key: "phoneNumber", label: "Phone number", value: phoneNumber, type: "phone", optional: true },
      ...(changePassword
        ? [
            { key: "currentPassword", label: "Current password", value: currentPassword },
            { key: "newPassword", label: "New password", value: newPassword, type: "password" as const },
            {
              key: "confirmPassword",
              label: "Confirm password",
              value: confirmPassword,
              equals: { value: newPassword, message: "Passwords do not match" },
            },
          ]
        : []),
    ]);

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setSaving(true);
      const res = await updateAdmin(Aid, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        ...(changePassword ? { currentPassword, newPassword } : {}),
      });

      if (!res.success) {
        Alert.alert("Update Failed", res.message || "Could not update profile");
        return;
      }

      const a = res.data;
      Alert.alert("Success", "Profile updated successfully", [
        {
          text: "OK",
          onPress: () =>
            router.replace({
              pathname: "/admin/Profile/adminProfile",
              params: { Aid: a._id, firstName: a.firstName, lastName: a.lastName, email: a.email },
            }),
        },
      ]);
    } catch (e) {
      Alert.alert("Error", "Unable to connect to server");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#173C79", "#155B8A", "#159B79"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGradient}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>Jetlink</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.card}>
          <Text style={styles.cardTitle}>Edit Profile</Text>
          <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
            <AdminFormField label="First Name" icon="person-outline" value={firstName} onChangeText={setFirstName} error={errorFor("firstName", firstName)} placeholder="First name" />
            <AdminFormField label="Last Name" icon="person-outline" value={lastName} onChangeText={setLastName} error={errorFor("lastName", lastName)} placeholder="Last name" />
            <AdminFormField label="Email" icon="mail-outline" value={email} onChangeText={setEmail} error={errorFor("email", email)} placeholder="admin@example.com" keyboardType="email-address" autoCapitalize="none" />
            <AdminFormField label="Phone Number" icon="call-outline" value={phoneNumber} onChangeText={setPhoneNumber} error={errorFor("phoneNumber", phoneNumber)} placeholder="0771234567" keyboardType="phone-pad" maxLength={10} />

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>Change Password</Text>
              <Switch value={changePassword} onValueChange={setChangePassword} trackColor={{ true: "#32CD32", false: "#ccc" }} />
            </View>

            {changePassword ? (
              <>
                <AdminFormField label="Current Password" icon="lock-closed-outline" secure value={currentPassword} onChangeText={setCurrentPassword} error={errorFor("currentPassword", currentPassword)} autoCapitalize="none" />
                <AdminFormField label="New Password" icon="key-outline" secure value={newPassword} onChangeText={setNewPassword} error={errorFor("newPassword", newPassword)} autoCapitalize="none" />
                <AdminFormField label="Confirm New Password" icon="key-outline" secure value={confirmPassword} onChangeText={setConfirmPassword} error={errorFor("confirmPassword", confirmPassword)} autoCapitalize="none" />
              </>
            ) : null}

            <TouchableOpacity activeOpacity={0.85} style={styles.btnWrap} onPress={handleSave} disabled={saving}>
              <LinearGradient colors={["#173C79", "#155B8A", "#159B79"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save Changes</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>

        
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerGradient: { borderBottomLeftRadius: 25, borderBottomRightRadius: 25, paddingTop: 50, paddingBottom: 70, paddingHorizontal: 20,  },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 28, fontWeight: "800", color: "#fff", letterSpacing: 0.5 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "90%",
    flex: 1,
    maxHeight: "68%",
    backgroundColor: "#FFF",
    marginTop: -50,
    alignSelf: "center",
    borderRadius: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: "hidden",
  },
  cardTitle: { fontSize: 20, fontWeight: "700", color: "#0047AB", textAlign: "center", paddingTop: 18, paddingBottom: 6 },
  form: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 30 },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 10 },
  switchText: { fontSize: 15, color: "#1E293B", fontWeight: "600" },
  btnWrap: { marginTop: 16, borderRadius: 25, overflow: "hidden", elevation: 6 },
  btn: { height: 52, alignItems: "center", justifyContent: "center" },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
