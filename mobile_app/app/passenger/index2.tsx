import React, { useState } from 'react';
import { Stack, useRouter } from "expo-router";
import { Image } from 'react-native';
import {
  Alert,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView
} from 'react-native';

import { Feather as Icon, MaterialIcons } from '@expo/vector-icons';

// Retrieve the base API URL from Expo environment variables
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const FlatmateLogin: React.FC = () => {
  const router = useRouter();
  const [isLoginTab, setIsLoginTab] = useState<boolean>(true);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [address, setAdress] = useState<string>('');
  const [NIC, setNIC] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [email1, setEmail1] = useState<string>('');
  const [password1, setPassword1] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  

  const registerPassenger = async () => {

    if (!firstName || !lastName  || !phoneNumber || !address || !NIC || !email || !password ) {
    alert("Please fill required fields");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
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

const loginPassenger = async () => {

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

  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#7db300" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/")}>
            <Text style={styles.title}>{isLoginTab ? 'Login' : 'Register'}</Text>
          </TouchableOpacity>
        </View>
        
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

          {!isLoginTab && (
            <ScrollView style={styles.svw} showsVerticalScrollIndicator={false}>
              <View style={styles.formContainer}>
               
                <Text style={styles.inputLabel}>First Name</Text>  
                <View style={styles.inputWrapper}>
                  <Image source={require("../../assets/images/icons8-user-account-94.png")} style={styles.input3dIcon} />
                  <View style={styles.inputInnerWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder="Deshith"
                      placeholderTextColor="#A3A3A3"
                    />
                  </View>
                </View>

                <Text style={styles.inputLabel}>Last Name</Text>  
                <View style={styles.inputWrapper}>
                  <Image source={require("../../assets/images/icons8-user-account-94.png")} style={styles.input3dIcon} />
                  <View style={styles.inputInnerWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Sandakelum"
                      placeholderTextColor="#A3A3A3"
                    />
                  </View>
                </View>

                <Text style={styles.inputLabel}>Phone Number</Text>  
                <View style={styles.inputWrapper}>
                  <Image source={require("../../assets/images/icons8-phone-94.png")} style={styles.input3dIcon} />
                  <View style={styles.inputInnerWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      placeholder="077 1234567"
                      placeholderTextColor="#A3A3A3"
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                  </View>
                </View>

                <Text style={styles.inputLabel}>Address</Text>  
                <View style={styles.inputWrapper}>
                  <Image source={require("../../assets/images/icons8-home-address-94.png")} style={styles.input3dIcon} />
                  <View style={styles.inputInnerWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={address}
                      onChangeText={setAdress}
                      placeholder="15/2 Galle road, Colombo"
                      placeholderTextColor="#A3A3A3"
                    />
                  </View>
                </View>

                <Text style={styles.inputLabel}>NIC</Text>  
                <View style={styles.inputWrapper}>
                  <Image source={require("../../assets/images/icons8-loyalty-94.png")} style={styles.input3dIcon} />
                  <View style={styles.inputInnerWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={NIC}
                      onChangeText={(text) => setNIC(text.toUpperCase())}
                      placeholder="123456789012 or 123456789V"
                      placeholderTextColor="#A3A3A3"
                      maxLength={12}
                      autoCapitalize="characters"
                    />
                  </View>
                </View>

                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <Image source={require("../../assets/images/icons8-gmail-logo-94.png")} style={styles.input3dIcon} />
                  <View style={styles.inputInnerWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="ABC@gmail.com"
                      placeholderTextColor="#A3A3A3"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Image source={require("../../assets/images/icons8-lock-94.png")} style={styles.input3dIcon} />
                  <View style={styles.inputInnerWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Abc@123"
                      placeholderTextColor="#A3A3A3"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                  </View>
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Icon name={showPassword ? 'eye' : 'eye-off'} size={20} color="#000000" />
                  </TouchableOpacity>
                </View>

                

                
              </View>
            </ScrollView> 
          )}

          {isLoginTab && (
            <View style={styles.formContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Image source={require("../../assets/images/icons8-gmail-logo-94.png")} style={styles.input3dIcon} />
                <View style={styles.inputInnerWrapper}>
                  <TextInput
                    style={styles.textInput}
                    value={email1}
                    onChangeText={setEmail1}
                    placeholder="ABC@gmail.com"
                    placeholderTextColor="#A3A3A3"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Image source={require("../../assets/images/icons8-lock-94.png")} style={styles.input3dIcon} />
                <View style={styles.inputInnerWrapper}>
                  <TextInput
                    style={styles.textInput}
                    value={password1}
                    onChangeText={setPassword1}
                    placeholder="Abc@123"
                    placeholderTextColor="#A3A3A3"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                </View>
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Icon name={showPassword ? 'eye' : 'eye-off'} size={20} color="#000000" />
                </TouchableOpacity>
              </View>

              <View style={styles.rowJustify}>
                <TouchableOpacity>
                  <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Footer Actions */}
          <View style={styles.footerContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={isLoginTab ? loginPassenger : registerPassenger}>
              <Text style={styles.primaryButtonText}>
                {isLoginTab ? 'Login' : 'Register'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footerGraphic}>
          <View style={styles.blueCurve} />
          <View style={styles.greenCurve} />
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 70,   
    backgroundColor: '#0047AB',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  card: {
    width: '90%',
    flex: 1,
    maxHeight: '75%',
    backgroundColor: '#FFF',
    padding: 24,
    alignItems: 'center',
    marginTop: -50,   
    alignSelf: 'center',
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  tabContainer: {
    width: '100%',
    backgroundColor: '#F2F4F5',
    borderRadius: 12,
    flexDirection: 'row',
    padding: 6,
    marginTop: 12,
    marginBottom: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: '#32CD32',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0056b3',
  },
  activeTabButtonText: {
    color: '#FFF',
  },
  svw: {
    width: '100%'
  },
  formContainer: {
    width: '100%',
    marginTop: 14,
    paddingBottom: 20,
  },
  inputWrapper: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F4F5',
    borderWidth: 1,
    borderColor: '#32CD32',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 15,
  },
  input3dIcon: {
    marginRight: 12,
    width: 25,
    height: 25
  },
  input3dIcon1: {
    marginRight: -4,
    width: 25,
    height: 25
  },
  inputInnerWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    color: '#0056b3',
    fontWeight: '500',
    marginBottom: 10,
  },
  textInput: {
    fontSize: 16,
    color: '#0056b3',
    fontWeight: '500',
    padding: 0, 
  },
  textInputG: {
    fontSize: 16,
    color: '#A3A3A3',
    fontWeight: '500',
    padding: 0, 
  },
  eyeIcon: {
    padding: 4,
  },
  underIcon: {
    marginRight: -11,   
  },
  radioBox: {
    backgroundColor: '#F2F4F5',
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#32CD32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#32CD32',
  },
  radioText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#0056b3',
  },
  rowJustify: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 15,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 12,
    color: '#0056b3',
    fontWeight: '500',
    marginLeft: 8,
  },
  forgotPasswordText: {
    fontSize: 12,
    color: '#32CD32',
    fontWeight: '500',
  },
  footerContainer: {
    width: '100%',
    marginTop: 'auto', 
    paddingBottom: 10,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#32CD32',
    padding: 14,
    alignItems: 'center',   
    alignSelf: 'center',
    marginTop: 10,
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  footerGraphic: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 45,
    overflow: 'hidden',
  },
  blueCurve: {
    backgroundColor: '#c82a2a',
    width: '100%',
    borderRadius: 30,
    position: 'absolute',
  },
  greenCurve: {
    backgroundColor: '#0052cc',
    height: 100,
    width: '100%',
    borderRadius: 30,
    position: 'absolute',
  },
});

export default FlatmateLogin;