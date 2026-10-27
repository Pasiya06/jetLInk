import React, { useEffect, useRef, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { Image, StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, StatusBar, Alert, BackHandler    } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather as Icon, AntDesign, Fontisto, EvilIcons, Ionicons } from '@expo/vector-icons';
import { saveSession } from "../../services/notificationService";


import FieldError from "../../components/FieldError";
import { useFieldErrors } from "../../utils/validation";
import { C } from "../../components/JetUI";
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
      alert("Invalid Bus Number");
      return;
    }
     
    setVerifiedBusno(bus.data.busNumber);

    const dResponse = await fetch(`${API_URL}/buses/check1/${DNIC}`);
    const d = await dResponse.json();
    if (d.exists) {
      alert("Driver login with another bus");
      return;
    }

    const cResponse = await fetch(`${API_URL}/buses/check2/${CNIC}`);
    const c = await cResponse.json();
    if (c.exists) {
      alert("Conductor login with another bus");
      return;
    }

    const driverResponse = await fetch(`${API_URL}/drivers/check/${DNIC}`);
    const driver = await driverResponse.json();
    if (!driver.exists) {
      alert(driver.message || "Invalid Driver NIC");
      return;
    }

    setVerifiedDNIC(driver.data.NIC);
    setdfirstname(driver.data.firstName);
    setdlastname(driver.data.lastName);
    setdphonenumber(driver.data.phoneNumber);
  
    const conductorResponse = await fetch(`${API_URL}/conductors/check/${CNIC}`);
    const conductor = await conductorResponse.json();
    if (!conductor.exists) {
      alert(conductor.message ||"Invalid Conductor NIC");
      return;
    }

    // Store the verified NIC clearly, not conductorId
    setVerifiedCNIC(conductor.data.NIC);

    setShowOtp(true);
  } catch (error) {
    console.log(error);
    alert("Server connection failed");
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
      alert(data.message);
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
    alert("Server Error");
  }
};


  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#173C79" />
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={["#173C79","#155B8A","#159B79",]}
          start={{x: 0, y: 0,}}
          end={{x: 1, y: 1,}}
          style={styles.hero}
        >
          <View style={styles.logo}>
            <Fontisto name="bus" size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Bus staff sign in</Text>
          <Text style={styles.heroSub}>
            {showLogin ? "Step 2 of 2 · Enter your passcode" : "Step 1 of 2 · Verify your bus and crew"}
          </Text>
        </LinearGradient>
        
        
                
              
        {!showLogin ? (
          <View style={styles.card}>
            <View style={styles.formContainer}>
              {/* Bus number */}
              <View style={styles.field}>
                <Text style={styles.inputLabel}>Bus Number</Text>
                <View style={styles.inputWrapper1}>
                  <View style={styles.iconWrap}>
                    <Fontisto name="bus" size={16} color={C.blue} />
                  </View>
                  <View style={styles.inputInnerWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={busNum}
                      onChangeText={handleBusNumber}
                      placeholder="Bus Number"
                      placeholderTextColor="#8A97A8"
                      autoCapitalize="characters"
                      autoCorrect={false}
                      maxLength={7}
                    />
                  </View>
                </View>
                <FieldError style={styles.fieldError} message={fieldError("busNum", busNum)} />
              </View>

              {/* Driver NIC */}
              <View style={styles.field}>
                <Text style={styles.inputLabel}>Driver NIC</Text>
                <View style={styles.inputWrapper1}>
                  <View style={styles.iconWrap}>
                    <AntDesign name="idcard" size={18} color={C.blue} />
                  </View>
                  <View style={styles.inputInnerWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={DNIC}
                      onChangeText={DsetNIC}
                      placeholder="123456789012"
                      placeholderTextColor="#8A97A8"
                    />
                  </View>
                </View>
                <FieldError style={styles.fieldError} message={fieldError("DNIC", DNIC)} />
              </View>

              {/* Conductor NIC */}
              <View style={styles.field}>
                <Text style={styles.inputLabel}>Conductor NIC</Text>
                <View style={styles.inputWrapper1}>
                  <View style={styles.iconWrap}>
                    <AntDesign name="idcard" size={18} color={C.blue} />
                  </View>
                  <View style={styles.inputInnerWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={CNIC}
                      onChangeText={CsetNIC}
                      placeholder="123456789012"
                      placeholderTextColor="#8A97A8"
                    />
                  </View>
                </View>
                <FieldError style={styles.fieldError} message={fieldError("CNIC", CNIC)} />
              </View>
            </View>

            <View style={styles.footerContainer}>
              <TouchableOpacity style={styles.primaryButton} onPress={verify}>
                <LinearGradient
                  colors={["#173C79", "#155B8A", "#159B79"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.primaryButtonText}>Verify</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.card1}>
            <View style={styles.formContainer}>
              {/* Passcode */}
              <View style={styles.field}>
                <Text style={styles.inputLabel}>Passcode</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.iconWrap}>
                    <Ionicons name="lock-closed-outline" size={18} color={C.blue} />
                  </View>
                  <View style={styles.inputInnerWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={password1}
                      onChangeText={setPassword1}
                      placeholder="Abc@123"
                      placeholderTextColor="#8A97A8"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                  </View>
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Icon name={showPassword ? 'eye' : 'eye-off'} size={20} color={C.muted} />
                  </TouchableOpacity>
                </View>
                <FieldError style={styles.fieldError} message={fieldError("password1", password1)} />
              </View>
            </View>

            <View style={styles.footerContainer}>
              <TouchableOpacity style={styles.primaryButton1} onPress={login}>
                <LinearGradient
                  colors={["#173C79", "#155B8A", "#159B79"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.primaryButtonText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

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
  heroSub: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.88)', marginTop: 4 },
  logo: { width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  hero: { borderBottomLeftRadius: 32, borderBottomRightRadius: 32, paddingTop: 56, paddingBottom: 92, alignItems: 'center' },
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

  title: { fontSize: 26, fontWeight: '800', color: '#FFFFFF' },

  card: {
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