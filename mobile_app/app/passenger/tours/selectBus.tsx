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
  ActivityIndicator,
  FlatList,
} from "react-native";
import { BusStatusNotice, isBusBlocked, showBusBlockedAlert } from "../../../components/BusStatus";
import SearchPanel from "../../../components/SearchPanel";
import { Alert } from "../../../components/JetAlert";

import { LinearGradient } from "expo-linear-gradient";
import { C, GRADIENT } from "../../../components/JetUI";
import BusCard from "../../../components/BusCard";
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Ionicons,
  Fontisto,
  Feather ,  
  FontAwesome,
  FontAwesome5, 
} from "@expo/vector-icons";

import {
  MIN_DAYS_AHEAD,
  addDays,
  earliestTourDate,
  formatMMDDYYYY,
  isTooSoon,
  parseMMDDYYYY,
  parseTripDays,
} from "../../../utils/tourDates";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface Bus {
  _id: string; 
  busId: number; 
  driverNIC: string;
  conductorNIC: string;
  driverD: string;
  conductorD: string;
  busNumber: string;
  busName?: string;
  noOfSeats?: string;
  chassisNo?: string;
  engineNo?: string;
  colour?: string;
  fuelType?: string;
  serviceDate?: string;
  licenseDate?: string;
  emissionDate?: string;
  busType?: string;
  isOnline:string;
  status?: string;
  emergency?: boolean;
  emergencyAt?: string;
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
  const [date1, setdate] = useState(earliestTourDate());
  const [hiddenCount, setHiddenCount] = useState(0);
  const tripDays = parseTripDays(params.tripDuration as string);
  const startDate = parseMMDDYYYY(date);
  const tooSoon = startDate ? isTooSoon(startDate) : false;
  const dateOk = isValidDateString(date) && !tooSoon;
  const tripEnd = startDate ? formatMMDDYYYY(addDays(startDate, tripDays - 1)) : "";
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const busType3: string = "tour";
  const [loading, setLoading] = useState(false);
  const [busData, setBusData] = useState<Bus[]>([]);
  const [activeTab, setActiveTab] = useState(''); 
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadBuses = async () => {
    // Never load or display buses until a valid date (at least a week ahead) is entered.
    if (!dateOk) {
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

      const [response, bookedRes] = await Promise.all([
        fetch(`${API_URL}/buses?busType=${busType3}`),
        fetch(
          `${API_URL}/receipts/booked-buses?date=${encodeURIComponent(date)}` +
            `&tripDuration=${encodeURIComponent(String(params.tripDuration ?? ""))}`
        ),
      ]);

      if (!response.ok) {
        throw new Error("Network issues encountered");
      }

      const data = await response.json();
      const booked = await bookedRes.json();
      if (!bookedRes.ok || !booked.success) {
        throw new Error(booked.message || "Could not check bus bookings");
      }

      // Hide buses already booked on any day of this trip
      const bookedSet = new Set<string>(booked.bookedBuses ?? []);
      const typeOfBuses = Array.isArray(data)
        ? data.filter((bus: Bus) => bus.busType === busType3)
        : [];
      const freeBuses = typeOfBuses.filter((bus: Bus) => !bookedSet.has(bus.busNumber));

      setHiddenCount(typeOfBuses.length - freeBuses.length);
      setBusData(freeBuses);
    } catch (error) {
      console.log("Error details:", error);
      setBusData([]);
      Alert.alert(
        "Network Error",
        error instanceof Error && error.message !== "Network issues encountered"
          ? error.message
          : "Unable to load buses from the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (!dateOk) {
        setBusData([]);
        setLoading(false);
        return;
      }

      loadBuses();
    }, [date, dateOk])
  );

  
  
  const chooseBus = (item: Bus) =>
    isBusBlocked(item)
      ? showBusBlockedAlert(item)
      : router.push({
          pathname: "/passenger/tours/tourSummary",
          params: {
            Bid: item._id,
            busId: String(item.busId),
            busNumber: item.busNumber,
            busName: item.busName || "",
            noOfSeats: String(item.noOfSeats || ""),
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
            plastName: params.plastName,
            pphoneNumber: params.pphoneNumber,
            pemail: params.pemail,
          },
        });

  const renderBusItem = ({ item }: { item: Bus }) => {
    const blocked = isBusBlocked(item);
    const seats = Number(item.noOfSeats) || 0;
    const groupSize = Number(params.maxPassengers) || 0;
    const fits = !seats || !groupSize || seats >= groupSize;
    return (
      <BusCard
        bus={item}
        statusLabel="Available"
        tone="green"
        disabled={blocked}
        onPress={() => chooseBus(item)}
        footer={
          blocked ? undefined : (
            <>
              <View style={styles.fitRow}>
                <Ionicons
                  name={fits ? "checkmark-circle" : "alert-circle"}
                  size={16}
                  color={fits ? C.green : C.amber}
                />
                <Text style={[styles.fitText, !fits && { color: C.amber }]} numberOfLines={1}>
                  {seats && groupSize
                    ? fits
                      ? `Fits your group of ${groupSize}`
                      : `Only ${seats} seats for ${groupSize}`
                    : `Free for ${tripDays === 1 ? "your trip" : `all ${tripDays} days`}`}
                </Text>
              </View>
              <View style={styles.selectBtn}>
                <Text style={styles.selectText}>Select</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </View>
            </>
          )
        }
      />
    );
  };

  const filteredBusData = busData.filter(bus =>
    bus.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (bus.busName || "").toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <View style={styles.container}>
        <StatusBar barStyle="light-content"/>

        {/*  HEADER  */}

        <LinearGradient
          colors={GRADIENT}
          start={{x: 0, y: 0,}}
          end={{x: 1, y: 1,}}
          style={styles.header}
        >
          <View style={styles.decorCircle}/>
          <View style={styles.headerTop}>
            <View style={styles.brandContainer}>
              <View style={styles.brandDot}/>
              <Text style={styles.brandText}>
                JetLink Tours
              </Text>
            </View>

            {/* PACKAGE TYPE */}

            <View style={styles.goldenBadge}>
              <View style={styles.badgeDot}/>
              <Text style={styles.goldenText}>
                {params.packageType || "PACKAGE"}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>Choose your bus</Text>
          <Text style={styles.description}>Pick a tour date to see the buses that are free.</Text>
        </LinearGradient>

        {/*  DATE CARD  */}

        <View style={styles.dateCard}>
          <Text style={styles.label}>Tour date</Text>
            <View style={styles.inputWrapper}>
                <Ionicons name="calendar-outline" size={20} color={C.blue} />
                <TextInput 
                    style={styles.input1} 
                    value={date} 
                    placeholder={`From ${formatMMDDYYYY(earliestTourDate())}`} 
                    placeholderTextColor="#8A97A8"
                    onChangeText={(value) => setDate(value)} />
                <TouchableOpacity onPress={() => setShowCalendar(true)} style={styles.calendarBtn}>
                  <FontAwesome5 name="calendar-alt" size={18} color="#FFFFFF" />  
                </TouchableOpacity>
            </View>
          <Text style={styles.dateHint}>
            MM/DD/YYYY · earliest {formatMMDDYYYY(earliestTourDate())}
          </Text>

          {showCalendar && (
            <DateTimePicker
              value={date1 || new Date()}
              mode="date"
              display="default"
              minimumDate={earliestTourDate()}   // At least a week from today
              onChange={(event, selectedDate) => {
                setShowCalendar(false);

                if (selectedDate) {
                  setdate(selectedDate);
                  setDate(formatDateMMDDYYYY(selectedDate));
                }
              }}
            />
          )}
        </View>

          {!date.trim() ? (
            <View style={styles.dateMessageContainer}>
              <View style={[styles.messageIcon, { backgroundColor: C.blueSoft }]}>
                <Fontisto name="calendar" size={30} color={C.blue} />
              </View>
              <Text style={styles.dateMessageTitle}>Select a date</Text>
              <Text style={styles.dateMessageText}>
                Please select or enter a valid tour date to view buses.
              </Text>
            </View>
          ) : !isValidDateString(date) ? (
            <View style={styles.dateMessageContainer}>
              <View style={[styles.messageIcon, { backgroundColor: C.amberSoft }]}>
                <Fontisto name="calendar" size={30} color={C.amber} />
              </View>
              <Text style={styles.dateMessageTitle}>Invalid date</Text>
              <Text style={styles.dateMessageText}>
                Enter a real date in MM/DD/YYYY format.
              </Text>
            </View>
          ) : tooSoon ? (
            <View style={styles.dateMessageContainer}>
              <View style={[styles.messageIcon, { backgroundColor: C.amberSoft }]}>
                <Fontisto name="calendar" size={30} color={C.amber} />
              </View>
              <Text style={styles.dateMessageTitle}>Book at least {MIN_DAYS_AHEAD} days ahead</Text>
              <Text style={styles.dateMessageText}>
                Tours need a week's notice. The earliest date you can choose is{" "}
                {formatMMDDYYYY(earliestTourDate())}.
              </Text>
            </View>
          ) : loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={C.blue} />
              <Text style={styles.loadingText}>Loading buses...</Text>
            </View>
          ) : (
            <FlatList
              ListHeaderComponent={
                <View>
                  <View style={styles.tripBanner}>
                    <View style={styles.tripIcon}>
                      <Ionicons name="calendar" size={18} color={C.green} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.tripBannerLabel}>
                        {tripDays === 1 ? "One-day trip" : `${tripDays}-day trip`}
                      </Text>
                      <Text style={styles.tripBannerDates}>
                        {tripDays === 1 ? date : `${date}  →  ${tripEnd}`}
                      </Text>
                    </View>
                  </View>
                  {hiddenCount > 0 ? (
                    <View style={styles.hiddenNote}>
                      <Ionicons name="eye-off-outline" size={14} color={C.muted} />
                      <Text style={styles.hiddenNoteText}>
                        {hiddenCount} bus{hiddenCount === 1 ? " is" : "es are"} already booked on these dates
                      </Text>
                    </View>
                  ) : null}
                  {filteredBusData.length > 0 ? (
                    <View style={styles.listHead}>
                      <Text style={styles.listHeadText}>Available buses</Text>
                      <View style={styles.countPill}>
                        <Text style={styles.countPillText}>{filteredBusData.length}</Text>
                      </View>
                    </View>
                  ) : null}
                </View>
              }
              style={styles.svw}
              data={filteredBusData}
              renderItem={renderBusItem}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 30, flexGrow: 1 }}
              ListEmptyComponent={
                <View style={styles.dateMessageContainer}>
                  <View style={[styles.messageIcon, { backgroundColor: "#F3F6FA" }]}>
                    <Fontisto name="bus" size={28} color={C.muted} />
                  </View>
                  <Text style={styles.dateMessageTitle}>No buses found</Text>
                  <Text style={styles.dateMessageText}>
                    {hiddenCount > 0
                      ? "All tour buses are already booked for these dates. Try another date."
                      : "No tour buses are currently available."}
                  </Text>
                </View>
              }
            />
          )}
        
        <SearchPanel
          visible={isSearching}
          query={searchQuery}
          onChangeQuery={setSearchQuery}
          onClose={() => { setIsSearching(false); setSearchQuery(""); }}
          role={"passenger"}
          params={params}
          listLabel="buses"
        />
          
        <View style={styles.bottomNav}>
          
          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("home"); if (isSearching) {
                  setIsSearching(false); setSearchQuery(""); 
                }
    
                else {
                  router.push({
                    pathname: "/passenger/tours/PackagesScreen1",
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
    
          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("routes"); if (isSearching) setSearchQuery(""); setIsSearching(!isSearching); }}>
            <FontAwesome name={isSearching ? "close" : "search"} size={24} color={activeTab  === "routes" ? "#0057D9" : "#8A8A8A"}/>
            <Text style={[ styles.label1,activeTab === "routes" && styles.activeLabel,]}>
              Search
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
    
          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("routes"); router.push({ pathname: "/notifications", params: { role: "passenger" } });}}>
            <Ionicons name="notifications-outline" size={24} color={activeTab === "alerts" ? "#0057D9" : "#8A8A8A"}/>
            <Text style={[styles.label1,activeTab === "alerts" && styles.activeLabel, ]}>
              Alerts
            </Text>
          </TouchableOpacity>
    
          <TouchableOpacity style={styles.item} onPress={() => {setActiveTab("profile"); router.push({ pathname: "/passenger/passengerProfile", params: { role: "passenger",NIC: params.NIC } });}}>
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
  tripBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.greenSoft,
    borderRadius: 16,
    padding: 12,
  },
  tripBannerLabel: { fontSize: 12, fontWeight: "700", color: C.green, letterSpacing: 0.6, textTransform: "uppercase" },
  tripBannerDates: { fontSize: 15, fontWeight: "800", color: C.ink, marginTop: 2 },
  hiddenNote: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10, marginLeft: 4 },
  hiddenNoteText: { fontSize: 12.5, fontWeight: "500", color: C.muted },
  listHead: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 18, marginBottom: 10, marginLeft: 4 },
  listHeadText: { fontSize: 13, fontWeight: "700", color: C.muted, letterSpacing: 1, textTransform: "uppercase" },
  countPill: { backgroundColor: C.blueSoft, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 2 },
  countPillText: { fontSize: 12, fontWeight: "800", color: C.blue },
  fitRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6, marginRight: 8 },
  fitText: { flex: 1, fontSize: 12.5, fontWeight: "600", color: C.green },
  selectBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: C.blue,
  },
  selectText: { color: "#FFFFFF", fontSize: 13.5, fontWeight: "800" },
  blockedRow: { borderWidth: 1, borderColor: C.redBorder, alignItems: "flex-start" },

  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dateCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: -48,
    marginBottom: 6,
    borderRadius: 22,
    padding: 16,
    shadowColor: "#0F1B2D",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  calendarBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: C.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  dateHint: { marginTop: 8, fontSize: 12, color: C.muted, fontWeight: "500" },
  messageIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  tripIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: C.greenSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  busMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 5 },
  busMetaText: { fontSize: 12, fontWeight: "600", color: C.muted },
  availPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.greenSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  availDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },
  availText: { fontSize: 11, fontWeight: "700", color: C.green },
  arrowDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.blueSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  container: {
    flex: 1,
    backgroundColor: "#F3F6FA",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F6FA",
    paddingBottom: 160,
  },

  loadingText: {
    marginTop: 12,
    color: "#5B6B7F",
    fontSize: 14,
  },

  header: {
    paddingTop: 54,
    paddingHorizontal: 24,
    paddingBottom: 66,
    overflow: "hidden",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  decorCircle: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    right: -80,
    top: -60,
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

  brandText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700", letterSpacing: 0.3 },

  friendRow: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#0F1B2D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
  },

  profileCircle: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: C.blueSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },

  friendName: { fontSize: 18, color: C.ink, fontWeight: "800", letterSpacing: 0.3 },

  svw: { flex: 1, width: "100%", marginBottom: 140 },

  goldenBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },

  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#FFE58A", marginRight: 6 },

  goldenText: { fontSize: 12, fontWeight: "800", color: "#FFE58A", letterSpacing: 0.8, textTransform: "uppercase" },

  category: {
    marginTop: 32,
    color: "#B7C8D8",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 2,
  },

  title: { color: "#FFFFFF", fontSize: 28, fontWeight: "800", marginTop: 20 },

  description: { color: "rgba(255,255,255,0.88)", fontSize: 14, lineHeight: 20, marginTop: 4 },

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
    color: "#0F1B2D",
  },

  addPlaceButton: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#159B79",
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
    backgroundColor: "#F3F6FA",
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
    color: "#0F1B2D",
  },

  placeDescription: {
    marginTop: 4,
    fontSize: 7,
    color: "#5B6B7F",
  },

  numberCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#0F1B2D",
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
    color: "#0F1B2D",
  },

  emptyText: {
    marginTop: 6,
    fontSize: 12,
    color: "#5B6B7F",
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
    color: "#0F1B2D",
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F1B2D",
    marginTop: 10,
    marginBottom: 8,
  },

  label: { color: C.muted, fontSize: 12, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    backgroundColor: '#F7F9FC',
    borderColor: '#DCE3EC',
    borderRadius: 16,
    paddingLeft: 14,
    paddingRight: 6,
    height: 54,
  },
  input1: { flex: 1, height: "100%", color: C.ink, fontSize: 16, fontWeight: "600" },

  input: {
    backgroundColor: "#F3F6FA",
    borderWidth: 1,
    borderColor: "#E3E9F1",
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: "#0F1B2D",
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
    borderColor: "#DCE3EC",
    justifyContent: "center",
    alignItems: "center",
  },

  cancelButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#5B6B7F",
  },

  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#159B79",
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


  tripInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 14,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3F5EE",
  },

  tripInfoText: {
    flex: 1,
    color: "#0F1B2D",
    fontSize: 13.5,
    fontWeight: "600",
    lineHeight: 19,
  },

  dateMessageContainer: {
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 24,
    paddingVertical: 30,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    shadowColor: "#0F1B2D",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  dateMessageTitle: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: "800",
    color: "#0F1B2D",
    textAlign: "center",
  },

  dateMessageText: {
    marginTop: 6,
    fontSize: 13.5,
    color: "#5B6B7F",
    textAlign: "center",
    lineHeight: 20,
  },

});