import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updatePassenger } from "../../services/passengerService";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^0\d{9}$/;
const NIC_REGEX = /^(\d{9}[VvXx]|\d{12})$/;

type FieldProps = TextInputProps & {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  error?: string;
  secure?: boolean;
};

const Field = ({ label, icon, color, error, secure, ...input }: FieldProps) => {
  const [hidden, setHidden] = useState(true);
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputWrap, error ? styles.inputWrapError : null]}>
        <View style={[styles.inputIcon, { backgroundColor: `${color}1A` }]}>
          <Ionicons name={icon} size={17} color={color} />
        </View>
        <TextInput
          style={styles.input}
          placeholderTextColor="#A7B0BF"
          autoCorrect={false}
          secureTextEntry={secure ? hidden : false}
          {...input}
        />
        {secure ? (
          <TouchableOpacity onPress={() => setHidden(!hidden)} style={{ padding: 4 }}>
            <Ionicons name={hidden ? "eye-off-outline" : "eye-outline"} size={19} color="#8A94A6" />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

export default function EditPassengerProfile() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = String(params.id ?? "");

  const [firstName, setFirstName] = useState(String(params.firstName ?? ""));
  const [lastName, setLastName] = useState(String(params.lastName ?? ""));
  const [phoneNumber, setPhoneNumber] = useState(String(params.phoneNumber ?? ""));
  const [email, setEmail] = useState(String(params.email ?? ""));
  const [NIC, setNIC] = useState(String(params.NIC ?? ""));
  const [address, setAddress] = useState(String(params.address ?? ""));

  const [changePassword, setChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = "First name is required";
    if (!lastName.trim()) e.lastName = "Last name is required";
    if (!PHONE_REGEX.test(phoneNumber.trim())) e.phoneNumber = "10 digits starting with 0 (e.g. 0771234567)";
    if (!EMAIL_REGEX.test(email.trim())) e.email = "Enter a valid email";
    if (!NIC_REGEX.test(NIC.trim())) e.NIC = "9 digits + V/X, or 12 digits";
    if (!address.trim()) e.address = "Address is required";
    if (changePassword) {
      if (!currentPassword) e.currentPassword = "Enter your current password";
      if (newPassword.length < 6) e.newPassword = "At least 6 characters";
      if (newPassword !== confirmPassword) e.confirmPassword = "Passwords do not match";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!id) {
      Alert.alert("Error", "Passenger ID missing. Please open your profile again.");
      return;
    }
    if (!validate()) return;

    try {
      setSaving(true);
      const res = await updatePassenger(id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim().toLowerCase(),
        NIC: NIC.trim().toUpperCase(),
        address: address.trim(),
        ...(changePassword ? { currentPassword, newPassword } : {}),
      });

      if (!res.success) {
        Alert.alert("Update Failed", res.message || "Could not update profile");
        return;
      }

      // The profile page looks the passenger up by NIC, so keep the saved NIC current
      await AsyncStorage.setItem("@jetlink_passenger_nic", String(res.data.NIC)).catch(() => {});

      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert("Error", "Unable to connect to server");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView
            contentContainerStyle={{ paddingBottom: 90 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <LinearGradient
              colors={["#173C79", "#155B8A", "#159B79"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.header}
            >
              <View style={styles.headerTop}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                  <Ionicons name="chevron-back" size={22} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.brand}>Edit Profile</Text>
                <View style={{ width: 40 }} />
              </View>
            </LinearGradient>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Personal Details</Text>
              <Field label="First Name" icon="person-outline" color="#0057D9" value={firstName} onChangeText={setFirstName} error={errors.firstName} placeholder="First name" />
              <Field label="Last Name" icon="person-outline" color="#0057D9" value={lastName} onChangeText={setLastName} error={errors.lastName} placeholder="Last name" />
              <Field label="NIC" icon="card-outline" color="#7C3AED" value={NIC} onChangeText={setNIC} error={errors.NIC} placeholder="200012345678" autoCapitalize="characters" maxLength={12} />
              <Field label="Phone Number" icon="call-outline" color="#159B79" value={phoneNumber} onChangeText={setPhoneNumber} error={errors.phoneNumber} placeholder="0771234567" keyboardType="phone-pad" maxLength={10} />
              <Field label="Email" icon="mail-outline" color="#0057D9" value={email} onChangeText={setEmail} error={errors.email} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
              <Field label="Address" icon="location-outline" color="#F59E0B" value={address} onChangeText={setAddress} error={errors.address} placeholder="Address" multiline />

              <View style={styles.switchRow}>
                <Text style={styles.switchText}>Change Password</Text>
                <Switch value={changePassword} onValueChange={setChangePassword} trackColor={{ true: "#159B79", false: "#ccc" }} />
              </View>

              {changePassword ? (
                <>
                  <Field label="Current Password" icon="lock-closed-outline" color="#E5484D" secure value={currentPassword} onChangeText={setCurrentPassword} error={errors.currentPassword} autoCapitalize="none" />
                  <Field label="New Password" icon="key-outline" color="#E5484D" secure value={newPassword} onChangeText={setNewPassword} error={errors.newPassword} autoCapitalize="none" />
                  <Field label="Confirm New Password" icon="key-outline" color="#E5484D" secure value={confirmPassword} onChangeText={setConfirmPassword} error={errors.confirmPassword} autoCapitalize="none" />
                </>
              ) : null}

              <TouchableOpacity activeOpacity={0.85} onPress={handleSave} disabled={saving} style={styles.saveWrap}>
                <LinearGradient colors={["#173C79", "#155B8A", "#159B79"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.saveBtn}>
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle-outline" size={19} color="#fff" />
                      <Text style={styles.saveText}>Save Changes</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={styles.footerGraphic}>
          <LinearGradient colors={["#173C79", "#155B8A", "#159B79"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.submitGradient} />
        </View>
        <View style={styles.footerGraphic1}>
          <LinearGradient colors={["#173C79", "#155B8A", "#159B79"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.submitGradient} />
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F6FB" },
  header: {
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) + 12 : 12,
    paddingHorizontal: 20,
    paddingBottom: 70,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  brand: { color: "#fff", fontSize: 18, fontWeight: "700", letterSpacing: 0.5 },

  card: {
    marginHorizontal: 18,
    marginTop: -48,
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 18,
    shadowColor: "#173C79",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8A94A6",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  fieldLabel: { fontSize: 12, color: "#8A94A6", fontWeight: "600", marginBottom: 6 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E3E8F0",
    backgroundColor: "#F8FAFD",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 50,
  },
  inputWrapError: { borderColor: "#E5484D" },
  inputIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  input: { flex: 1, fontSize: 15, color: "#1A2233", fontWeight: "600", padding: 0 },
  errorText: { color: "#E5484D", fontSize: 12, marginTop: 4 },

  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    marginBottom: 6,
    borderTopWidth: 1,
    borderTopColor: "#F2F4F8",
  },
  switchText: { fontSize: 15, color: "#1A2233", fontWeight: "700" },

  saveWrap: { marginTop: 10, borderRadius: 14, overflow: "hidden" },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
  },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  submitGradient: { paddingVertical: 16 },
  footerGraphic: { position: "absolute", bottom: 0, width: "100%", overflow: "hidden" },
  footerGraphic1: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    overflow: "hidden",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
});
