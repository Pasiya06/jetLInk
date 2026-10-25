import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";

import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, FontAwesome, Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import AlertBadge from "../../../components/AlertBadge";



import FieldError from "../../../components/FieldError";
import { useFieldErrors } from "../../../utils/validation";
const AddBus = () => {
  const params = useLocalSearchParams();
  const [busNumber, setBusNumber] = useState("");
  const [chassisNo, setChassisNo] = useState("");
  const [engineNo, setEngineNo] = useState("");
  const [colour, setColour] = useState("");
  const [noOfSeats, setnoOfSeats] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [licenseDate, setLicenseDate] = useState("");
  const [emissionDate, setEmissionDate] = useState("");
  const [date, setDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [showCalendar1, setShowCalendar1] = useState<boolean>(false);
  const [showCalendar2, setShowCalendar2] = useState<boolean>(false);
  const busType = params.busType as string;
  const driverNIC:string = "Not ";
  const conductorNIC:string = "Not ";
  const driverD:string = "Not login yet";
  const conductorD:string = "Not login yet";
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState('');
  const router = useRouter();
  const { validate: validateFields, errorFor: fieldError } = useFieldErrors();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

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

    setBusNumber(text);
  };

  

  const handleAddBus = async () => {
    if (!validateFields([
      { key: "busNumber", label: "Bus number", value: busNumber },
      { key: "chassisNo", label: "Chassis number", value: chassisNo },
      { key: "engineNo", label: "Engine number", value: engineNo },
      { key: "noOfSeats", label: "Number of seats", value: noOfSeats, type: "int" },
      { key: "colour", label: "Colour", value: colour },
      { key: "serviceDate", label: "Service date", value: serviceDate },
      { key: "licenseDate", label: "License date", value: licenseDate },
      { key: "emissionDate", label: "Emission date", value: emissionDate },
    ])) return;

    if (!busNumber || !chassisNo || !engineNo  || !colour || !serviceDate  || !licenseDate || !emissionDate) {
      alert("Please fill required fields");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/buses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            driverNIC,
            conductorNIC,
            driverD,
            conductorD,
            busNumber,
            chassisNo,
            engineNo,
            noOfSeats,
            colour, 
            serviceDate,
            licenseDate,
            emissionDate,
            busType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Bus Added Successfully");

        router.push({
          pathname: "/admin/buses/showBuses",
          params: {
            Aid: params.Aid,
            firstName: params.firstName,
            lastName: params.lastName,
            email: params.email,
            busType: params.busType,
            busTypeTopic:params.busTypeTopic,
          },
        });
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Server Connection Failed");
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <SafeAreaView style={styles.container}>

        <LinearGradient
          colors={["#173C79","#155B8A","#159B79",]}
        start={{x: 0, y: 0,}}
        end={{x: 1, y: 1,}}
          style={styles.header}
        >
          <TouchableOpacity>
            <View style={styles.headerContent}>
              
              <Text style={styles.title}>Normal Way Bus</Text>
              
            </View>
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.card}>
          <ScrollView style={styles.svw} showsVerticalScrollIndicator={false}>

            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Bus Number</Text>
                <View style={styles.inputWrapper}>
                <View style={[styles.iconWrap, { backgroundColor: "#f6a60518"  }]}>
                    <MaterialCommunityIcons name="bus" size={18} color="#f6ce05" />
                </View>
                <TextInput
                    style={styles.input}
                    value={busNumber}
                    onChangeText={handleBusNumber}
                    placeholder="BB-1234"
                    placeholderTextColor="#A0A5B1"
                    autoCapitalize="characters"
                    autoCorrect={false}
                />
                </View>
                <FieldError message={fieldError("busNumber", busNumber)} />
            </View>

            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Chassis No</Text>
                <View style={styles.inputWrapper}>
                <View style={[styles.iconWrap, { backgroundColor: "#06B6D418" }]}>
                    <Ionicons name="barcode-outline" size={18} color="#06B6D4" />
                </View>
                <TextInput
                    style={styles.input}
                    value={chassisNo}
                    onChangeText={(text) => setChassisNo(text.replace(/\s/g, "").toUpperCase())}
                    placeholder="CHS987654321"
                    placeholderTextColor="#A0A5B1"
                    autoCapitalize="characters"
                    autoCorrect={false}
                />
                </View>
                <FieldError message={fieldError("chassisNo", chassisNo)} />
            </View>

            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Engine No</Text>
                <View style={styles.inputWrapper}>
                <View style={[styles.iconWrap, { backgroundColor: "#EF444418" }]}>
                    <MaterialCommunityIcons name ="engine-outline" size={18} color="#EF4444" />
                </View>
                <TextInput
                    style={styles.input}
                    value={engineNo}
                    onChangeText={(text) => setEngineNo(text.replace(/\s/g, "").toUpperCase())}
                    placeholder="EN12345678"
                    placeholderTextColor="#A0A5B1"
                    autoCapitalize="characters"
                    autoCorrect={false}
                />
                </View>
                <FieldError message={fieldError("engineNo", engineNo)} />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Number of seats</Text>
              <View style={styles.inputWrapper}>
                <View style={[styles.iconWrap, { backgroundColor: "#fe880018" }]}>
                    <MaterialCommunityIcons name ="car-seat" size={18} color="#fe8800" />
                </View>
                <TextInput 
                  style={styles.input} 
                  value={noOfSeats} 
                  onChangeText={setnoOfSeats} 
                  keyboardType="phone-pad" 
                  maxLength={2} />           
              </View>
              <FieldError message={fieldError("noOfSeats", noOfSeats)} />
            </View>
            
            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Colour</Text>
                <View style={styles.inputWrapper}>
                <View style={[styles.iconWrap, { backgroundColor: "#EC489918" }]}>
                    <Ionicons name="color-palette-outline" size={18} color="#EC4899" />
                </View>
                <TextInput
                    style={styles.input}
                    value={colour}
                    onChangeText={(text) => setColour(text.replace(/\s/g, "").toUpperCase())}
                    placeholder="GREEN"
                    placeholderTextColor="#A0A5B1"
                    autoCapitalize="characters"
                    autoCorrect={false}
                />
                </View>
                <FieldError message={fieldError("colour", colour)} />
            </View>

            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Service Date</Text>
                <View style={styles.inputWrapper}>
                    <View style={[styles.iconWrap, { backgroundColor: "#10B98118" }]}>
                        <Ionicons name="calendar-outline" size={18} color="#10B981" />
                    </View>
                    <TextInput
                        style={styles.input}
                        value={serviceDate}
                        onChangeText={setServiceDate}
                        placeholder="MM/DD/YYYY"
                        placeholderTextColor="#A0A5B1"
                    />
                    <TouchableOpacity onPress={() => setShowCalendar(true)}>
                        <FontAwesome5 name="calendar-alt" size={24} color="#A0A5B1" />  
                    </TouchableOpacity>
                </View>
                <FieldError message={fieldError("serviceDate", serviceDate)} />
                
            </View>

            <View style={styles.fieldContainer}>
                <Text style={styles.label}>License Date</Text>
                <View style={styles.inputWrapper}>
                    <View style={[styles.iconWrap, { backgroundColor: "#3B82F618" }]}>
                        <Ionicons name="document-text-outline" size={18} color="#3B82F6" />
                    </View>
                    <TextInput
                        style={styles.input}
                        value={licenseDate}
                        onChangeText={setLicenseDate}
                        placeholder="MM/DD/YYYY"
                        placeholderTextColor="#A0A5B1"
                    />
                    <TouchableOpacity onPress={() => setShowCalendar1(true)}>
                        <FontAwesome5 name="calendar-alt" size={24} color="#A0A5B1" />  
                    </TouchableOpacity>
                </View>
                <FieldError message={fieldError("licenseDate", licenseDate)} />
                
            </View>

            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Emission Date</Text>
                <View style={styles.inputWrapper}>
                    <View style={[styles.iconWrap, { backgroundColor: "#84CC1618" }]}>
                        <Ionicons name="leaf-outline" size={18} color="#84CC16" />
                    </View>
                    <TextInput
                        style={styles.input}
                        value={emissionDate}
                        onChangeText={setEmissionDate}
                        placeholder="MM/DD/YYYY"
                        placeholderTextColor="#A0A5B1"
                    />
                    <TouchableOpacity onPress={() => setShowCalendar2(true)}>
                        <FontAwesome5 name="calendar-alt" size={24} color="#A0A5B1" />  
                    </TouchableOpacity>
                </View>
                <FieldError message={fieldError("emissionDate", emissionDate)} />
                
            </View>

            {showCalendar && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowCalendar(false);
                      if (selectedDate) {
                        setDate(selectedDate);
                        setServiceDate(selectedDate.toLocaleDateString()); 
                      }
                    }}
                  />
                )}

                {showCalendar1 && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowCalendar1(false);
                      if (selectedDate) {
                        setDate(selectedDate);
                        setLicenseDate(selectedDate.toLocaleDateString());
                        
                      }
                    }}
                  />
                )}

                {showCalendar2 && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowCalendar2(false);
                      if (selectedDate) {
                        setDate(selectedDate);
                        setEmissionDate(selectedDate.toLocaleDateString()); 
                      }
                    }}
                  />
                )}      


          </ScrollView>

          <TouchableOpacity activeOpacity={0.85} style={styles.searchButton} onPress={handleAddBus}>
            <LinearGradient
              colors={["#173C79","#155B8A","#159B79",]}
        start={{x: 0, y: 0,}}
        end={{x: 1, y: 1,}}
              style={styles.submitGradient}
            >
              <Text style={styles.searchButtonText}>Add Bus</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {isSearching ? (
          <TextInput
            style={styles.searchBarInput}
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
          />
        ) : null}

        <View style={styles.bottomNav}>

          <TouchableOpacity style={styles.item} onPress={() => {
            setActiveTab("home");
            if (isSearching) {
              setIsSearching(false);
            } else {
              router.push({
                pathname: "/admin/buses/showBuses",
                params: {
                  Aid: params.Aid,
                  firstName: params.firstName,
                  lastName: params.lastName,
                  email: params.email,
                  busType: params.busType,
                  busTypeTopic:params.busTypeTopic,
                },
              });
            }
          }}>
            <Ionicons name={isSearching ? "arrow-back" : "arrow-back-outline"} size={24} color={activeTab === "home" ? "#0057D9" : "#8A8A8A"} />
            <Text style={[styles.label1, activeTab === "home" && styles.activeLabel]}>
              Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("routes"); setIsSearching(!isSearching); }}>
            <FontAwesome name={isSearching ? "close" : "search"} size={24} color={activeTab === "routes" ? "#0057D9" : "#8A8A8A"} />
            <Text style={[styles.label1, activeTab === "routes" && styles.activeLabel]}>
              Routes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.centerButton} onPress={() => {setActiveTab("tickets"); router.push({
                        pathname: "/admin/index1",
                        params: {
                          Aid: params.Aid,
                          firstName: params.firstName,
                          lastName: params.lastName,
                          email: params.email,
                        },                    
                    });}} > 
                <Ionicons name="home-outline" size={28} color="#fff" />             
            </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("alerts"); router.push({ pathname: "/notifications", params: { role: "admin" } }); }}>
            <View><Ionicons name="notifications-outline" size={24} color={activeTab === "alerts" ? "#0057D9" : "#8A8A8A"} /><AlertBadge role="admin" /></View>
            <Text style={[styles.label1, activeTab === "alerts" && styles.activeLabel]}>
              Alerts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => {setActiveTab("profile"); router.push({
                      pathname: "/admin/Profile/adminProfile",
                      params: {
                        Aid: params.Aid,
                        firstName: params.firstName,
                        lastName: params.lastName,
                        email: params.email,
                      },
                    });}}>
                    <Feather name="user" size={24} color={activeTab === "profile" ? "#0057D9" : "#8A8A8A"}/>
                    <Text style={[styles.label1, activeTab === "profile" && styles.activeLabel,]}>
                      Profile
                    </Text>
                  </TouchableOpacity>
        </View>

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
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },

  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 70,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  headerContent: {
    alignItems: 'center',
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
    marginTop: 8,
  },

  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  card: {
    width: '90%',
    flex: 1,
    maxHeight: '68%',
    backgroundColor: '#FFF',
    padding: 20,
    marginTop: -50,
    alignSelf: 'center',
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },

  svw: {
    width: '100%',
    marginBottom: 70,
  },

  fieldContainer: {
    marginBottom: 16,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A4F5C',
    marginBottom: 8,
    marginLeft: 2,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    paddingHorizontal: 12,
    height: 52,
  },

  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: '#1A1D26',
  },

  searchButton: {
    position: "absolute",
    bottom: 15,
    left: 10,
    right: 10,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 10,
  },

  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 55,
    gap: 8,
  },

  searchButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  bottomNav: {
    position: "absolute",
    bottom: 15,
    left: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 60,
    height: 75,
    backgroundColor: "#fff",
    borderRadius: 25,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 10,
  },

  searchBarInput: {
    position: "absolute",
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginLeft: 15,
    marginTop: 45,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    width: '90%',
  },

  item: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  label1: {
    marginTop: 4,
    fontSize: 13,
    color: "#8A8A8A",
  },

  activeLabel: {
    color: "#0057D9",
    fontWeight: "600",
  },

  centerButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#2F80ED",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -28,
    shadowColor: "#2F80ED",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 12,
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

export default AddBus;