import React, { useState } from "react";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Alert,
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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { updateAdmin } from "../../../services/adminService";
import AdminBottomNav from "../../../components/AdminBottomNav";
import AdminFormField from "../../../components/AdminFormField";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^0\d{9}$/;

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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const navParams = {
    Aid,
    firstName: String(params.firstName ?? ""),
    lastName: String(params.lastName ?? ""),
    email: String(params.email ?? ""),
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = "First name is required";
    if (!lastName.trim()) e.lastName = "Last name is required";
    if (!EMAIL_REGEX.test(email.trim())) e.email = "Enter a valid email";
    if (phoneNumber.trim() && !PHONE_REGEX.test(phoneNumber.trim()))
      e.phoneNumber = "10 digits starting with 0 (e.g. 0771234567)";
    if (changePassword) {
      if (!currentPassword) e.currentPassword = "Enter your current password";
      if (newPassword.length < 6) e.newPassword = "At least 6 characters";
      if (newPassword !== confirmPassword) e.confirmPassword = "Passwords do not match";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

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
            <AdminFormField label="First Name" icon="person-outline" value={firstName} onChangeText={setFirstName} error={errors.firstName} placeholder="First name" />
            <AdminFormField label="Last Name" icon="person-outline" value={lastName} onChangeText={setLastName} error={errors.lastName} placeholder="Last name" />
            <AdminFormField label="Email" icon="mail-outline" value={email} onChangeText={setEmail} error={errors.email} placeholder="admin@example.com" keyboardType="email-address" autoCapitalize="none" />
            <AdminFormField label="Phone Number" icon="call-outline" value={phoneNumber} onChangeText={setPhoneNumber} error={errors.phoneNumber} placeholder="0771234567" keyboardType="phone-pad" maxLength={10} />

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>Change Password</Text>
              <Switch value={changePassword} onValueChange={setChangePassword} trackColor={{ true: "#32CD32", false: "#ccc" }} />
            </View>

            {changePassword ? (
              <>
                <AdminFormField label="Current Password" icon="lock-closed-outline" secure value={currentPassword} onChangeText={setCurrentPassword} error={errors.currentPassword} autoCapitalize="none" />
                <AdminFormField label="New Password" icon="key-outline" secure value={newPassword} onChangeText={setNewPassword} error={errors.newPassword} autoCapitalize="none" />
                <AdminFormField label="Confirm New Password" icon="key-outline" secure value={confirmPassword} onChangeText={setConfirmPassword} error={errors.confirmPassword} autoCapitalize="none" />
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
