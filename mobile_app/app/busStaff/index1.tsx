// app/driver/index1.tsx (or wherever your file is)
import React, { useEffect, useRef, useState } from 'react';
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import {
  Image, 
  Alert,
  StyleSheet,
  TextInput,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  BackHandler,
} from "react-native";

// Icons
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Feather,
  FontAwesome,
  FontAwesome5,
} from '@expo/vector-icons';
import * as Location from "expo-location";
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from "@react-native-async-storage/async-storage";
// ─── Environment Variables ─────────────────────────────────────────
const API_URL     = process.env.EXPO_PUBLIC_API_URL;
const WEATHER_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;

export default function DriverHome() {
  const router  = useRouter();
  const params  = useLocalSearchParams();
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState('');
  const driverNIC1:string = "Not ";
  const conductorNIC1:string = "Not ";
  const driverD1:string = "Not login yet";
  const conductorD1:string = "Not login yet";
  const driverD = `${params.dfirstName} ${params.dlastName} ${params.dphoneNumber}`;
  const conductorD = `${params.cfirstName} ${params.clastName} ${params.cphoneNumber}`;

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return "Good Morning ";
    } else if (hour >= 12 && hour < 17) {
      return "Good Afternoon ";
    } else if (hour >= 17 && hour < 21) {
      return "Good Evening ";
    } else {
      return "Good Night 🌙";
    }
  };

  // ─── State ──────────────────────────────────────────────────────
  const [loading, setLoading]               = useState(false);
  const [sharingActive, setSharingActive]   = useState(false);
  const [currentSpeed, setCurrentSpeed]     = useState<number>(0);
  const [locationName, setLocationName]     = useState<string>("Getting location...");
  const [updateCount, setUpdateCount]       = useState<number>(0);
  const [lastSentTime, setLastSentTime]     = useState<string>("--");
  const [currentCoords, setCurrentCoords]   = useState<{
    lat: number; lng: number
  } | null>(null);

  // ─── Refs ────────────────────────────────────────────────────────
  const locationInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const locationSub      = useRef<Location.LocationSubscription | null>(null);

  // ─── Params ─────────────────────────────────────────────────────
  // busNo is sent from login screen
  const busNum = params.busNo as string;

  // ────────────────────────────────────────────────────────────────
  // 1. Get place name using OpenWeather reverse geocoding
  // ────────────────────────────────────────────────────────────────
  const getPlaceName = async (
    lat: number,
    lng: number
  ): Promise<string> => {
    try {
      const res = await fetch(
        `http://api.openweathermap.org/geo/1.0/reverse` +
        `?lat=${lat}&lon=${lng}&limit=1&appid=${WEATHER_KEY}`
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const place = data[0];
        return `${place.name}${place.state 
          ? ", " + place.state 
          : ""}, ${place.country}`;
      }
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch (error) {
      console.log("Geocoding error:", error);
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
  };

  // ────────────────────────────────────────────────────────────────
  // 2. Send Location to Backend  
  //    Fixed endpoint: /api/locations/update
  //    Fixed field:    busNama (not busNumber)
  // ────────────────────────────────────────────────────────────────
  const sendLocation = async () => {
    try {
      // Check permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to share bus location."
        );
        return;
      }

      if (!API_URL) {
        console.log("API_URL is not set in .env");
        return;
      }

      // Get current GPS position
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude, speed, heading } = currentLocation.coords;
      const speedKmh = Math.max(0, (speed ?? 0) * 3.6); // m/s → km/h

      // Update state
      setCurrentCoords({ lat: latitude, lng: longitude });
      setCurrentSpeed(speedKmh);

      // ── Send to backend ────────────────────────────────────────
      // FIXED: endpoint changed from /location/update 
      //        to /api/locations/update
      // FIXED: field changed from busNumber to busNama
      const response = await fetch(`${API_URL}/locations/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          busNumber:   busNum,      // ← FIXED field name
          latitude:  latitude,
          longitude: longitude,
          speed:     speedKmh,
          driverNIC:params.driverId,
          conductorNIC:params.conductorNIC,
          driverD:driverD,
          conductorD:conductorD,
          heading:   heading ?? 0,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.log("Send location failed:", response.status, errText);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setUpdateCount((prev) => prev + 1);
        setLastSentTime(new Date().toLocaleTimeString());
        console.log("✅ Location sent:", latitude, longitude);

        // Get place name every 5 updates to reduce API calls
        setUpdateCount((prev) => {
          if (prev % 5 === 0 || prev === 0) {
            getPlaceName(latitude, longitude).then(setLocationName);
          }
          return prev + 1;
        });
      }
    } catch (error) {
      console.log("Send location error:", error);
    }
  };

  // ────────────────────────────────────────────────────────────────
  // 3. Stop sharing and mark bus offline
  //    Fixed: field changed from busNumber to busNama
  // ────────────────────────────────────────────────────────────────
  const stopSharing = async () => {
  try {
    // Stop location updates
    if (locationInterval.current) {
      clearInterval(locationInterval.current);
      locationInterval.current = null;
    }

    if (locationSub.current) {
      locationSub.current.remove();
      locationSub.current = null;
    }

    const sendOfflineRequest = async () => {
      try {
        const response = await fetch(`${API_URL}/locations/update1`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            busNumber: busNum,
            latitude: 0,
            longitude: 0,
            speed: 0,
            driverNIC: driverNIC1,
            conductorNIC: conductorNIC1,
            driverD: driverD1,
            conductorD: conductorD1,
            heading: 0,
          }),
        });

        console.log("✅ Bus marked offline");
      } catch (err) {
        console.log("Request failed:", err);
      }
    };

    // Send immediately
    await sendOfflineRequest();

    // Send every 2 seconds
    const retryInterval = setInterval(sendOfflineRequest, 2000);

    // Stop after 10 seconds
    setTimeout(() => {
      clearInterval(retryInterval);
      console.log("Stopped retrying");
    }, 30000);

    setSharingActive(false);
    setCurrentCoords(null);
    setCurrentSpeed(0);
    setLocationName("Not sharing location");
    setUpdateCount(0);
    setLastSentTime("--");

  } catch (error) {
    console.log("Stop sharing error:", error);
  }
};

  // ────────────────────────────────────────────────────────────────
  // 4. Start sharing location
  // ────────────────────────────────────────────────────────────────
  const startSharing = async () => {
    setLoading(true);

    // Send first location immediately
    await sendLocation();

    // Then send every 5 seconds
    if (locationInterval.current) {
      clearInterval(locationInterval.current);
    }

    locationInterval.current = setInterval(() => {
      sendLocation();
    }, 5000);

    setSharingActive(true);
    setLoading(false);

    // Alert.alert(
    //   "Location Sharing Active",
    //   "Your location is updating every 5 seconds. Do you want to continue?",
    //   [
    //     {
    //       text: "No",
    //       onPress: () => stopSharing(),
    //       style: "cancel",
    //     },
    //     {
    //       text: "Yes",
    //       onPress: () => console.log("Continue sharing"),
    //     },
    //   ]
    // );
      

          

          
    
    
  };

  // ────────────────────────────────────────────────────────────────
  // 5. Auto-ask on screen load if busNum exists
  // ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const backAction = () => {
      logout();
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    if (!busNum) {
      console.log("No busNum in params — sharing skipped.");
      return () => subscription.remove();
    }

    // Start sharing automatically
    startSharing();

    // Cleanup on unmount
    return () => {
      subscription.remove();

      if (locationInterval.current) {
        clearInterval(locationInterval.current);
        locationInterval.current = null;
      }
    };
  }, [busNum]);

  // ────────────────────────────────────────────────────────────────
  // 6. Logout Function
  // ────────────────────────────────────────────────────────────────
  const logout = () => {
    if (sharingActive) {
      Alert.alert(
        "Stop Sharing?",
        "Admin will no longer see your location.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Stop",
            style: "destructive",
            onPress: stopSharing,
            
          },
        ]
      );
    } 
    else {
      stopSharing();
      Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            if (sharingActive) {
              await stopSharing();
            }
            await AsyncStorage.clear();
            router.replace("/passenger/selectScreen");
          },
        },
      ]
    );
    }
    
  };

  // ────────────────────────────────────────────────────────────────
  // 7. Toggle sharing on/off manually
  // ────────────────────────────────────────────────────────────────
  const toggleSharing = () => {
    if (sharingActive) {
      Alert.alert(
        "Stop Sharing?",
        "Admin will no longer see your location.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Stop",
            style: "destructive",
            onPress: stopSharing,
            
          },
        ]
      );
    } else {
      startSharing();
    }
  };

  const handleSearch = () => {
      stopSharing();
      router.push({

        pathname: "/busStaff/manageParcel",
        params: {
            Cid: params.Cid,
            conductorId: params.conductorId,
            conductorNIC:params.conductorNIC,
            cfirstName: params.cfirstName,
            clastName: params.clastName,
            cphoneNumber:params.cphoneNumber,
            driverId:params.driverId,
            dfirstName:params.dfirstName,
            dlastName:params.dlastName,
            dphoneNumber:params.dphoneNumber,
            busNo: params.busNo,
        },         
      });
    };


  // ────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────
  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#0056b3" />
      <SafeAreaView style={styles.container}>

        {/* ── Header ──────────────────────────────────────────── */}
        <LinearGradient
          colors={['#4B6CF5', '#32CD32']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.submitGradient1}
        >
        
          <View style={styles.header}>
            
            
            <TouchableOpacity >
              <Text style={styles.title}>Jetlink</Text>
            </TouchableOpacity>
            
            
          </View>
        </LinearGradient>

        {/* ── Welcome Card ────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.title1}>{getGreeting()}, {params.busNum} 👋</Text>

          <View style={styles.iconContainer1}>
            <Text style={styles.title2}>{busNum || "No Bus"}</Text>
            <MaterialIcons name="directions-bus" size={30} color="#0047AB" />
          </View>

          <Text style={styles.subtitle1}>
            {sharingActive
              ? `🟢 Sharing live location`
              : "🔴 Location sharing is OFF"}
          </Text>
        </View>

        {/* ── Location Status Card ─────────────────────────────── */}
        {/* <View style={styles.locationCard}> */}

          {/* Current Place */}
          {/* <View style={styles.locationRow}>
            <MaterialIcons name="location-on" size={20} color="#0047AB" />
            <Text style={styles.locationText} numberOfLines={1}>
              {locationName}
            </Text>
          </View> */}

          {/* Speed */}
          {/* <View style={styles.locationRow}>
            <MaterialIcons name="speed" size={20} color="#0047AB" />
            <Text style={styles.locationText}>
              Speed: {currentSpeed.toFixed(1)} km/h
            </Text>
          </View> */}

          {/* Stats Row */}
          {/* <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{updateCount}</Text>
              <Text style={styles.statLabel}>Updates Sent</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{lastSentTime}</Text>
              <Text style={styles.statLabel}>Last Sent</Text>
            </View>
          </View> */}

          {/* Coordinates */}
          {/* {currentCoords && (
            <View style={styles.coordBox}>
              <Text style={styles.coordText}>
                Lat: {currentCoords.lat.toFixed(6)}
              </Text>
              <Text style={styles.coordText}>
                Lng: {currentCoords.lng.toFixed(6)}
              </Text>
            </View>
          )}
        </View> */}

        {/* ── GPS Toggle Button ────────────────────────────────── */}
        <View
          style={[
            styles.gpsButton,
            { backgroundColor: sharingActive ? "#FF4444" : "#32CD32" },
          ]}
          
        >
          <MaterialIcons
            name={sharingActive ? "location-off" : "location-on"}
            size={26}
            color="#fff"
          />
          <Text style={styles.gpsButtonText}>
            {loading
              ? "Connecting..."
              : sharingActive
              ? "Stop Sharing Location"
              : "Start Sharing Location"}
          </Text>
        </View>

        {/* ── Action Cards Row ─────────────────────────────────── */}
        <View style={styles.listContainer1}>
          <TouchableOpacity
            style={styles.card0}
            onPress={() => router.push("/busStaff/index1")}
            disabled={loading}
          >
            <View style={[styles.iconContainer, { backgroundColor: "#8B5CF618"  }]}>
              <FontAwesome5 name="bus-alt" size={24} color="#8B5CF6" />
            </View>
            <Text style={styles.cardText}>Scan Bus Ticket</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#C7C7CC"
            />
          </TouchableOpacity>
        </View>

        {/* ── Grid Cards ───────────────────────────────────────── */}
        <View style={styles.listContainer}>
          <TouchableOpacity
            style={styles.card1}
            onPress={handleSearch}
            disabled={loading}
          >
            <View style={[styles.iconContainer, { backgroundColor: "#ffc40018"  }]}>
              <Feather name="gift" size={24} color="#ffc400" />
            </View>
            <Text style={styles.cardText}>Parcel</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card2}
            onPress={() => router.push("/busStaff/index1")}
            disabled={loading}
          >
            <View style={[styles.iconContainer, { backgroundColor: "#EC489918"  }]}>
              <FontAwesome5 name="route" size={24} color="#EC4899" />
            </View>
            <Text style={styles.cardText}>Tours</Text>  
            <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card1}
            onPress={() => router.push("/busStaff/index1")}
            disabled={loading}
          >
            <View style={[styles.iconContainer, { backgroundColor: "#ff000018"  }]}>
              <MaterialCommunityIcons name="alarm-light-outline" size={24} color="#ff0000" />
            </View>
            <Text style={styles.cardText}>Emergency</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card2}
            onPress={() => router.push("/busStaff/index1")}
            disabled={loading}
          >
            <View style={[styles.iconContainer, { backgroundColor: "#10B98118"  }]}>
                <FontAwesome5 name="hands-helping" size={24} color="#10B981" />
              </View>
              <Text style={styles.cardText}>Help</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
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
            ) : (
              <Text style={styles.subHeaderTitle}>{params.busNumber}</Text>
          )}

        <View style={styles.bottomNav}>
        
                  
        
                  <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("home"); logout();}} disabled={loading}>
                    <Ionicons name="log-out-outline" size={24} color={activeTab === "home" ? "#0057D9" : "#8A8A8A"}/>
                    
                    <Text style={[styles.label1,activeTab === "home" && styles.activeLabel,]}>
                      Logout
                    </Text>
                  </TouchableOpacity>
        
                  <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("routes"); setIsSearching(!isSearching); }}>
                    <FontAwesome name={isSearching ? "close" : "search"} size={24} color={activeTab  === "routes" ? "#0057D9" : "#8A8A8A"}/>
                    <Text style={[ styles.label1,activeTab === "routes" && styles.activeLabel,]}>
                      Routes
                    </Text>
                  </TouchableOpacity>
        
                  <TouchableOpacity style={styles.centerButton} onPress={() => {setActiveTab("tickets"); router.push({
                            pathname: "/admin/index1",
                            params: {
                              Cid: params.Cid,
                              conductorId: params.conductorId,
                              conductorNIC:params.conductorNIC,
                              cfirstName: params.cfirstName,
                              clastName: params.clastName,
                              cphoneNumber:params.cphoneNumber,
                              driverId:params.driverId,
                              dfirstName:params.dfirstName,
                              dlastName:params.dlastName,
                              dphoneNumber:params.dphoneNumber,
                              busNo: params.busNo,
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

        <View style={styles.footerGraphic}>
          <LinearGradient
            colors={['#4B6CF5', '#32CD32']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
          </LinearGradient>
        </View>
        <View style={styles.footerGraphic1}>
          <LinearGradient
            colors={['#4B6CF5', '#32CD32']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
          </LinearGradient>
        </View>
      </SafeAreaView>
    </>
  );
}

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
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.5,
  },

  // ── Welcome Card ────────────────────────────────────────────────
  card: {
    width: "90%",
    backgroundColor: "#FFF",
    padding: 14,
    borderLeftColor: "#32CD32",
    borderRightColor: "#32CD32",
    borderTopColor: "#32CD32",
    marginTop: -50,
    alignSelf: "center",
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 2,
    borderRadius: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  iconContainer1: {
    borderRadius: 12,
    flexDirection: "row",
    marginBottom: 5,
    marginTop: 5,
    alignItems: "center",
  },
  title1: {
    width: "100%",
    color: "#0047AB",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  title2: {
    color: "#0047AB",
    fontSize: 30,
    fontWeight: "700",
    marginRight: 10,
  },
  subtitle1: {
    color: "#555",
    fontSize: 14,
    fontWeight: "500",
  },

  // ── Location Status Card ─────────────────────────────────────────
  locationCard: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 15,
    marginTop: 14,
    alignSelf: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: "#0047AB",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "#f0f4ff",
    borderRadius: 12,
    padding: 10,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#ccc",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0047AB",
  },
  statLabel: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },
  coordBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 8,
  },
  coordText: {
    fontSize: 11,
    color: "#666",
  },

  // ── GPS Toggle Button ─────────────────────────────────────────────
  gpsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    alignSelf: "center",
    padding: 16,
    borderRadius: 25,
    marginTop: 14,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  gpsButtonText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#fff",
    marginLeft: 10,
  },

  // ── Action Cards ──────────────────────────────────────────────────
  listContainer1: {
    paddingHorizontal: 20,
    marginTop: 14,
  },
  card0: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  listContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card1: {
    paddingLeft:10,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    width: '48%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    marginBottom: 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  card2: {
    paddingLeft:10,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    width: '48%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    marginBottom: 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },

  input3dIcon: {
    marginRight: 12,
    marginLeft: 19,
    width: 35,
    justifyContent: "center",
    marginTop: 25,
    height: 35,
    marginBottom: 15,
  },
  input3dIcon1: {
    marginRight: 12,
    width: 25,
    justifyContent: "center",
    height: 35,
    marginTop: 1,
  },
  cardText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
  },

  // ── Footer ────────────────────────────────────────────────────────
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
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25, 
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