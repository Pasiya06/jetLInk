import React, { useState, useCallback } from 'react';
import { Stack, useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  FlatList,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Ionicons,
  Fontisto,
  Feather ,  
  FontAwesome,
  FontAwesome5, 
} from "@expo/vector-icons";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface Bus {
  _id: string; 
  busId: number; 
  driverNIC: string;
  conductorNIC: string;
  driverD: string;
  conductorD: string;
  busNumber: string;
  chassisNo?: string;
  engineNo?: string;
  colour?: string;
  fuelType?: string;
  serviceDate?: string;
  licenseDate?: string;
  emissionDate?: string;
  busType?: string;
  isOnline:string;
}

// Accept only real dates in MM/DD/YYYY format.
function isValidDateString(value: string): boolean {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim());
  if (!match) return false;

  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);
  const parsed = new Date(year, month - 1, day);

  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
}

function formatDateMMDDYYYY(value: Date): string {
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  const year = value.getFullYear();
  return `${month}/${day}/${year}`;
}

export default function PackageDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [date, setDate] = useState(String(params.date || ""));
  const [date1, setdate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const busType3: string = "tour";
  const [loading, setLoading] = useState(false);
  const [busData, setBusData] = useState<Bus[]>([]);
  const [activeTab, setActiveTab] = useState(''); 
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadBuses = async () => {
    // Never load or display buses until a valid date has been entered.
    if (!isValidDateString(date)) {
      setBusData([]);
      setLoading(false);
      return;
    }

    if (!API_URL) {
      setBusData([]);
      setLoading(false);
      Alert.alert("Configuration Error", "API URL is not configured.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/buses?busType=${busType3}`);

      if (!response.ok) {
        throw new Error("Network issues encountered");
      }

      const data = await response.json();
      const typeOfBuses = Array.isArray(data)
        ? data.filter((bus: Bus) => bus.busType === busType3)
        : [];

      setBusData(typeOfBuses);
    } catch (error) {
      console.log("Error details:", error);
      setBusData([]);
      Alert.alert(
        "Network Error",
        "Unable to load buses from the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (!isValidDateString(date)) {
        setBusData([]);
        setLoading(false);
        return;
      }

      loadBuses();
    }, [date])
  );

  
  
  const renderBusItem = ({ item }: { item: Bus }) => (
    <TouchableOpacity style={styles.friendRow}
      onPress={() =>
        router.push({
          pathname: "/passenger/tours/tourSummary",
          params: {
            Bid: item._id, 
            busId: String(item.busId),
            busNumber: item.busNumber,
            driverNIC: item.driverNIC,
            conductorNIC: item.conductorNIC,
            driverD: item.driverD,
            conductorD: item.conductorD,
            isOnline: item.isOnline,
            date: date,
            packageId: params.packageId,
            description: params.description,
            packageType: params.packageType,
            totalDistance: params.totalDistance,
            tripDuration: params.tripDuration,
            maxPassengers: params.maxPassengers,
            maxPrice: params.maxPrice,
            Pid: params.Pid,
            Pid1: params.Pid1,
            pfirstName: params.pfirstName,
            plastName:params.plastName,
            pphoneNumber: params.pphoneNumber,
            pemail: params.pemail,
          },
        })
      }
    >
      
      <View style={styles.profileCircle}>
        <Fontisto name={"bus"} size={25} color="#32CD32" />
      </View>
      <Text style={styles.friendName}>{item.busNumber}</Text>
      
    </TouchableOpacity>
  );

  const filteredBusData = busData.filter(bus => 
    bus.busNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <View style={styles.container}>
        <StatusBar barStyle="light-content"/>

        {/*  HEADER  */}

        <LinearGradient
          colors={["#173C79","#155B8A","#159B79",]}
          start={{x: 0, y: 0,}}
          end={{x: 1, y: 1,}}
          style={styles.header}
        >
          <View style={styles.brandContainer}>
            <View style={styles.brandDot}/>
            <Text style={styles.brandText}>
              JetLink
            </Text>
          </View>

          <Text style={styles.label}>Date</Text>
            <View style={styles.inputWrapper}>
                <TextInput 
                    style={styles.input1} 
                    value={date} 
                    placeholder="MM/DD/YYYY" 
                    placeholderTextColor="#99999a"
                    onChangeText={(value) => setDate(value)} />
                <TouchableOpacity onPress={() => setShowCalendar(true)}>
                  <FontAwesome5 name="calendar-alt" size={24} color="#99999a" />  
                </TouchableOpacity>
            </View>

          {showCalendar && (
            <DateTimePicker
              value={date1 || new Date()}
              mode="date"
              display="default"
              minimumDate={new Date()}   // Cannot select a date before today
              onChange={(event, selectedDate) => {
                setShowCalendar(false);

                if (selectedDate) {
                  setdate(selectedDate);
                  setDate(formatDateMMDDYYYY(selectedDate));
                }
              }}
            />
          )}

          {/* PACKAGE TYPE */}

          <View style={styles.goldenBadge}>
            <View style={styles.badgeDot}/>
            <Text style={styles.goldenText}>
              {params.packageType || "PACKAGE"}
            </Text>
          </View>
        </LinearGradient>

          {!date.trim() ? (
            <View style={styles.dateMessageContainer}>
              <Fontisto name="calendar" size={40} color="#159B79" />
              <Text style={styles.dateMessageTitle}>Select a Date</Text>
              <Text style={styles.dateMessageText}>
                Please select or enter a valid tour date to view buses.
              </Text>
            </View>
          ) : !isValidDateString(date) ? (
            <View style={styles.dateMessageContainer}>
              <Fontisto name="calendar" size={40} color="#D97706" />
              <Text style={styles.dateMessageTitle}>Invalid Date</Text>
              <Text style={styles.dateMessageText}>
                Enter a real date in MM/DD/YYYY format.
              </Text>
            </View>
          ) : loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#159B79" />
              <Text style={styles.loadingText}>Loading buses...</Text>
            </View>
          ) : (
            <FlatList
              style={styles.svw}
              data={filteredBusData}
              renderItem={renderBusItem}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 10, flexGrow: 1 }}
              ListEmptyComponent={
                <View style={styles.dateMessageContainer}>
                  <Fontisto name="bus" size={40} color="#98A2B3" />
                  <Text style={styles.dateMessageTitle}>No Buses Found</Text>
                  <Text style={styles.dateMessageText}>
                    No tour buses are currently available.
                  </Text>
                </View>
              }
            />
          )}
        
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
          
          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("home"); if (isSearching) {
                  setIsSearching(false); 
                }
    
                else {
                  router.push({
                    pathname: "/passenger/tours/selectPackeges",
                    params: {
                      Pid: params.Pid,
                      Pid1: params.Pid1,
                      pfirstName: params.pfirstName,
                      plastName:params.plastName,
                      pphoneNumber: params.pphoneNumber,
                      pemail: params.pemail,
                    },                    
                  });
                };}}>
            <Ionicons name={isSearching ? "arrow-back" : "arrow-back-outline"} size={24} color={activeTab === "home" ? "#0057D9" : "#8A8A8A"}/>
            <Text style={[styles.label1,activeTab === "home" && styles.activeLabel,]}>
              Back
            </Text>
          </TouchableOpacity>
    
          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("routes"); setIsSearching(!isSearching); }}>
            <FontAwesome name={isSearching ? "close" : "search"} size={24} color={activeTab  === "routes" ? "#0057D9" : "#8A8A8A"}/>
            <Text style={[ styles.label1,activeTab === "routes" && styles.activeLabel,]}>
              Routes
            </Text>
          </TouchableOpacity>
    
          <TouchableOpacity style={styles.centerButton} onPress={() => {setActiveTab("tickets"); router.push({
            pathname: "/passenger/index1",
            params: {
              Pid: params.Pid,
              Pid1: params.Pid1,
              pfirstName: params.pfirstName,
              plastName:params.plastName,
              pphoneNumber: params.pphoneNumber,
              pemail: params.pemail,
            },                      
          });}} > 
            <Ionicons name="home-outline" size={28} color="#fff" />             
          </TouchableOpacity>
    
          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("routes"); router.push("/admin/index1");}}>
            <Ionicons name="notifications-outline" size={24} color={activeTab === "alerts" ? "#0057D9" : "#8A8A8A"}/>
            <Text style={[styles.label1,activeTab === "alerts" && styles.activeLabel, ]}>
              Alerts
            </Text>
          </TouchableOpacity>
    
          <TouchableOpacity style={styles.item} onPress={() => {setActiveTab("profile"); router.push("/admin/index1");}}>
            <Feather name="user" size={24} color={activeTab === "profile" ? "#0057D9" : "#8A8A8A"}/>
            <Text style={[styles.label1, activeTab === "profile" && styles.activeLabel,]}>
              Profile
            </Text>
          </TouchableOpacity>
        </View>

      {/* Bottom Graphic Design Element */}
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

      </View>
    </>
  );
}

