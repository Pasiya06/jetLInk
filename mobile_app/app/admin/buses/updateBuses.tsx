import React, { useState } from 'react';
import { Stack,useRouter,useLocalSearchParams} from "expo-router";
import { 
  StyleSheet, 
  View, 
  Text,
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  Image,
  ScrollView 
} from 'react-native';
import { FormSection, FormField, PickerField, FieldRow } from "../../../components/JetForm";
import { ScreenHeader, GradientButton, C, ui } from "../../../components/JetUI";
import SearchPanel from "../../../components/SearchPanel";
import { Alert } from "../../../components/JetAlert";
import { 
    Ionicons,  
    Feather, 
    FontAwesome,
    FontAwesome5,
    MaterialCommunityIcons, 
} from '@expo/vector-icons';
import { updateBus } from "../../../services/busService";
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import AlertBadge from "../../../components/AlertBadge";

import FieldError from "../../../components/FieldError";
import { useFieldErrors } from "../../../utils/validation";
const ToursScreen: React.FC = () => {
  const router = useRouter();
  const { validate: validateFields, errorFor: fieldError } = useFieldErrors();
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState('');
  const params = useLocalSearchParams();
  const [chassisNo, setChassisNo] = useState(String(params.chassis || ""));
  const [engineNo, setEngineNo] = useState(String(params.engine || ""));
  const [noOfSeats, setnoOfSeats] = useState("");
  const [colour, setColour] = useState(String(params.colour || ""));
  const [serviceDate, setServiceDate] = useState(String(params.serviceDate || ""));
  const [licenseDate, setLicenseDate] = useState(String(params.licenseDate || ""));
  const [emissionDate, setEmissionDate] = useState(String(params.emissionDate || ""));
  const [date, setDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [showCalendar1, setShowCalendar1] = useState<boolean>(false);
  const [showCalendar2, setShowCalendar2] = useState<boolean>(false);
  const handleUpdate = async () => {
    if (!validateFields([
      { key: "chassisNo", label: "Chassis number", value: chassisNo },
      { key: "engineNo", label: "Engine number", value: engineNo },
      { key: "noOfSeats", label: "Number of seats", value: noOfSeats, type: "int" },
      { key: "colour", label: "Colour", value: colour },
      { key: "serviceDate", label: "Service date", value: serviceDate },
      { key: "licenseDate", label: "License date", value: licenseDate },
      { key: "emissionDate", label: "Emission date", value: emissionDate },
    ])) return;


    try{
        if (!chassisNo || !engineNo  || !colour || !serviceDate  || !licenseDate || !emissionDate) {
            Alert.alert("Missing details", "Please fill in all the required fields.");
            return;
        }
        await updateBus(params.Bid as string,{
            chassisNo,
            engineNo,
            noOfSeats,
            colour,
            serviceDate,
            licenseDate,
            emissionDate
        });

        Alert.alert("Updated successfully", "Your changes have been saved.");

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
    catch(err){

        Alert.alert("Update failed", "Your changes couldn't be saved. Please try again.");

    }

}

  return (
    <>
    <Stack.Screen options={{ title: "", headerShown: false }} />
    <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
        <ScreenHeader eyebrow={`${params.busTypeTopic || "Bus"} fleet`} title={`Edit ${params.busNumber || params.busNum || "bus"}`} />

        <ScrollView
          style={ui.body}
          contentContainerStyle={ui.bodyContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <FormSection title="Bus details" subtitle="Registration and vehicle numbers" icon="bus-outline">
            <FormField
              label="Bus number"
              icon="pricetag-outline"
              value={String(params.busNumber || params.busNum || "")}
              readOnly
              hint="The bus number can't be changed"
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

          <GradientButton label="Save changes" icon="checkmark-circle-outline" onPress={handleUpdate} />
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
                pathname: "/admin/buses/busProfile",
                params: {
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
                        driverD:params.driverD,
                        conductorD: params.conductorD,
                        isOnline: params.isOnline,

                        Aid: params.Aid,
                        firstName: params.firstName,
                        lastName: params.lastName,
                        email: params.email,
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
    maxHeight: '60%',
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

export default ToursScreen;