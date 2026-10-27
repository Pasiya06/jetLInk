import React, { useEffect, useRef, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { Image, StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, StatusBar, BackHandler, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { FormField } from "../../components/JetForm";
import { Alert } from "../../components/JetAlert";
import { LinearGradient } from 'expo-linear-gradient';
import { Feather as Icon, AntDesign, Fontisto, EvilIcons, Ionicons } from '@expo/vector-icons';
import { saveSession } from "../../services/notificationService";


import FieldError from "../../components/FieldError";
import { useFieldErrors } from "../../utils/validation";
import { C, GRADIENT, GradientButton, ui } from "../../components/JetUI";
const API_URL = process.env.EXPO_PUBLIC_API_URL;
export const FlatmateLogin: React.FC = () => {
  const router = useRouter();
  const { validate: validateFields, errorFor: fieldError } = useFieldErrors();
  const [showLogin, setShowOtp] = useState(false);
  const [busNum, setBusNum] = useState('');
  const [DNIC, DsetNIC] = useState('');
  const [CNIC, CsetNIC] = useState('');
  const [password1, setPassword1] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [verifiedCNIC, setVerifiedCNIC] = useState("");
  const [verifiedDNIC, setVerifiedDNIC] = useState("");
  const [verifiedBusno, setVerifiedBusno] = useState("");
  const [dfirstname, setdfirstname] = useState("");
  const [dlastname, setdlastname] = useState("");
  const [dphonenumber, setdphonenumber] = useState("");

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

    // Store the verified NIC clearly, not conductorId
    setVerifiedCNIC(conductor.data.NIC);

    setShowOtp(true);
  } catch (error) {
    console.log(error);
    Alert.alert("Connection failed", "Couldn't reach the server. Please check your internet connection and try again.");
  }
};





const login = async () => {
  if (!validateFields([
    { key: "password1", label: "Password", value: password1 },
  ])) return;

  try {

    
    console.log("Sending password:", password1); // is this defined?

    const response = await fetch(`${API_URL}/conductors/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        NIC: verifiedCNIC,
        password: password1,
      }),
    });

    const data = await response.json();
    console.log("Response:", data); 

    if (!data.success) {
      Alert.alert("Login failed", String(data.message || "Please check your details and try again."));
      return;
    }
    

    

    
    // Bus staff alerts: this phone will now receive alerts for this bus
    await saveSession({ role: "staff", busNumber: String(verifiedBusno ?? "") });

    router.push({
      pathname: "/busStaff/index1",
      params: {
        Cid: data.data._id,
        conductorId: data.data.conductorId,
        conductorNIC:verifiedCNIC,
        cfirstName: data.data.firstName,
        clastName: data.data.lastName,
        cphoneNumber:data.data.phoneNumber,
        driverId:verifiedDNIC,
        dfirstName:dfirstname,
        dlastName:dlastname,
        dphoneNumber:dphonenumber,
        busNo: verifiedBusno,
        
      },
    });
  } catch (error) {
    console.log(error);
    Alert.alert("Server error", "Something went wrong on the server. Please try again.");
  }
};


  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#173C79" />
      <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => (showLogin ? setShowOtp(false) : router.replace("/passenger/selectScreen"))}
                accessibilityLabel="Go back"
              >
                <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.logo}>
                <Ionicons name={showLogin ? "lock-closed" : "bus"} size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.brand}>JetLink</Text>
              <Text style={styles.title}>Bus crew sign in</Text>
              <Text style={styles.heroSub}>
                {showLogin ? "Enter your passcode to continue" : "Enter your bus and crew details to start the trip"}
              </Text>
            </LinearGradient>

            <View style={[ui.card, styles.card]}>
              <View style={styles.stepRow}>
                <View style={[styles.step, styles.stepActive]}>
                  {showLogin ? <Ionicons name="checkmark" size={15} color="#FFFFFF" /> : <Text style={styles.stepNumActive}>1</Text>}
                </View>
                <Text style={styles.stepLabelActive}>Crew details</Text>
                <View style={[styles.stepLine, showLogin && { backgroundColor: C.blue }]} />
                <View style={[styles.step, showLogin && styles.stepActive]}>
                  <Text style={showLogin ? styles.stepNumActive : styles.stepNum}>2</Text>
                </View>
                <Text style={showLogin ? styles.stepLabelActive : styles.stepLabel}>Passcode</Text>
              </View>

              {!showLogin ? (
                <>
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
                    error={fieldError("DNIC", DNIC)}
                  />
                  <FormField
                    label="Conductor NIC"
                    icon="id-card-outline"
                    value={CNIC}
                    onChangeText={CsetNIC}
                    placeholder="123456789012"
                    autoCapitalize="characters"
                    error={fieldError("CNIC", CNIC)}
                  />
                  <View style={{ marginTop: 20 }}>
                    <GradientButton label="Verify crew" icon="arrow-forward-circle-outline" onPress={verify} />
                  </View>
                </>
              ) : (
                <>
                  <FormField
                    label="Passcode"
                    icon="lock-closed-outline"
                    value={password1}
                    onChangeText={setPassword1}
                    placeholder="Abc@123"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    error={fieldError("password1", password1)}
                  />
                  <TouchableOpacity style={styles.showPass} onPress={() => setShowPassword(!showPassword)}>
                    <Icon name={showPassword ? "eye-off" : "eye"} size={16} color={C.blue} />
                    <Text style={styles.showPassText}>{showPassword ? "Hide passcode" : "Show passcode"}</Text>
                  </TouchableOpacity>
                  <View style={{ marginTop: 16 }}>
                    <GradientButton label="Log in" icon="log-in-outline" onPress={login} />
                  </View>
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>


        <View style={styles.footerGraphic}>
          <LinearGradient
            colors={["#173C79","#155B8A","#159B79",]}
            start={{x: 0, y: 0,}}
            end={{x: 1, y: 1,}}
            style={styles.submitGradient}
          >
          </LinearGradient>
        </View>
        <View style={styles.footerGraphic1}>
          <LinearGradient
            colors={["#173C79","#155B8A","#159B79",]}
            start={{x: 0, y: 0,}}
            end={{x: 1, y: 1,}}
            style={styles.submitGradient}
          >
          </LinearGradient>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  backBtn: { position: "absolute", top: 44, left: 18, width: 42, height: 42, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  brand: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "800", letterSpacing: 2, marginTop: 14, textTransform: "uppercase" },
  stepRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  step: { width: 26, height: 26, borderRadius: 13, backgroundColor: "#EEF2F7", alignItems: "center", justifyContent: "center" },
  stepActive: { backgroundColor: "#155B8A" },
  stepNum: { fontSize: 13, fontWeight: "800", color: "#5B6B7F" },
  stepNumActive: { fontSize: 13, fontWeight: "800", color: "#FFFFFF" },
  stepLabel: { fontSize: 13, fontWeight: "700", color: "#5B6B7F", marginLeft: 8 },
  stepLabelActive: { fontSize: 13, fontWeight: "800", color: "#0F1B2D", marginLeft: 8 },
  stepLine: { flex: 1, height: 2, backgroundColor: "#E3E9F1", marginHorizontal: 10, borderRadius: 1 },
  showPass: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-end", marginTop: 10, padding: 4 },
  showPassText: { color: "#155B8A", fontWeight: "700", fontSize: 13 },
  heroSub: { color: "rgba(255,255,255,0.85)", fontSize: 14, marginTop: 6, textAlign: "center" },
  logo: { width: 72, height: 72, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.18)", borderWidth: 1, borderColor: "rgba(255,255,255,0.35)", alignItems: "center", justifyContent: "center", marginTop: 8 },
  hero: { paddingTop: 48, paddingBottom: 92, paddingHorizontal: 24, alignItems: "center", borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  container: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 70,   
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  submitGradient1: {
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  title: { color: "#FFFFFF", fontSize: 26, fontWeight: "800", marginTop: 4 },

  card: { marginTop: -64, marginHorizontal: 18, padding: 20 },

  card1: {
    marginTop: -64,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 18,
    elevation: 6,
    shadowColor: '#0F1B2D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  
  eyeIcon: { padding: 6 },
 
  
  
  

  formContainer: { width: '100%' },


  // one label + input + error message
  field: { marginBottom: 6 },

  // line the error up with the input box
  fieldError: {
    marginHorizontal: 17,
    marginBottom: 0,
  },

  inputWrapper1: { flexDirection: 'row', alignItems: 'center', minHeight: 52, borderWidth: 1.5, borderColor: '#E3E9F1', backgroundColor: '#F7F9FC', borderRadius: 14, paddingHorizontal: 12 },

  inputWrapper: { flexDirection: 'row', alignItems: 'center', minHeight: 52, borderWidth: 1.5, borderColor: '#E3E9F1', backgroundColor: '#F7F9FC', borderRadius: 14, paddingHorizontal: 12 },

  iconWrap: { width: 26, alignItems: 'center', marginRight: 8 },

  otpContainer: {
    width: '100%',
    flexDirection: "row",
    justifyContent: "space-between",
    
    marginBottom: 40,
    paddingHorizontal: 25,
    paddingTop: 40,
  },

  otpBox: {
    width: 40,
    height: 55,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    textAlign: "center",
    fontSize: 28,
    fontWeight: "700",
    elevation: 3,
  },

  input3dIcon: {
    marginRight: 12,
    width:25,
    height:25
  },

  inputInnerWrapper: { flex: 1 },

  inputLabel: { fontSize: 13, fontWeight: '700', color: C.muted, marginBottom: 6, marginLeft: 2, marginTop: 4 },

  textInput: { fontSize: 15, fontWeight: '600', color: C.ink, paddingVertical: 12 },

  footerContainer: { paddingTop: 14 },

  primaryButton: { height: 54, borderRadius: 27, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', elevation: 4 },

  primaryButton1: { height: 54, borderRadius: 27, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', elevation: 4 },

  primaryButtonText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  
  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  footerGraphic: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    overflow: 'hidden',
  },

  footerGraphic1: {

    position: 'absolute',
    bottom: 20,
    width: '100%',
    overflow: 'hidden',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25, 
  },
});

export default FlatmateLogin;