/* STAT CARD */

function StatCard({value,label,}: {value: string;label: string;}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>
        {value}
      </Text>

      <Text style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

/* STYLES */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F3F5F8",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F5F8",
  },

  loadingText: {
    marginTop: 12,
    color: "#667085",
    fontSize: 14,
  },

  header: {
    minHeight: 220,
    paddingTop: 55,
    paddingHorizontal: 24,
    paddingBottom: 25,
    overflow: "hidden",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  decorCircle: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    right: -70,
    top: -40,
  },

  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  brandDot: {
    width: 7,
    height: 7,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    marginRight: 6,
  },

  brandText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  friendRow: {
    marginLeft: 15,
    marginRight: 15,
    
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: '#32CD32',
   
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4, },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#32CD32',
    justifyContent: 'center',
    alignItems: 'center',
  },

  friendName: {
    flex: 1,
    marginLeft: 10,
    fontSize: 18,
    color: '#0047AB',
    fontWeight: '500',
  },

  svw: {
    width: '100%',
    marginBottom:140,
    
  },

  goldenBadge: {
    position: "absolute",
    right: 25,
    top: 55,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor:
      "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.15)",
  },

  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: 10,
    backgroundColor: "#D8E2A5",
    marginRight: 5,
  },

  goldenText: {
    fontSize: 7,
    fontWeight: "800",
    color: "#DCE8B0",
    letterSpacing: 0.5,
  },

  category: {
    marginTop: 32,
    color: "#B7C8D8",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 2,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 8,
  },

  description: {
    color: "#D5E1EA",
    fontSize: 10,
    lineHeight: 16,
    marginTop: 12,
    maxWidth: "90%",
  },

  statsRow: {
    flexDirection: "row",
    marginTop: 18,
    gap: 8,
  },

  statCard: {
    flex: 1,
    minHeight: 45,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  statValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  statLabel: {
    color: "#C7D6DF",
    fontSize: 6,
    fontWeight: "700",
    marginTop: 5,
    letterSpacing: 0.4,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    marginBottom: 10,
    marginTop: 20,
    marginHorizontal: 24,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#344054",
  },

  addPlaceButton: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#12966F",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  addPlaceButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  scrollContent: {
    paddingBottom: 100,
  },

  placesSection: {
    backgroundColor: "#F4F6F8",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 25,
  },

  timelineContainer: {
    position: "relative",
  },

  timelineLine: {
    position: "absolute",
    width: 2,
    backgroundColor: "#D7DEE5",
    left: 14,
    top: 15,
    bottom: 20,
  },

  placeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  timelineIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#EAF0F4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    zIndex: 2,
    borderWidth: 1,
  },

  placeCard: {
    flex: 1,
    minHeight: 57,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  placeTextContainer: {
    flex: 1,
    paddingRight: 8,
  },

  placeName: {
    fontSize: 10,
    fontWeight: "800",
    color: "#344054",
  },

  placeDescription: {
    marginTop: 4,
    fontSize: 7,
    color: "#8A96A3",
  },

  numberCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#23384A",
    justifyContent: "center",
    alignItems: "center",
  },

  numberText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "800",
  },

  deleteButton: {
    marginLeft: 8,
    padding: 6,
  },

  emptyContainer: {
    paddingVertical: 70,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "700",
    color: "#344054",
  },

  emptyText: {
    marginTop: 6,
    fontSize: 12,
    color: "#98A2B3",
    textAlign: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 35,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#344054",
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#344054",
    marginTop: 10,
    marginBottom: 8,
  },

  label: {
    marginTop: 40,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    backgroundColor: '#F2F4F5',
    borderColor: '#ECEEF2',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 45,
  },
  input1: {
    flex: 1,
    height: '100%',
    color: '#333',
  },

  input: {
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: "#344054",
  },

  descriptionInput: {
    height: 90,
    paddingTop: 12,
    textAlignVertical: "top",
  },

  modalButtons: {
    flexDirection: "row",
    marginTop: 25,
    gap: 12,
  },

  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    justifyContent: "center",
    alignItems: "center",
  },

  cancelButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#667085",
  },

  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#12966F",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  submitButton: {
    bottom: 180,
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

   submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
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


  dateMessageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 35,
  },

  dateMessageTitle: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: "700",
    color: "#344054",
    textAlign: "center",
  },

  dateMessageText: {
    marginTop: 8,
    fontSize: 13,
    color: "#98A2B3",
    textAlign: "center",
    lineHeight: 19,
  },

});