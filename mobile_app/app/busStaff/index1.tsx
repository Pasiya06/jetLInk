// app/driver/index1.tsx (or wherever your file is)
import React, { useEffect, useRef, useState } from 'react';
import { Image, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import {
  StyleSheet,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";

// Icons
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import * as Location from "expo-location";

// ─── Environment Variables ─────────────────────────────────────────
const API_URL     = process.env.EXPO_PUBLIC_API_URL;
const WEATHER_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;

export default function DriverHome() {
  const router  = useRouter();
  const params  = useLocalSearchParams();
  const driverD = `${params.dfirstName} ${params.dlastName} ${params.dphoneNumber}`;
  const conductorD = `${params.cfirstName} ${params.clastName} ${params.cphoneNumber}`;

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
      // Clear interval
      if (locationInterval.current) {
        clearInterval(locationInterval.current);
        locationInterval.current = null;
      }

      // Remove location watcher
      if (locationSub.current) {
        locationSub.current.remove();
        locationSub.current = null;
      }

      // FIXED: endpoint changed from /location/offline
      //        to /api/locations/offline
      // FIXED: field changed from busNumber to busNama
      await fetch(`${API_URL}/locations/offline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          busNumber: busNum, // ← FIXED field name
        }),
      });

      setSharingActive(false);
      setCurrentCoords(null);
      setCurrentSpeed(0);
      setLocationName("Not sharing location");
      setUpdateCount(0);
      setLastSentTime("--");

      console.log("✅ Bus marked offline" );
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

    Alert.alert(
      "✅ Location Sharing Active",
      "Your location is updating every 5 seconds."
    );
  };

  // ────────────────────────────────────────────────────────────────
  // 5. Auto-ask on screen load if busNum exists
  // ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!busNum) {
      console.log("No busNum in params — sharing skipped.");
      return;
    }

    Alert.alert(
      "📍 Location Sharing",
      `Start sharing location for Bus ${busNum}?`,
      [
        {
          text: "No",
          style: "cancel",
          onPress: () => {
            setLocationName("Location sharing declined");
          },
        },
        {
          text: "Yes",
          onPress: startSharing,
        },
      ],
      { cancelable: false }
    );

    // Cleanup on unmount
    return () => {
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
            // Stop sharing before logout
            
            router.replace("/");
          },
        },
      ]
    );
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

  // ────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────
  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#0056b3" />
      <SafeAreaView style={styles.container}>

        {/* ── Header ──────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity>
            <Ionicons name="menu" size={30} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={logout}>
            <Text style={styles.title}>Jetlink</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={logout}>
            <Ionicons name="log-out-outline" size={26} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* ── Welcome Card ────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.title1}>Good Morning, Driver 👋</Text>

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
        <View style={styles.locationCard}>

          {/* Current Place */}
          <View style={styles.locationRow}>
            <MaterialIcons name="location-on" size={20} color="#0047AB" />
            <Text style={styles.locationText} numberOfLines={1}>
              {locationName}
            </Text>
          </View>

          {/* Speed */}
          <View style={styles.locationRow}>
            <MaterialIcons name="speed" size={20} color="#0047AB" />
            <Text style={styles.locationText}>
              Speed: {currentSpeed.toFixed(1)} km/h
            </Text>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{updateCount}</Text>
              <Text style={styles.statLabel}>Updates Sent</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{lastSentTime}</Text>
              <Text style={styles.statLabel}>Last Sent</Text>
            </View>
          </View>

          {/* Coordinates */}
          {currentCoords && (
            <View style={styles.coordBox}>
              <Text style={styles.coordText}>
                Lat: {currentCoords.lat.toFixed(6)}
              </Text>
              <Text style={styles.coordText}>
                Lng: {currentCoords.lng.toFixed(6)}
              </Text>
            </View>
          )}
        </View>

        {/* ── GPS Toggle Button ────────────────────────────────── */}
        <TouchableOpacity
          style={[
            styles.gpsButton,
            { backgroundColor: sharingActive ? "#FF4444" : "#32CD32" },
          ]}
          onPress={toggleSharing}
          disabled={loading}
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
        </TouchableOpacity>

        {/* ── Action Cards Row ─────────────────────────────────── */}
        <View style={styles.listContainer1}>
          <TouchableOpacity
            style={styles.card0}
            onPress={() => router.push("/busStaff/index1")}
          >
            <View style={styles.iconContainer}>
              <Image
                source={require("../../assets/images/icons8-bus-94.png")}
                style={styles.input3dIcon1}
              />
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
            onPress={() => router.push("/busStaff/index1")}
          >
            <View style={styles.iconContainer}>
              <Image
                source={require("../../assets/images/icons8-package-94.png")}
                style={styles.input3dIcon}
              />
            </View>
            <Text style={styles.cardText}>Parcel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card2}
            onPress={() => router.push("/busStaff/index1")}
          >
            <View style={styles.iconContainer}>
              <Image
                source={require("../../assets/images/icons8-beach-94.png")}
                style={styles.input3dIcon}
              />
            </View>
            <Text style={styles.cardText}>Tours</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card1}
            onPress={() => router.push("/busStaff/index1")}
          >
            <View style={styles.iconContainer}>
              <Image
                source={require("../../assets/images/icons8-hospital-94.png")}
                style={styles.input3dIcon}
              />
            </View>
            <Text style={styles.cardText}>Emergency</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card2}
            onPress={() => router.push("/busStaff/index1")}
          >
            <View style={styles.iconContainer}>
              <Image
                source={require("../../assets/images/icons8-help-94.png")}
                style={styles.input3dIcon}
              />
            </View>
            <Text style={styles.cardText}>Help</Text>
          </TouchableOpacity>
        </View>

        {/* ── Footer ───────────────────────────────────────────── */}
        <View style={styles.footerGraphic}>
          <View style={styles.blueCurve} />
          <View style={styles.greenCurve} />
        </View>

      </SafeAreaView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  // ── Header ──────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 70,
    backgroundColor: "#0047AB",
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
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 2,
    borderLeftColor: "#32CD32",
    borderRightColor: "#32CD32",
    borderTopColor: "#32CD32",
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
    backgroundColor: "#ffffff",
    width: "48%",
    height: 100,
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    marginBottom: 15,
    borderLeftWidth: 6,
    borderTopColor: "#32CD32",
    borderTopWidth: 2,
    borderLeftColor: "#32CD32",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  card2: {
    backgroundColor: "#ffffff",
    width: "48%",
    height: 100,
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    marginBottom: 15,
    borderTopColor: "#32CD32",
    borderTopWidth: 2,
    borderRightWidth: 6,
    borderRightColor: "#32CD32",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
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
    fontSize: 17,
    fontWeight: "600",
    color: "#0047AB",
  },

  // ── Footer ────────────────────────────────────────────────────────
  footerGraphic: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 60,
    overflow: "hidden",
  },
  blueCurve: {
    backgroundColor: "#ffffff",
    height: 90,
    width: "120%",
    borderRadius: 100,
    position: "absolute",
  },
  greenCurve: {
    backgroundColor: "#0052cc",
    height: 120,
    width: "100%",
    borderRadius: 30,
    position: "absolute",
  },
});