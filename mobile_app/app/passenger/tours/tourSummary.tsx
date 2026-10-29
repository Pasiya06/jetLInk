import React, { useEffect, useRef, useState } from "react";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
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
} from "react-native";
import SearchPanel from "../../../components/SearchPanel";
import { Alert } from "../../../components/JetAlert";

import { LinearGradient } from "expo-linear-gradient";
import { C, GRADIENT } from "../../../components/JetUI";
import { TIER_COLORS, getTier } from "../../../components/TourPackageCard";

import {
  Ionicons,
  MaterialCommunityIcons,
  Feather ,  
  FontAwesome,
  Fontisto, 
} from "@expo/vector-icons";

import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from "expo-location";
import MapView, { Marker, MapPressEvent, Region, MapViewHandle } from "../../../components/OSMMap";

import FieldError from "../../../components/FieldError";
import { useFieldErrors } from "../../../utils/validation";
import { useBusNames } from "../../../components/BusName";
import AlertBadge from "../../../components/AlertBadge";
const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Place = {
  _id: string;
  name: string;
  description: string;
  icon: string;
  iconType: string;
  color: string;
  order: number;
};

type Coords = { latitude: number; longitude: number };
const DEFAULT_REGION: Region = { latitude: 7.8731, longitude: 80.7718, latitudeDelta: 3, longitudeDelta: 3 }; // Sri Lanka

type PackageData = {
  _id: string;
  description: string;
  packageType: string;
  totalDistance: string;
  tripDuration: string;
  maxPassengers: number;
  maxPrice: number;
  places: Place[];
};

