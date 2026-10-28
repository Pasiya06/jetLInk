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
import { FormSection, FormField, PickerField, FieldRow } from "../../../components/JetForm";
import { ScreenHeader, GradientButton, C, ui } from "../../../components/JetUI";
import SearchPanel from "../../../components/SearchPanel";
import { Alert } from "../../../components/JetAlert";

import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, FontAwesome, Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import AlertBadge from "../../../components/AlertBadge";



import FieldError from "../../../components/FieldError";
import { loadBusNames } from "../../../components/BusName";
import { useFieldErrors } from "../../../utils/validation";
const AddBus = () => {
  const params = useLocalSearchParams();
  const [busNumber, setBusNumber] = useState("");
  const [busName, setBusName] = useState("");
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
      { key: "busName", label: "Bus name", value: busName },
      { key: "busNumber", label: "Bus number", value: busNumber },
      { key: "chassisNo", label: "Chassis number", value: chassisNo },
      { key: "engineNo", label: "Engine number", value: engineNo },
      { key: "noOfSeats", label: "Number of seats", value: noOfSeats, type: "int" },
      { key: "colour", label: "Colour", value: colour },
      { key: "serviceDate", label: "Service date", value: serviceDate },
      { key: "licenseDate", label: "License date", value: licenseDate },
      { key: "emissionDate", label: "Emission date", value: emissionDate },
    ])) return;

    if (!busName.trim() || !busNumber || !chassisNo || !engineNo  || !colour || !serviceDate  || !licenseDate || !emissionDate) {
      Alert.alert("Missing details", "Please fill in all the required fields.");
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
            busName: busName.trim(),
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
        loadBusNames(true);
        Alert.alert("Bus added", "The bus was added successfully.");

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
        Alert.alert("Couldn't add bus", String(data.message || "Please check the details and try again."));
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Connection failed", "Couldn't reach the server. Please check your internet connection and try again.");
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>

        <ScreenHeader eyebrow={`${params.busTypeTopic || "Bus"} fleet`} title="Add a bus" />

        <ScrollView
          style={ui.body}
          contentContainerStyle={ui.bodyContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <FormSection title="Bus details" subtitle="Registration and vehicle numbers" icon="bus-outline">
            <FormField
              label="Bus name"
              icon="bus-outline"
              value={busName}
              onChangeText={(text) => setBusName(text.replace(/\s/g, "").toUpperCase())}
              placeholder="GALLE-MATARA or DAM RAJINI"
              autoCorrect={false}
              autoCapitalize="characters"
              maxLength={40}
              error={fieldError("busName", busName)}
            />
            <FormField
              label="Bus number"
              icon="pricetag-outline"
              value={busNumber}
              onChangeText={handleBusNumber}
              placeholder="BB-1234"
              autoCapitalize="characters"
              autoCorrect={false}
              error={fieldError("busNumber", busNumber)}
            />
            <FormField
              label="Chassis number"
              icon="barcode-outline"
              value={chassisNo}
              onChangeText={(text) => setChassisNo(text.replace(/\s/g, "").toUpperCase())}
              placeholder="CHS987654321"
              autoCapitalize="characters"
              autoCorrect={false}
              error={fieldError("chassisNo", chassisNo)}
            />
            <FormField
              label="Engine number"
              icon="hardware-chip-outline"
              value={engineNo}
              onChangeText={(text) => setEngineNo(text.replace(/\s/g, "").toUpperCase())}
              placeholder="EN12345678"
              autoCapitalize="characters"
              autoCorrect={false}
              error={fieldError("engineNo", engineNo)}
            />
            <FieldRow>
              <FormField
                label="Seats"
                icon="people-outline"
                value={noOfSeats}
                onChangeText={(t) => setnoOfSeats(t.replace(/[^0-9]/g, ""))}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="54"
                error={fieldError("noOfSeats", noOfSeats)}
              />
              <FormField
                label="Colour"
                icon="color-palette-outline"
                value={colour}
                onChangeText={(text) => setColour(text.replace(/\s/g, "").toUpperCase())}
                placeholder="GREEN"
                autoCapitalize="characters"
                autoCorrect={false}
                error={fieldError("colour", colour)}
              />
            </FieldRow>
          </FormSection>

          <FormSection title="Renewal dates" subtitle="Tap a date to open the calendar" icon="calendar-outline" color={C.green} bg={C.greenSoft}>
            <PickerField
              label="Service date"
              icon="construct-outline"
              value={serviceDate}
              placeholder="Choose service date"
              onPress={() => setShowCalendar(true)}
              error={fieldError("serviceDate", serviceDate)}
            />
            <PickerField
              label="Licence date"
              icon="document-text-outline"
              value={licenseDate}
              placeholder="Choose licence date"
              onPress={() => setShowCalendar1(true)}
              error={fieldError("licenseDate", licenseDate)}
            />
            <PickerField
              label="Emission test date"
              icon="leaf-outline"
              value={emissionDate}
              placeholder="Choose emission date"
              onPress={() => setShowCalendar2(true)}
              error={fieldError("emissionDate", emissionDate)}
            />
          </FormSection>

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

          <GradientButton label="Add bus" icon="add-circle-outline" onPress={handleAddBus} />
        </ScrollView>


        <SearchPanel
          visible={isSearching}
          query={searchQuery}
          onChangeQuery={setSearchQuery}
          onClose={() => { setIsSearching(false); setSearchQuery(""); }}
          role={"admin"}
          params={params}
        />

        <View style={styles.bottomNav}>

          <TouchableOpacity style={styles.item} onPress={() => {
            setActiveTab("home");
            if (isSearching) {
              setIsSearching(false); setSearchQuery("");
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

          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("routes"); if (isSearching) setSearchQuery(""); setIsSearching(!isSearching); }}>
            <FontAwesome name={isSearching ? "close" : "search"} size={24} color={activeTab === "routes" ? "#0057D9" : "#8A8A8A"} />
            <Text style={[styles.label1, activeTab === "routes" && styles.activeLabel]}>
              Search
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