import React, { useEffect, useRef, useState } from 'react';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, BackHandler, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Alert } from "../../components/JetAlert";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { C, GRADIENT, GradientButton, ui } from "../../components/JetUI";
import { FormField } from "../../components/JetForm";

import { useFieldErrors } from "../../utils/validation";
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const FlatmateLogin: React.FC = () => {
  const router = useRouter();
  const { validate: validateFields, errorFor: fieldError } = useFieldErrors();
  const [busNum, setBusNum] = useState('');
  const [DNIC, DsetNIC] = useState('');
  const [CNIC, CsetNIC] = useState('');
  const [verifiedCNIC, setVerifiedCNIC] = useState("");
  const [verifiedDNIC, setVerifiedDNIC] = useState("");
  const [verifiedBusno, setVerifiedBusno] = useState("");
  const [dfirstname, setdfirstname] = useState("");
  const [dlastname, setdlastname] = useState("");
  const [dphonenumber, setdphonenumber] = useState("");
  const [cfirstname, setcfirstname] = useState("");
  const [clastname, setclastname] = useState("");
  const [cphonenumber, setcphonenumber] = useState("");
  const [cemail, setcemail] = useState("");
  const params = useLocalSearchParams();
  

  const handleBusNumber = (text: string) => {
    let value = text.toUpperCase();
    // Remove spaces
    text = text.replace(/\s/g, "");

    // Keep only letters and numbers
    text = text.replace(/[^a-zA-Z0-9]/g, "");

    // Format as HH-8888
    if (text.length > 2) {
      text = text.slice(0, 2) + "-" + text.slice(2, 6);
    }

    setBusNum(text);
  };

  useEffect(() => {
    const backAction = () => {
      router.replace("/passenger/selectScreen"); // Navigate to a specific path
      return true; // Prevent default back behavior
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => subscription.remove();
  }, []);

  

const verify = async () => {
  if (!validateFields([
    { key: "busNum", label: "Bus number", value: busNum },
    { key: "DNIC", label: "Driver NIC", value: DNIC, type: "nic" },
    { key: "CNIC", label: "Conductor NIC", value: CNIC, type: "nic" },
  ])) return;

  try {
    const busResponse = await fetch(`${API_URL}/buses/check/${busNum}`);
    const bus = await busResponse.json();
    if (!bus.exists) {
      Alert.alert("Invalid bus number", "We couldn't find a bus with this number. Please check it and try again.");
      return;
    }
     
    setVerifiedBusno(bus.data.busNumber);

    const dResponse = await fetch(`${API_URL}/buses/check1/${DNIC}`);
    const d = await dResponse.json();
    if (d.exists) {
      Alert.alert("Driver already on another bus", "This driver is already logged in with a different bus.");
      return;
    }

    const cResponse = await fetch(`${API_URL}/buses/check2/${CNIC}`);
    const c = await cResponse.json();
    if (c.exists) {
      Alert.alert("Conductor already on another bus", "This conductor is already logged in with a different bus.");
      return;
    }

    const driverResponse = await fetch(`${API_URL}/drivers/check/${DNIC}`);
    const driver = await driverResponse.json();
    if (!driver.exists) {
      Alert.alert("Invalid driver NIC", String(driver.message || "No driver was found with this NIC."));
      return;
    }

    setVerifiedDNIC(driver.data.NIC);
    setdfirstname(driver.data.firstName);
    setdlastname(driver.data.lastName);
    setdphonenumber(driver.data.phoneNumber);
  
    const conductorResponse = await fetch(`${API_URL}/conductors/check/${CNIC}`);
    const conductor = await conductorResponse.json();
    if (!conductor.exists) {
      Alert.alert("Invalid conductor NIC", String(conductor.message || "No conductor was found with this NIC."));
      return;
    }

    setVerifiedCNIC(conductor.data.NIC);
    setcfirstname(conductor.data.firstName);
    setclastname(conductor.data.lastName);
    setcphonenumber(conductor.data.phoneNumber);
    setcemail(conductor.data.email);

    router.push({
      pathname: "/busStaff/otpLogin",
      params: {
        conductorNIC:conductor.data.NIC,
        cfirstName:conductor.data.firstName,
        clastName:conductor.data.lastName,
        cphoneNumber:conductor.data.phoneNumber,
        cemail:conductor.data.email,
        driverId:driver.data.NIC,
        dfirstName:driver.data.firstName,
        dlastName:driver.data.lastName,
        dphoneNumber:driver.data.phoneNumber,
        busNo:bus.data.busNumber
        
      },
    });
    

  } 
  
  catch (error) {
    console.log(error);
    Alert.alert("Connection failed", "Couldn't reach the server. Please check your internet connection and try again.");
  }

};





 
  const [checking, setChecking] = useState(false);
  const onVerify = async () => {
    if (checking) return;
    setChecking(true);
    try {
      await verify();
    } finally {
      setChecking(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#173C79" />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => router.replace("/passenger/selectScreen")}
                accessibilityLabel="Go back"
              >
                <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.heroBadge}>
                <Ionicons name="bus" size={34} color="#FFFFFF" />
              </View>
              <Text style={styles.brand}>JetLink</Text>
              <Text style={styles.heroTitle}>Bus crew sign in</Text>
              <Text style={styles.heroSub}>Enter your bus and crew details to start the trip</Text>
            </LinearGradient>

            <View style={[ui.card, styles.card]}>
              <View style={styles.stepRow}>
                <View style={[styles.step, styles.stepActive]}>
                  <Text style={styles.stepNumActive}>1</Text>
                </View>
                <Text style={styles.stepLabelActive}>Crew details</Text>
                <View style={styles.stepLine} />
                <View style={styles.step}>
                  <Text style={styles.stepNum}>2</Text>
                </View>
                <Text style={styles.stepLabel}>Code</Text>
              </View>

              <FormField
                label="Bus number"
                icon="bus-outline"
                value={busNum}
                onChangeText={handleBusNumber}
                placeholder="NA-1234"
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={7}
                error={fieldError("busNum", busNum)}
              />
              <FormField
                label="Driver NIC"
                icon="person-outline"
                value={DNIC}
                onChangeText={DsetNIC}
                placeholder="123456789012"
                autoCapitalize="characters"
                autoCorrect={false}
                error={fieldError("DNIC", DNIC)}
              />
              <FormField
                label="Conductor NIC"
                icon="id-card-outline"
                value={CNIC}
                onChangeText={CsetNIC}
                placeholder="123456789012"
                autoCapitalize="characters"
                autoCorrect={false}
                error={fieldError("CNIC", CNIC)}
              />

              <View style={styles.note}>
                <Ionicons name="shield-checkmark-outline" size={18} color={C.blue} />
                <Text style={styles.noteText}>
                  After checking, we send a one-time code to the conductor's phone.
                </Text>
              </View>

              <View style={{ marginTop: 18 }}>
                <GradientButton
                  label={checking ? "Checking…" : "Verify crew"}
                  icon="arrow-forward-circle-outline"
                  onPress={onVerify}
                  disabled={checking}
                />
              </View>
              {checking ? <ActivityIndicator color={C.blue} style={{ marginTop: 12 }} /> : null}
            </View>

            <View style={styles.helpRow}>
              <Ionicons name="help-circle-outline" size={16} color={C.muted} />
              <Text style={styles.helpText}>Problems signing in? Ask your depot admin to check your details.</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingBottom: 40 },
  hero: {
    paddingTop: 48,
    paddingBottom: 92,
    paddingHorizontal: 24,
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backBtn: {
    position: "absolute",
    top: 44,
    left: 18,
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  brand: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "800", letterSpacing: 2, marginTop: 14, textTransform: "uppercase" },
  heroTitle: { color: "#FFFFFF", fontSize: 26, fontWeight: "800", marginTop: 4 },
  heroSub: { color: "rgba(255,255,255,0.85)", fontSize: 14, marginTop: 6, textAlign: "center" },

  card: { marginTop: -64, marginHorizontal: 18, padding: 20 },
  stepRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  step: { width: 26, height: 26, borderRadius: 13, backgroundColor: "#EEF2F7", alignItems: "center", justifyContent: "center" },
  stepActive: { backgroundColor: C.blue },
  stepNum: { fontSize: 13, fontWeight: "800", color: C.muted },
  stepNumActive: { fontSize: 13, fontWeight: "800", color: "#FFFFFF" },
  stepLabel: { fontSize: 13, fontWeight: "700", color: C.muted, marginLeft: 8 },
  stepLabelActive: { fontSize: 13, fontWeight: "800", color: C.ink, marginLeft: 8 },
  stepLine: { flex: 1, height: 2, backgroundColor: "#E3E9F1", marginHorizontal: 10, borderRadius: 1 },

  note: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.blueSoft,
    borderRadius: 14,
    padding: 12,
    marginTop: 16,
  },
  noteText: { flex: 1, fontSize: 13, color: C.ink, fontWeight: "600" },

  helpRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 18, paddingHorizontal: 24 },
  helpText: { fontSize: 12.5, color: C.muted, textAlign: "center", flexShrink: 1 },
});

export default FlatmateLogin;