export default function PackageDetails() {
  const router = useRouter();
  const { validate: validateFields, errorFor: fieldError } = useFieldErrors();
  const params = useLocalSearchParams();
  const { busLabel } = useBusNames();
  const [pickup, setPickup] = useState(String(params.pickup || ""));
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const PACKAGE_ID = params.packageId as string;
  const [packageData, setPackageData] = useState<PackageData | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState(''); 
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Current-location pickup + map
  const mapRef = useRef<MapViewHandle>(null);
  const [pickupCoords, setPickupCoords] = useState<Coords | null>(
    params.pickupLat && params.pickupLng
      ? { latitude: Number(params.pickupLat), longitude: Number(params.pickupLng) }
      : null
  );
  const [pickupAddress, setPickupAddress] = useState(String(params.pickupAddress || ""));
  const [locating, setLocating] = useState(false);
  const [mapTouching, setMapTouching] = useState(false);

  // Move map camera to a point
  const focusMap = (c: Coords) => {
    mapRef.current?.animateToRegion({ ...c, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 600);
  };

  // Set the pickup from a map point: save coords + turn them into a place name
  const setPickupFromCoords = async (c: Coords) => {
    setPickupCoords(c);
    let name = "";
    let address = "";
    try {
      const [addr] = await Location.reverseGeocodeAsync(c);
      name = addr?.city || addr?.district || addr?.subregion || addr?.region || addr?.name || "";
      address = [addr?.name, addr?.street, addr?.city || addr?.district, addr?.region]
        .filter((v, i, a) => !!v && a.indexOf(v) === i)
        .join(", ");
    } catch {}

    if (!name) name = `${c.latitude.toFixed(5)},${c.longitude.toFixed(5)}`;
    setPickupAddress(address || `${c.latitude.toFixed(5)}, ${c.longitude.toFixed(5)}`);

    // Same format as typed input: no spaces, uppercase
    setPickup(name.replace(/\s/g, "").toUpperCase());
  };

  const getCurrentLocation = async (silent = false) => {
    try {
      setLocating(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        if (!silent) Alert.alert("Permission needed", "Allow location access to use your current location as the pickup.");
        return;
      }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const c = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      focusMap(c);
      await setPickupFromCoords(c);
    } catch (e) {
      if (!silent) Alert.alert("Location error", "Could not get your current location. Please turn on GPS and try again.");
    } finally {
      setLocating(false);
    }
  };

  // Tap anywhere on the map, or drag the pin, to change the pickup
  const onMapPress = (e: MapPressEvent) => setPickupFromCoords(e.nativeEvent.coordinate);
  const onMarkerDragEnd = (e: any) => setPickupFromCoords(e.nativeEvent.coordinate);

  // Auto-fill pickup with current location when screen opens (if not already set)
  useEffect(() => {
    if (!pickup) getCurrentLocation(true);
  }, []);

  const onTimeChange = (event: any, selected?: Date) => {
    setShowTimePicker(false);

    if (selected) {
      setTime(selected);

      const formatted = selected.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      setSelectedTime(formatted);
    }
  };

  const tourinterface = () => {
    if (!validateFields([
      { key: "pickup", label: "Pickup location", value: pickup },
      { key: "selectedTime", label: "Pickup time", value: selectedTime },
    ])) return;

    router.push({
      pathname: "/passenger/tours/paymentGateway",
      params: {
        busNumber: params.busNumber,
        driverNIC: params.driverNIC,
        conductorNIC: params.conductorNIC,
        driverD: params.driverD,
        conductorD: params.conductorD,
        isOnline: params.isOnline,
        date: params.date,
        pickup: pickup,
        pickupLat: pickupCoords ? String(pickupCoords.latitude) : "",
        pickupLng: pickupCoords ? String(pickupCoords.longitude) : "",
        pickupAddress: pickupAddress,
        time: selectedTime,
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
    });
  };


  

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
            style={styles.submitGradient1}
        >
            <View style={styles.header}>
                <Text style={styles.eyebrow}>Review your tour</Text>
                <Text style={styles.headertitle}>Tour summary</Text>
            </View>
        </LinearGradient> 

        <ScrollView
          style={styles.scroll}
          scrollEnabled={!mapTouching}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >

        {/*  PACKAGE  */}

        <View style={styles.card}>
          <View style={[styles.cardStrip, { backgroundColor: TIER_COLORS[getTier(String(params.packageType || ""))].border }]} />
          <View style={styles.cardBody}>
            <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.packageTypeBadge,
                    {
                      backgroundColor: TIER_COLORS[getTier(String(params.packageType || ""))].pale,
                      borderColor: TIER_COLORS[getTier(String(params.packageType || ""))].border,
                    },
                  ]}
                >
                <Text style={[styles.packageTypeText, { color: TIER_COLORS[getTier(String(params.packageType || ""))].main }]}>
                    {params.packageType ||"PACKAGE"}
                </Text>
                </View>
                <Text style={styles.wholeBus}>Whole bus</Text>
            </View>
        
            <Text style={styles.packageName}>
                <Text style={styles.currency}>Rs </Text>
                {Number(params.maxPrice || 0).toLocaleString()}
            </Text>
        
            {!!params.description && (
                <Text style={styles.description1} numberOfLines={2}>
                {params.description}
                </Text>
            )}
        
            <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                <Ionicons name="navigate" size={16} color={C.blue}/>
                <Text style={styles.detailText} numberOfLines={1}>
                    {params.totalDistance || "No distance"}
                </Text>
                </View>
        
                <View style={styles.detailItem}>
                <Ionicons name="time" size={16} color={C.blue} />
                <Text style={styles.detailText} numberOfLines={1}>
                    {params.tripDuration || "No duration"}
                </Text>
                </View>
        
                <View style={styles.detailItem}>
                <Ionicons name="people" size={16} color={C.blue}/>
                <Text style={styles.detailText} numberOfLines={1}>
                    {params.maxPassengers || 0}
                </Text>
                </View>
            </View>
          </View>
        </View>

        {/*  TRIP  */}

        <View style={styles.card1} >
          <View style={styles.detailRow}>        
            <View style={[styles.iconWrap, { backgroundColor: C.amberSoft }]}>
              <Ionicons name="calendar" size={18} color={C.amber} />
            </View>
            <View style={styles.detailTextWrap}>
              <Text style={styles.detailLabel}>Tour date</Text>
              <Text style={styles.detailValue}>{params.date}</Text>
            </View>
          </View>
          {!!params.busNumber && (
            <>
              <View style={styles.rowDivider} />
              <View style={styles.detailRow}>        
                <View style={[styles.iconWrap, { backgroundColor: C.blueSoft }]}>
                  <Fontisto name="bus" size={15} color={C.blue} />
                </View>
                <View style={styles.detailTextWrap}>
                  <Text style={styles.detailLabel}>Bus</Text>
                  <Text style={styles.detailValue}>{busLabel(params.busNumber)}</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/*  PICKUP  */}

        <View style={styles.card2} >
          <Text style={styles.cardTitle}>Pickup details</Text>

          <Text style={styles.inputLabel}>Pickup location</Text>  
          <View style={styles.inputWrapper}>                
            <Ionicons name="location" size={18} color={C.green} />
            <View style={styles.inputInnerWrapper}>
             <TextInput 
              style={styles.input} 
              value={pickup}  
              placeholder="GALLE"
              placeholderTextColor="#8A97A8"
              onChangeText={(text) => { setPickup(text.replace(/\s/g, "").toUpperCase()); setPickupCoords(null); setPickupAddress(""); }}
              autoCapitalize="characters"
              autoCorrect={false}
              />
            </View>
            <TouchableOpacity
              style={styles.timeBtn}
              activeOpacity={0.8}
              onPress={() => getCurrentLocation(false)}
              disabled={locating}
            >
              {locating
                ? <ActivityIndicator size="small" color={C.blue} />
                : <MaterialCommunityIcons name="crosshairs-gps" size={18} color={C.blue} />}
            </TouchableOpacity>
          </View>
          <FieldError message={fieldError("pickup", pickup)} />

          {/* MAP: shows pickup pin; tap map or drag pin to change */}
          <View
            style={styles.mapWrap}
            onTouchStart={() => setMapTouching(true)}
            onTouchEnd={() => setMapTouching(false)}
            onTouchCancel={() => setMapTouching(false)}
          >
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={DEFAULT_REGION}
              showsUserLocation
              showsMyLocationButton={false}
              onPress={onMapPress}
              onMapReady={() => { if (pickupCoords) focusMap(pickupCoords); }}
            >
              {pickupCoords && (
                <Marker
                  coordinate={pickupCoords}
                  draggable
                  onDragEnd={onMarkerDragEnd}
                  title="Pickup location"
                  description={pickupAddress}
                  pinColor={C.green}
                />
              )}
            </MapView>

            <TouchableOpacity
              style={styles.mapLocateBtn}
              activeOpacity={0.85}
              onPress={() => getCurrentLocation(false)}
              disabled={locating}
            >
              {locating
                ? <ActivityIndicator size="small" color={C.blue} />
                : <MaterialCommunityIcons name="crosshairs-gps" size={20} color={C.blue} />}
            </TouchableOpacity>
          </View>
          <Text style={styles.locHint} numberOfLines={2}>
            {pickupCoords
              ? `📍 ${pickupAddress}`
              : "Tap the map or the GPS icon to set your pickup location"}
          </Text>
          {!!pickupCoords && (
            <Text style={styles.locSubHint}>Tap the map or drag the pin to change it</Text>
          )}

          <Text style={styles.inputLabel}>Pickup time</Text>
          <TouchableOpacity style={styles.inputWrapper} activeOpacity={0.8} onPress={() => setShowTimePicker(true)}>
            <Ionicons name="time" size={18} color={C.blue} />
            <TextInput style={styles.input}
              value={selectedTime}
              placeholder="Choose a time"
              placeholderTextColor="#8A97A8"
              editable={false}
              pointerEvents="none"
            />
            <View style={styles.timeBtn}>
              <Ionicons name="chevron-down" size={18} color={C.blue} />
            </View>
          </TouchableOpacity>
          <FieldError message={fieldError("selectedTime", selectedTime)} /> 

          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="default"
              onChange={onTimeChange}
            />
          )}                
        </View>
        </ScrollView>

        <View style={styles.ctaWrap}>
          <TouchableOpacity style={styles.submitButton} onPress={tourinterface} activeOpacity={0.9}>
            <LinearGradient
              colors={GRADIENT}
              start={{x: 0, y: 0,}}
              end={{x: 1, y: 1,}}
              style={styles.ctaGradient}
            >
            <Ionicons name="card" size={20} color="#FFFFFF" />
            <Text style={styles.submitText}>Pay Rs {Number(params.maxPrice || 0).toLocaleString()}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <SearchPanel
          visible={isSearching}
          query={searchQuery}
          onChangeQuery={setSearchQuery}
          onClose={() => { setIsSearching(false); setSearchQuery(""); }}
          role={"passenger"}
          params={params}
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
            <View><Ionicons name="notifications-outline" size={24} color={activeTab === "alerts" ? "#0057D9" : "#8A8A8A"}/><AlertBadge role="passenger" /></View>
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

  eyebrow: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  scroll: { flex: 1, marginTop: -56 },
  cardStrip: { height: 5, width: "100%" },
  cardBody: { padding: 18 },
  wholeBus: { fontSize: 12, fontWeight: "600", color: C.muted },
  currency: { fontSize: 15, fontWeight: "700", color: C.muted },
  rowDivider: { height: 1, backgroundColor: C.line, marginLeft: 52 },
  cardTitle: { fontSize: 17, fontWeight: "800", color: C.ink, marginBottom: 2 },
  timeBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: C.blueSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  locHint: { fontSize: 12, color: C.ink, fontWeight: "600", marginLeft: 4, marginTop: 8 },
  locSubHint: { fontSize: 11.5, color: C.muted, fontWeight: "600", marginLeft: 4, marginTop: 2 },
  mapWrap: {
    height: 220,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#DCE3EC",
    marginTop: 6,
  },
  map: { flex: 1 },
  mapLocateBtn: {
    position: "absolute",
    right: 10,
    bottom: 10,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#0F1B2D",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  ctaWrap: { paddingHorizontal: 20, paddingTop: 10, marginBottom: 165 },
  ctaGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  container: {
    flex: 1,
    backgroundColor: "#F3F6FA",
  },

  header: {
    paddingTop: 54,
    paddingHorizontal: 24,
    paddingBottom: 76,
  },

  submitGradient1: { borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },

  headertitle: { fontSize: 28, fontWeight: "800", color: "#FFFFFF" },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    overflow: "hidden",
    marginHorizontal: 16,
    marginBottom: 14,
    elevation: 4,
    shadowColor: "#0F1B2D",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  packageTypeBadge: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },

  packageTypeText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.6, textTransform: "uppercase" },

  packageName: { marginTop: 10, fontSize: 26, fontWeight: "800", color: C.navy, letterSpacing: -0.4 },

  description1: { marginTop: 4, fontSize: 13.5, lineHeight: 20, color: C.muted },

  detailsRow: { marginTop: 14, flexDirection: "row", gap: 8 },

  detailItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F7F9FC",
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 9,
  },

  detailText: { fontSize: 12.5, fontWeight: "700", color: C.ink, flexShrink: 1 },

  card1: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 6,
    elevation: 3,
    shadowColor: "#0F1B2D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
  },

  svw1: {
    width: '100%',  
    alignItems: 'center', 
  },

  detailRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },

  detailTextWrap: {
    marginLeft: 12,
    flex: 1,
  },

  detailLabel: { fontSize: 12, color: C.muted, fontWeight: "600", marginBottom: 2 },

  detailValue: { fontSize: 16, color: C.ink, fontWeight: "800" },

  iconWrap: { width: 40, height: 40, borderRadius: 13, justifyContent: "center", alignItems: "center" },

  card2: {
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    elevation: 3,
    shadowColor: "#0F1B2D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
  },

  svw: {
    width: '100%',
      
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F7F9FC',
    borderWidth: 1,
    borderColor: '#DCE3EC',
    borderRadius: 16,
    paddingLeft: 14,
    paddingRight: 8,
    height: 54,
    marginBottom: 4,
  },

  inputInnerWrapper: {
    flex: 1,
  },

  inputLabel: { fontSize: 13, color: C.ink, fontWeight: "700", marginTop: 10, marginBottom: 8 },

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

  scrollContent: { paddingBottom: 20 },

  input: { flex: 1, height: "100%", color: C.ink, fontSize: 16, fontWeight: "600" },

  submitButton: {
    height: 56,
    overflow: 'hidden',
    borderRadius: 28,
    shadowColor: "#155B8A",
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

   submitText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
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

});