import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
   SafeAreaView,
  ScrollView
} from "react-native";
import { FormSection, FormField, PickerField, FieldRow } from "../../../components/JetForm";
import { ScreenHeader, GradientButton, C, ui } from "../../../components/JetUI";
import SearchPanel from "../../../components/SearchPanel";
import { Alert } from "../../../components/JetAlert";

import {  } from "react-native-safe-area-context";
import { Stack,useRouter,useLocalSearchParams } from "expo-router";
import { Ionicons, FontAwesome, Feather, FontAwesome5 } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import AlertBadge from "../../../components/AlertBadge";


import FieldError from "../../../components/FieldError";
import { useFieldErrors } from "../../../utils/validation";
const AddBus = () => {
 
  const [busdate, setBusDate] = useState("ANY DATE");
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [date, setDate] = useState(new Date());
  const [pickuploca, setpickuploca] = useState("");
  const [dropoffloca, setdropoffloca] = useState("");
  const [depaturetime, setdepaturetime] = useState("");
  const [arrivaltime, setarrivaltime] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showTimePicker1, setShowTimePicker1] = useState(false);
  const [time, setTime] = useState(new Date());
  const [stops, setstops] = useState("");
  const [ticketPrice, setticketPrice] = useState("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState('');
  const params = useLocalSearchParams();
  const router = useRouter();
  const { validate: validateFields, errorFor: fieldError } = useFieldErrors();
  const busNumber = params.busNumber as string;
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const onTimeChange = (event: any, selected?: Date) => {
  setShowTimePicker(false);

  if (selected) {
    setTime(selected);

    const formatted = selected.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setdepaturetime(formatted);
  }
};

  const onTimeChange1 = (event: any, selected?: Date) => {
  setShowTimePicker1(false);

  if (selected) {
    setTime(selected);

    const formatted = selected.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setarrivaltime(formatted);
  }
};

  const handleAddBus = async () => {
    if (!validateFields([
      { key: "busdate", label: "Date", value: busdate },
      { key: "pickuploca", label: "Pickup location", value: pickuploca },
      { key: "dropoffloca", label: "Drop-off location", value: dropoffloca },
      { key: "depaturetime", label: "Departure time", value: depaturetime },
      { key: "arrivaltime", label: "Arrival time", value: arrivaltime },
      { key: "ticketPrice", label: "Ticket price", value: ticketPrice, type: "number", min: 1 },
      { key: "stops", label: "Stops", value: stops },
    ])) return;

    if (!busdate || !pickuploca || !dropoffloca || !depaturetime || !arrivaltime || !stops) {
      Alert.alert("Missing details", "Please fill in all the required fields.");
      return;
    }
  try {
    const response = await fetch(`${API_URL}/schedules`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        busdate,
        pickuploca,
        dropoffloca,
        depaturetime,
        arrivaltime,
        stops,
        busNo: busNumber,
        busType:params.busType,
        ticketPrice
      }),
    });

    const data = await response.json();

    if (data.success) {
      Alert.alert("Schedule added", "The schedule was added successfully.");

      router.push({
        pathname: "/admin/buses/showShedule",
        params: {
          
                busType: params.busType ,
                busTypeTopic:params.busTypeTopic,
                Aid: params.Aid,
                firstName: params.firstName,
                lastName: params.lastName,
                email: params.email,
                
        },
      });
    } else {
      Alert.alert("Couldn't add schedule", String(data.message || "Please check the details and try again."));
    }
  } catch (error) {
    console.log(error);
    Alert.alert("Server error", "Something went wrong on the server. Please try again.");
  }
};

  return (
    <>
    <Stack.Screen options={{ title: "", headerShown: false }} />
    <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
      
      <ScreenHeader eyebrow="Bus schedule" title={`New schedule · ${params.busNumber || ""}`} />

      <ScrollView
        style={ui.body}
        contentContainerStyle={ui.bodyContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <FormSection title="Route" subtitle="Where the bus starts and ends" icon="navigate-outline">
          <FormField
            label="Departure location"
            icon="location-outline"
            value={pickuploca}
            onChangeText={(text) => setpickuploca(text.replace(/\s/g, "").toUpperCase())}
            placeholder="COLOMBO"
            autoCapitalize="characters"
            autoCorrect={false}
            error={fieldError("pickuploca", pickuploca)}
          />
          <FormField
            label="Arrival location"
            icon="flag-outline"
            value={dropoffloca}
            onChangeText={(text) => setdropoffloca(text.replace(/\s/g, "").toUpperCase())}
            placeholder="GALLE"
            autoCapitalize="characters"
            autoCorrect={false}
            error={fieldError("dropoffloca", dropoffloca)}
          />
          <FormField
            label="Stops"
            icon="git-commit-outline"
            value={stops}
            onChangeText={(text) => setstops(text.replace(/\s/g, "").toUpperCase())}
            placeholder="PANADURA,KALUTARA"
            autoCapitalize="characters"
            autoCorrect={false}
            hint="Separate stops with commas"
            error={fieldError("stops", stops)}
          />
        </FormSection>

        <FormSection title="When" subtitle="Day and times of this trip" icon="time-outline" color={C.purple} bg={C.purpleSoft}>
          <PickerField
            label="Date"
            icon="calendar-outline"
            value={busdate === "ANY DATE" ? "Every day" : busdate}
            placeholder="Choose a date"
            onPress={() => setShowCalendar(true)}
            error={fieldError("busdate", busdate)}
          />
          <View style={styles.chipRow}>
            <TouchableOpacity
              style={[styles.chip, busdate === "ANY DATE" && styles.chipActive]}
              onPress={() => setBusDate("ANY DATE")}
            >
              <Ionicons name="repeat" size={15} color={busdate === "ANY DATE" ? "#FFFFFF" : C.blue} />
              <Text style={[styles.chipText, busdate === "ANY DATE" && styles.chipTextActive]}>Every day</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.chip, busdate !== "ANY DATE" && styles.chipActive]}
              onPress={() => setShowCalendar(true)}
            >
              <Ionicons name="calendar" size={15} color={busdate !== "ANY DATE" ? "#FFFFFF" : C.blue} />
              <Text style={[styles.chipText, busdate !== "ANY DATE" && styles.chipTextActive]}>One date</Text>
            </TouchableOpacity>
          </View>
          <FieldRow>
            <PickerField
              label="Departure"
              icon="play-outline"
              value={depaturetime}
              placeholder="Time"
              onPress={() => setShowTimePicker(true)}
              right="time-outline"
              error={fieldError("depaturetime", depaturetime)}
            />
            <PickerField
              label="Arrival"
              icon="stop-outline"
              value={arrivaltime}
              placeholder="Time"
              onPress={() => setShowTimePicker1(true)}
              right="time-outline"
              error={fieldError("arrivaltime", arrivaltime)}
            />
          </FieldRow>
        </FormSection>

        <FormSection title="Ticket price" icon="cash-outline" color={C.green} bg={C.greenSoft}>
          <FormField
            label="Price per ticket"
            icon="pricetag-outline"
            value={String(ticketPrice)}
            onChangeText={(t) => setticketPrice(t.replace(/[^0-9.]/g, ""))}
            placeholder="350"
            keyboardType="decimal-pad"
            suffix="LKR"
            error={fieldError("ticketPrice", ticketPrice)}
          />
        </FormSection>

        {showCalendar && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowCalendar(false);
              if (selectedDate) {
                setDate(selectedDate);
                setBusDate(selectedDate.toLocaleDateString());
              }
            }}
          />
        )}
        {showTimePicker && (
          <DateTimePicker value={time} mode="time" display="default" onChange={onTimeChange} />
        )}
        {showTimePicker1 && (
          <DateTimePicker value={time} mode="time" display="default" onChange={onTimeChange1} />
        )}

        <GradientButton label="Add schedule" icon="add-circle-outline" onPress={handleAddBus} />
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

      

      <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("home"); if (isSearching) {
              setIsSearching(false); setSearchQuery(""); 
            }

            else {
              router.push({
                pathname: "/admin/buses/selectBus",
                params: {
                  Aid: params.Aid,
                  firstName: params.firstName,
                  lastName: params.lastName,
                  email: params.email,

                  Bid: params.Bid,
                  busId: params.busId,
                  busNumber: params.busNumber,
                  chassis: params.chassis || "",
                  engine: params.engine || "",
                  colour: params.colour || "",
                  fuel: params.fuel || "",
                  serviceDate: params.serviceDate || "",
                  licenseDate: params.licenseDate || "",
                  emissionDate: params.emissionDate || "",
                  busType: params.busType || "",
                  busTypeTopic:params.busTypeTopic,
                },                    
              });
            };}}>
        <Ionicons name={isSearching ? "arrow-back" : "arrow-back-outline"} size={24} color={activeTab === "home" ? "#0057D9" : "#8A8A8A"}/>
        <Text style={[styles.label1,activeTab === "home" && styles.activeLabel,]}>
          Back
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("routes"); if (isSearching) setSearchQuery(""); setIsSearching(!isSearching); }}>
        <FontAwesome name={isSearching ? "close" : "search"} size={24} color={activeTab  === "routes" ? "#0057D9" : "#8A8A8A"}/>
        <Text style={[ styles.label1,activeTab === "routes" && styles.activeLabel,]}>
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
        <View><Ionicons name="notifications-outline" size={24} color={activeTab === "alerts" ? "#0057D9" : "#8A8A8A"}/><AlertBadge role="admin" /></View>
        <Text style={[styles.label1,activeTab === "alerts" && styles.activeLabel, ]}>
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
  chipRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: "#EAF1FB" },
  chipActive: { backgroundColor: "#155B8A" },
  chipText: { fontSize: 13, fontWeight: "700", color: "#155B8A" },
  chipTextActive: { color: "#FFFFFF" },

  container:{
    flex:1,
    backgroundColor:"#fff"
  },

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

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },

  card: {
    width: '90%',
    flex: 1,
    maxHeight: '58%',
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

  label:{
    color:"#000000",
    fontSize:14,
    marginBottom: 5,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFC',
    borderWidth: 2,
    borderColor: '#ECEEF2',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 45,
    marginBottom: 15,
  },

  input: {
    flex: 1,
    height: '100%',
    color: '#333',
  },

  inputIcon: {
    fontSize: 18,
    color: '#999',
  },

  searchButton: {
    justifyContent: "space-around",
    marginLeft: 20,
    marginRight: 20,  
    height: 55,
    overflow: 'hidden',
    borderRadius: 25,
    marginTop: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    elevation: 10,
  },

  searchButtonText: {
    color: '#ffffff',
    fontSize: 20,
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
    shadowOffset: {
      width: 0,
      height: -2,
    },
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
    width:'90%' 
  },

  subHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
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
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 12,
  },

  svw: {
    width: '100%',  
  },

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


export default AddBus;