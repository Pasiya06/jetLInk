// app/admin/buses/location.tsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialIcons, FontAwesome, Feather } from "@expo/vector-icons";

// ─── Types ────────────────────────────────────────────────────────
interface BusLocationData {
  _id: string;
  busNama: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  isOnline: boolean;
  updatedAt: string;
}

interface WeatherInfo {
  temp: number;
  description: string;
  main: string;
  city: string;
}

const AdminMapScreen: React.FC = () => {
  const router  = useRouter();
  const params  = useLocalSearchParams();
  const mapRef  = useRef<MapView>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Params from bus list screen ────────────────────────────────
  const busNum  = params.busNum as string;   // bus number
  const busId   = params.Bid as string;
  const Aid     = params.Aid as string;
  const firstName = params.firstName as string;
  const lastName  = params.lastName as string;
  const email     = params.email as string;
  const [activeTab, setActiveTab] = useState('');

  const API_URL     = process.env.EXPO_PUBLIC_API_URL;
  const WEATHER_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;

  // ─── State ──────────────────────────────────────────────────────
  const [busLocation, setBusLocation]   = useState<BusLocationData | null>(null);
  const [isOnline, setIsOnline]         = useState(false);
  const [isLoading, setIsLoading]       = useState(true);
  const [locationName, setLocationName] = useState("Fetching location...");
  const [weather, setWeather]           = useState<WeatherInfo | null>(null);
  const [lastUpdated, setLastUpdated]   = useState("--");
  const [routePath, setRoutePath]       = useState<
    Array<{ latitude: number; longitude: number }>
  >([]);

  // ─── Default Region (Sri Lanka) ──────────────────────────────────
  const defaultRegion = {
    latitude: 6.9271,
    longitude: 79.8612,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // ─── Fetch Bus Location from Backend ────────────────────────────
  const fetchBusLocation = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/locations/${encodeURIComponent(busNum)}`
      );
      const result = await response.json();

      if (result.success && result.data) {
        const data: BusLocationData = result.data;
        setBusLocation(data);
        setIsOnline(data.isOnline);
        setLastUpdated(new Date(data.updatedAt).toLocaleTimeString());
        setIsLoading(false);

        if (data.isOnline && data.latitude && data.longitude) {
          // Add to route trail
          setRoutePath((prev) => [
            ...prev.slice(-50),
            { latitude: data.latitude, longitude: data.longitude },
          ]);

          // Animate map to bus location
          mapRef.current?.animateToRegion(
            {
              latitude: data.latitude,
              longitude: data.longitude,
              latitudeDelta: 0.015,
              longitudeDelta: 0.015,
            },
            800
          );

          // Fetch place name and weather
          fetchLocationName(data.latitude, data.longitude);
          fetchWeather(data.latitude, data.longitude);
        }
      } else {
        setIsLoading(false);
        setIsOnline(false);
      }
    } catch (error) {
      console.error("Fetch location error:", error);
      setIsLoading(false);
    }
  }, [busNum, API_URL]);

  // ─── Fetch Location Name (OpenWeather Reverse Geocode) ──────────
  const fetchLocationName = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `http://api.openweathermap.org/geo/1.0/reverse` +
          `?lat=${lat}&lon=${lng}&limit=1&appid=${WEATHER_KEY}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const p = data[0];
        setLocationName(
          `${p.name}${p.state ? ", " + p.state : ""}, ${p.country}`
        );
      } else {
        setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } catch {
      setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  // ─── Fetch Weather at Bus Location ──────────────────────────────
  const fetchWeather = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather` +
          `?lat=${lat}&lon=${lng}&appid=${WEATHER_KEY}&units=metric`
      );
      const data = await res.json();
      if (data?.main) {
        setWeather({
          temp: Math.round(data.main.temp),
          description: data.weather[0].description,
          main: data.weather[0].main,
          city: data.name,
        });
      }
    } catch {
      console.log("Weather fetch failed");
    }
  };

  // ─── Poll location every 5 seconds ──────────────────────────────
  useEffect(() => {
    fetchBusLocation(); // fetch immediately on mount

    intervalRef.current = setInterval(() => {
      fetchBusLocation();
    }, 5000); // poll every 5 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchBusLocation]);

  // ─── Center Map on Bus ───────────────────────────────────────────
  const centerOnBus = () => {
    if (busLocation && busLocation.latitude) {
      mapRef.current?.animateToRegion(
        {
          latitude: busLocation.latitude,
          longitude: busLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        800
      );
    } else {
      Alert.alert("No Location", "Bus location is not available yet.");
    }
  };

  // ─── Weather Emoji ───────────────────────────────────────────────
  const weatherEmoji = (main: string): string => {
    const map: Record<string, string> = {
      Clear: "☀️", Clouds: "☁️", Rain: "🌧️",
      Drizzle: "🌦️", Thunderstorm: "⛈️",
      Snow: "❄️", Mist: "🌫️", Fog: "🌫️",
    };
    return map[main] || "🌡️";
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>

        {/* ── Header ──────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Bus {busNum}</Text>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isOnline ? "#32CD32" : "#FF4444" },
                ]}
              />
              <Text style={styles.statusText}>
                {isOnline ? "🔴 Live Tracking" : "⚫ Bus Offline"}
              </Text>
            </View>
          </View>

          {/* Refresh indicator */}
          <MaterialIcons
            name="refresh"
            size={22}
            color="rgba(255,255,255,0.7)"
          />
        </View>

        {/* ── Map ─────────────────────────────────────────────── */}
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#0047AB" />
            <Text style={styles.loadingText}>
              Loading bus location...
            </Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={
              busLocation?.latitude
                ? {
                    latitude: busLocation.latitude,
                    longitude: busLocation.longitude,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                  }
                : defaultRegion
            }
            showsCompass
            showsScale
            showsTraffic={false}
          >
            {/* ── Route Trail ────────────────────────────────── */}
            {routePath.length > 1 && (
              <Polyline
                coordinates={routePath}
                strokeColor="#0047AB"
                strokeWidth={3}
                lineDashPattern={[6, 3]}
              />
            )}

            {/* ── Bus Marker ─────────────────────────────────── */}
            {busLocation && busLocation.latitude && isOnline && (
              <Marker
                coordinate={{
                  latitude: busLocation.latitude,
                  longitude: busLocation.longitude,
                }}
                title={`Bus ${busNum}`}
                description={`Speed: ${busLocation.speed?.toFixed(1) ?? 0} km/h`}
                rotation={busLocation.heading || 0}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={styles.busMarker}>
                  <MaterialIcons
                    name="directions-bus"
                    size={28}
                    color="#fff"
                  />
                </View>
              </Marker>
            )}
          </MapView>
        )}

        {/* ── Info Panel ──────────────────────────────────────── */}
        <View style={styles.infoPanel}>

          {/* Location Name */}
          <View style={styles.infoRow}>
            <MaterialIcons name="location-on" size={18} color="#0047AB" />
            <Text style={styles.infoText} numberOfLines={1}>
              {isOnline ? locationName : "Bus is not sharing location"}
            </Text>
          </View>

          {/* Speed + Last Updated */}
          <View style={styles.infoRowSplit}>
            <View style={styles.infoRow}>
              <MaterialIcons name="speed" size={18} color="#0047AB" />
              <Text style={styles.infoText}>
                {busLocation && isOnline
                  ? `${busLocation.speed?.toFixed(1) ?? 0} km/h`
                  : "-- km/h"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="access-time" size={18} color="#0047AB" />
              <Text style={styles.infoText}>{lastUpdated}</Text>
            </View>
          </View>

          {/* Weather */}
          {weather && isOnline && (
            <View style={styles.weatherRow}>
              <Text style={styles.weatherTemp}>
                {weatherEmoji(weather.main)} {weather.temp}°C
              </Text>
              <Text style={styles.weatherDesc}>{weather.description}</Text>
            </View>
          )}

          {/* Offline message */}
          {!isOnline && !isLoading && (
            <View style={styles.offlineBox}>
              <MaterialIcons name="location-off" size={16} color="#FF4444" />
              <Text style={styles.offlineText}>
                Waiting for driver to turn on GPS...
              </Text>
            </View>
          )}
        </View>

        {/* ── Bottom Navigation ────────────────────────────────── */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              setActiveTab("back");
              router.push({
                pathname: "/admin/buses/index2",
                params: { Aid, firstName, lastName, email },
              });
            }}
          >
            <Ionicons
              name="arrow-back-outline"
              size={24}
              color={activeTab === "back" ? "#0057D9" : "#8A8A8A"}
            />
            <Text style={[styles.navLabel,
              activeTab === "back" && styles.activeLbl]}>
              Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={centerOnBus}
          >
            <MaterialIcons
              name="my-location"
              size={24}
              color="#8A8A8A"
            />
            <Text style={styles.navLabel}>Center</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.centerButton}
            onPress={() => router.push("/admin/index1")}
          >
            <Ionicons name="home-outline" size={28} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/admin/index1")}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color="#8A8A8A"
            />
            <Text style={styles.navLabel}>Alerts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/admin/index1")}
          >
            <Feather name="user" size={24} color="#8A8A8A" />
            <Text style={styles.navLabel}>Profile</Text>
          </TouchableOpacity>
        </View>

        {/* ── Center Button (floating) ─────────────────────────── */}
        <TouchableOpacity style={styles.floatBtn} onPress={centerOnBus}>
          <MaterialIcons name="my-location" size={26} color="#fff" />
        </TouchableOpacity>

      </SafeAreaView>
    </>
  );
};

// ─── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0047AB",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 18,
  },
  backBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
  },
  map: {
    flex: 1,
  },
  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#0047AB",
  },
  busMarker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#0047AB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#32CD32",
    elevation: 6,
  },
  infoPanel: {
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 100, // leave space for bottom nav
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  infoRowSplit: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  weatherRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f4ff",
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
  },
  weatherTemp: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0047AB",
    marginRight: 10,
  },
  weatherDesc: {
    fontSize: 13,
    color: "#555",
    textTransform: "capitalize",
  },
  offlineBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff0f0",
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  offlineText: {
    fontSize: 13,
    color: "#FF4444",
    marginLeft: 8,
  },
  bottomNav: {
    position: "absolute",
    bottom: 15,
    left: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    height: 75,
    backgroundColor: "#fff",
    borderRadius: 25,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  navLabel: {
    marginTop: 4,
    fontSize: 13,
    color: "#8A8A8A",
  },
  activeLbl: {
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
    elevation: 12,
  },
  floatBtn: {
    position: "absolute",
    bottom: 110,
    right: 18,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#0047AB",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
});

export default AdminMapScreen;