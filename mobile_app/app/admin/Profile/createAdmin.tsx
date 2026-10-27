import React, { useState } from "react";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Alert } from "../../../components/JetAlert";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { createAdmin } from "../../../services/adminService";
import AdminBottomNav from "../../../components/AdminBottomNav";
import AdminFormField from "../../../components/AdminFormField";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^0\d{9}$/;

export default function CreateAdmin() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // The logged-in admin (kept so navigation still works)
  const navParams = {
    Aid: String(params.Aid ?? ""),
    firstName: String(params.firstName ?? ""),
    lastName: String(params.lastName ?? ""),
    email: String(params.email ?? ""),
  };

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = "First name is required";
    if (!lastName.trim()) e.lastName = "Last name is required";
    if (!EMAIL_REGEX.test(email.trim())) e.email = "Enter a valid email";
    if (phoneNumber.trim() && !PHONE_REGEX.test(phoneNumber.trim()))
      e.phoneNumber = "10 digits starting with 0 (e.g. 0771234567)";
    if (password.length < 6) e.password = "At least 6 characters";
    if (password !== confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;

    try {
      setSaving(true);
      const res = await createAdmin({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        password,
      });

      if (!res.success) {
        Alert.alert("Create Failed", res.message || "Could not create admin");
        return;
      }

      Alert.alert("Success", `Admin ${res.data.firstName} ${res.data.lastName} created`, [
        {
          text: "OK",
          onPress: () => router.replace({ pathname: "/admin/Profile/adminProfile", params: navParams }),
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
          <Text style={styles.cardTitle}>Create Admin</Text>
          <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
            <AdminFormField label="First Name" icon="person-outline" value={firstName} onChangeText={setFirstName} error={errors.firstName} placeholder="First name" />
            <AdminFormField label="Last Name" icon="person-outline" value={lastName} onChangeText={setLastName} error={errors.lastName} placeholder="Last name" />
            <AdminFormField label="Email" icon="mail-outline" value={email} onChangeText={setEmail} error={errors.email} placeholder="admin@example.com" keyboardType="email-address" autoCapitalize="none" />
            <AdminFormField label="Phone Number" icon="call-outline" value={phoneNumber} onChangeText={setPhoneNumber} error={errors.phoneNumber} placeholder="0771234567" keyboardType="phone-pad" maxLength={10} />
            <AdminFormField label="Password" icon="lock-closed-outline" secure value={password} onChangeText={setPassword} error={errors.password} autoCapitalize="none" />
            <AdminFormField label="Confirm Password" icon="lock-closed-outline" secure value={confirmPassword} onChangeText={setConfirmPassword} error={errors.confirmPassword} autoCapitalize="none" />

            <TouchableOpacity activeOpacity={0.85} style={styles.btnWrap} onPress={handleCreate} disabled={saving}>
              <LinearGradient colors={["#173C79", "#155B8A", "#159B79"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Admin</Text>}
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
  btnWrap: { marginTop: 16, borderRadius: 25, overflow: "hidden", elevation: 6 },
  btn: { height: 52, alignItems: "center", justifyContent: "center" },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
