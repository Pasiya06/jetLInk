import React, { useEffect, useRef, useState } from 'react';
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import {
  Alert,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  BackHandler
} from 'react-native';

import { Feather as Icon, EvilIcons, Fontisto, MaterialCommunityIcons, Entypo, AntDesign, Feather, Ionicons  } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveSession } from '../../services/notificationService';

import FieldError from "../../components/FieldError";
import { useFieldErrors } from "../../utils/validation";
import { C } from "../../components/JetUI";
// Retrieve the base API URL from Expo environment variables
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const FlatmateLogin: React.FC = () => {
  const router = useRouter();
  const { validate: validateFields, errorFor: fieldError } = useFieldErrors();
  const params = useLocalSearchParams();
  const [isLoginTab, setIsLoginTab] = useState<boolean>(true);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [address, setAdress] = useState<string>('');
  const [NIC, setNIC] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [email1, setEmail1] = useState(String(params.email || ""));
  const [Admiemail, setAdmiEmail] = useState<string>('');
  const [password1, setPassword1] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

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
  
//register passenger
  const registerPassenger = async () => {
    if (!validateFields([
      { key: "firstName", label: "First name", value: firstName },
      { key: "lastName", label: "Last name", value: lastName },
      { key: "phoneNumber", label: "Phone number", value: phoneNumber, type: "phone" },
      { key: "address", label: "Address", value: address },
      { key: "NIC", label: "NIC", value: NIC, type: "nic" },
      { key: "email", label: "Email", value: email, type: "email" },
      { key: "password", label: "Password", value: password, type: "password" },
    ])) return;


    if (!firstName || !lastName  || !phoneNumber || !address || !NIC || !email || !password ) {
    alert("Please fill required fields");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return false;
    }

    const adminemai:string = "admin@gmail.com";

  if (adminemai === email) {
      Alert.alert("This is Admin Email you can't use this.");
      return false;
    }

  

  const phoneRegex = /^[0-9]{10}$/;

  if (!phoneRegex.test(phoneNumber)) {
    Alert.alert(
      "Invalid Phone Number",
      "Phone number must contain exactly 10 digits."
    );
    return false;
  }

  const nicRegex = /^(\d{12}|\d{9}[VXvx])$/;

    if (!nicRegex.test(NIC)) {
      Alert.alert(
        "Invalid NIC",
        "NIC must be either 12 digits or 9 digits followed by V/X"
      );
      return false;
    }


    try {
      const response = await fetch(`${API_URL}/passengers/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({

          firstName,
          lastName,
          phoneNumber,
          address,
          NIC,
          email,
          password,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert("Passenger Registered Successfully");
        router.push("/passenger/index2");
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.log(error);
      alert("Server connection failed");
    }
  };
//login passenger
const loginPassenger = async () => {
  if (!validateFields([
    { key: "email1", label: "Email", value: email1, type: "email" },
    { key: "password1", label: "Password", value: password1 },
  ])) return;


  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    if (!emailRegex.test(email1)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return false;
    }

  try {
    
    const response1 = await fetch(`${API_URL}/passengers/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email1,
        password: password1,
      }),
    });

    const data1 = await response1.json();

    if (data1.success) {
      const user = data1.passenger;

      // Remember who is signed in so the Profile screen works from any page
      await AsyncStorage.setItem("@jetlink_passenger_nic", String(user.NIC ?? "")).catch(() => {});
      await saveSession({ role: "passenger" });
      
      router.push({
        pathname: "/passenger/index1",
        params: {
          Pid: user._id,
          Pid1: user.passengerId,
          pfirstName: user.firstName,
          plastName: user.lastName,
          pphoneNumber: user.phoneNumber,
          address: user.address,
          NIC: user.NIC,
          pemail: user.email,
        },
      });

      return;
    }

    // Admin Login
    const response2 = await fetch(`${API_URL}/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email1,
        password: password1,
      }),
    });

    const data2 = await response2.json();

    

    if (data2.success) {
      const admin = data2.admin;
      // Admin alerts: this phone will now receive admin notifications
      await saveSession({ role: "admin" });
      setAdmiEmail(admin.email)
      router.push({
        pathname: "/admin/index1",
        params: {
          Aid: admin._id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
        },
      });

      return;
    }

    alert(data1.message );

  } catch (error) {
    console.log(error);
    alert("Server connection failed");
  }
};

  const handleSearch1 = () => {
    router.push({pathname: "/passenger/fogotPassword",params:{ email: email1,}});
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
            <Ionicons name="bus" size={26} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>{isLoginTab ? "Welcome back" : "Create account"}</Text>
          <Text style={styles.heroSub}>
            {isLoginTab ? "Log in to book tickets, parcels and tours" : "Join JetLink in under a minute"}
          </Text>
        </LinearGradient>
        
       

          {!isLoginTab && (
            <View style={styles.card}>
          {/* Segmented Control / Tab Switcher */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, isLoginTab && styles.activeTabButton]}
              onPress={() => setIsLoginTab(true)}
            >
              <Text style={[styles.tabButtonText, isLoginTab && styles.activeTabButtonText]}>
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, !isLoginTab && styles.activeTabButton]}
              onPress={() => setIsLoginTab(false)}
            >
              <Text style={[styles.tabButtonText, !isLoginTab && styles.activeTabButtonText]}>
                Register
              </Text>
            </TouchableOpacity>
          </View>
            <ScrollView style={styles.svw} showsVerticalScrollIndicator={false}>
              <View style={styles.formContainer}>
               
                <Text style={styles.inputLabel}>First Name</Text>  
                <View style={styles.inputWrapper}>
                  <View style={[styles.iconWrap, ]}>
                    <Ionicons name="person" size={18} color={C.blue} />
                  </View>
                  <View style={styles.inputInnerWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder="Deshith"
                      placeholderTextColor="#8A97A8"
                    />
                  </View>
                </View>
                <FieldError message={fieldError("firstName", firstName)} />

                <Text style={styles.inputLabel}>Last Name</Text>  
                <View style={styles.inputWrapper}>
                  <View style={[styles.iconWrap, ]}>
                      <Ionicons name="person" size={18} color={C.blue} />
                  </View>
                  <View style={styles.inputInnerWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Sandakelum"
                      placeholderTextColor="#8A97A8"
                    />
                  </View>
                </View>
                <FieldError message={fieldError("lastName", lastName)} />

                <Text style={styles.inputLabel}>Phone Number</Text>  
                <View style={styles.inputWrapper}>
                  <View style={[styles.iconWrap, ]}>
                      <Feather name="phone" size={18} color={C.blue} />
                  </View>
                  <View style={styles.inputInnerWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      placeholder="077 1234567"
                      placeholderTextColor="#8A97A8"
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                  </View>
                </View>
                <FieldError message={fieldError("phoneNumber", phoneNumber)} />

                <Text style={styles.inputLabel}>Address</Text>  
                <View style={styles.inputWrapper}>
                  
                  <View style={[styles.iconWrap, ]}>
                      <Entypo name="location" size={18} color={C.blue} />
                  </View>
                  <View style={styles.inputInnerWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={address}
                      onChangeText={setAdress}
                      placeholder="15/2 Galle road, Colombo"
                      placeholderTextColor="#8A97A8"
                    />
                  </View>
                </View>
                <FieldError message={fieldError("address", address)} />

                <Text style={styles.inputLabel}>NIC</Text>  
                <View style={styles.inputWrapper}>
                  <View style={[styles.iconWrap, ]}>
                      <AntDesign name="idcard" size={18} color={C.blue} />
                  </View>
                  <View style={styles.inputInnerWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={NIC}
                      onChangeText={(text) => setNIC(text.toUpperCase())}
                      placeholder="123456789012 or 123456789V"
                      placeholderTextColor="#8A97A8"
                      maxLength={12}
                      autoCapitalize="characters"
                    />
                  </View>
                </View>
                <FieldError message={fieldError("NIC", NIC)} />

                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <View style={[styles.iconWrap, ]}>
                    <Fontisto name="email" size={18} color={C.blue} />
                  </View>
                  <View style={styles.inputInnerWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={email}
                      placeholder="ABC@gmail.com"
                      placeholderTextColor="#8A97A8"
                      keyboardType="email-address"
                      onChangeText={(text) => setEmail(text.replace(/\s/g, "").toLowerCase())} 
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>
                <FieldError message={fieldError("email", email)} />

                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                  <View style={[styles.iconWrap, ]}>
                    <Ionicons name="lock-closed-outline" size={18} color={C.blue} />
                  </View>
                  <View style={styles.inputInnerWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={password}
                      onChangeText={setPassword}
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
                <FieldError message={fieldError("password", password)} />

                

                
              </View>
            </ScrollView> 
            {/* Footer Actions */}
              <View style={styles.footerContainer}>
                <TouchableOpacity style={styles.primaryButton} onPress={isLoginTab ? loginPassenger : registerPassenger}>
                  <LinearGradient
                    colors={["#173C79", "#155B8A", "#159B79"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={styles.primaryButtonText}>
                    {isLoginTab ? 'Login' : 'Register'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {isLoginTab && (
             <View style={styles.card1}>
          {/* Segmented Control / Tab Switcher */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, isLoginTab && styles.activeTabButton]}
              onPress={() => setIsLoginTab(true)}
            >
              <Text style={[styles.tabButtonText, isLoginTab && styles.activeTabButtonText]}>
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, !isLoginTab && styles.activeTabButton]}
              onPress={() => setIsLoginTab(false)}
            >
              <Text style={[styles.tabButtonText, !isLoginTab && styles.activeTabButtonText]}>
                Register
              </Text>
            </TouchableOpacity>
          </View>
            <View style={styles.formContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <View style={[styles.iconWrap, ]}>
                    <Fontisto name="email" size={18} color={C.blue} />
                </View>
                <View style={styles.inputInnerWrapper}>
                  <TextInput
                    style={styles.textInput}
                    value={email1}
                    placeholder="ABC@gmail.com"
                    placeholderTextColor="#8A97A8"
                    keyboardType="email-address"
                    onChangeText={(text) => setEmail1(text.replace(/\s/g, "").toLowerCase())} 
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>
              <FieldError message={fieldError("email1", email1)} />

              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <View style={[styles.iconWrap, ]}>
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
              <FieldError message={fieldError("password1", password1)} />

              <View style={styles.rowJustify}>
                <TouchableOpacity onPress={handleSearch1}>
                  <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>
            </View>
            
                <TouchableOpacity style={styles.primaryButton1} onPress={isLoginTab ? loginPassenger : registerPassenger}>
                  <LinearGradient
                    colors={["#173C79", "#155B8A", "#159B79"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={styles.primaryButtonText}>
                    {isLoginTab ? 'Login' : 'Register'}
                  </Text>
                </TouchableOpacity>
              
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
  title: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  card: {
    flex: 1,
    marginTop: -64,
    marginHorizontal: 16,
    marginBottom: 110,
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

  iconWrap: { width: 26, alignItems: 'center', marginRight: 8 },

  tabContainer: { flexDirection: 'row', backgroundColor: C.bg, borderRadius: 16, padding: 5, gap: 6, marginBottom: 18 },
  tabButton: { flex: 1, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  activeTabButton: { backgroundColor: C.blue },
  tabButtonText: { fontSize: 15, fontWeight: '700', color: C.blue },
  activeTabButtonText: { color: '#FFFFFF' },
  svw: { flex: 1 },
  formContainer: { width: '100%' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', minHeight: 52, borderWidth: 1.5, borderColor: '#E3E9F1', backgroundColor: '#F7F9FC', borderRadius: 14, paddingHorizontal: 12 },
  
  inputInnerWrapper: { flex: 1 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: C.muted, marginBottom: 6, marginLeft: 2, marginTop: 4 },
  textInput: { fontSize: 15, fontWeight: '600', color: C.ink, paddingVertical: 12 },
 
  eyeIcon: { padding: 6 },
  
  rowJustify: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  
  
  forgotPasswordText: { fontSize: 14, fontWeight: '700', color: C.blue },
  footerContainer: { paddingTop: 12 },
  primaryButton: { height: 54, borderRadius: 27, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', elevation: 4 },

  primaryButton1: { height: 54, borderRadius: 27, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginTop: 18, elevation: 4 },

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