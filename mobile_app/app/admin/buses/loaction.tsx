// app/passenger/track/[busNumber].tsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Animated,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialIcons, Feather, FontAwesome } from "@expo/vector-icons";

// ─── Types ────────────────────────────────────────────────────────
interface BusLocationData {
  busId?: number;
  busNumber: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  isOnline: boolean;
  driverNIC?: string;
  conductorNIC?: string;
  updatedAt?: string;
}

const PassengerTrackScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mapRef = useRef<MapView>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const busNumber = params.busNum as string;
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const [bus, setBus] = useState<BusLocationData | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("--");
  const [routePath, setRoutePath] = useState<
    Array<{ latitude: number; longitude: number }>
  >([]);

  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState('');

  const defaultRegion = {
    latitude: 6.9271,
    longitude: 79.8612,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // ─── Pulse animation for live dot ───────────────────────────────
  useEffect(() => {
    if (!isOnline) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.6, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isOnline]);

  // ─── Fetch bus location ──────────────────────────────────────────
  const fetchBusLocation = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_URL}/locations/${encodeURIComponent(busNumber)}`
      );
      const result = await response.json();

      if (result.success && result.data) {
        const data: BusLocationData = result.data;
        setBus(data);
        setIsOnline(data.isOnline);
        setLastUpdated(new Date().toLocaleTimeString());
        setIsLoading(false);

        if (data.isOnline && data.latitude && data.longitude) {
          setRoutePath((prev) => [
            ...prev.slice(-50),
            { latitude: data.latitude, longitude: data.longitude },
          ]);

          mapRef.current?.animateToRegion(
            {
              latitude: data.latitude,
              longitude: data.longitude,
              latitudeDelta: 0.015,
              longitudeDelta: 0.015,
            },
            800
          );
        }
      } else {
        setIsLoading(false);
        setIsOnline(false);
      }
    } catch (error) {
      console.error("Fetch location error:", error);
      setIsLoading(false);
    }
  }, [busNumber, API_URL]);

  // ─── Poll every 5 seconds ────────────────────────────────────────
  useEffect(() => {
    fetchBusLocation();
    intervalRef.current = setInterval(() => {
      fetchBusLocation();
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchBusLocation]);

  const centerOnBus = () => {
    if (bus?.latitude) {
      mapRef.current?.animateToRegion(
        {
          latitude: bus.latitude,
          longitude: bus.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        800
      );
    }
  };

  const callNumber = (number?: string) => {
    if (number) Linking.openURL(`tel:${number}`);
  };

  const renderBusMarker = () => {
    if (!bus?.latitude || !isOnline) return null;

    return (
      <Marker
        coordinate={{
          latitude: bus.latitude,
          longitude: bus.longitude,
        }}
        title={`Bus ${busNumber}`}
        description={`Speed: ${bus.speed?.toFixed(1) ?? 0} km/h`}
        rotation={bus.heading || 0}
        anchor={{ x: 0.5, y: 0.5 }}
      >
        <View style={styles.busMarkerRing}>
          <View style={styles.busMarker}>
            <MaterialIcons
              name="directions-bus"
              size={22}
              color="#fff"
            />
          </View>
        </View>
      </Marker>
    );
  };

  const renderRoute = () => {
    if (routePath.length <= 1) return null;

    return (
      <Polyline
        coordinates={routePath}
        strokeColor="#2F80ED"
        strokeWidth={4}
        lineDashPattern={[1]}
      />
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>

        {/* ── Gradient Header ─────────────────────────────────── */}
        <LinearGradient
          colors={["#173C79","#155B8A","#159B79",]}
          start={{x: 0, y: 0,}}
          end={{x: 1, y: 1,}}
          style={styles.header}
        >
          

          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Bus {busNumber}</Text>
            <View style={styles.statusPillStyle}>
              <View style={styles.dotWrap}>
                {isOnline && (
                  <Animated.View
                    style={[
                      styles.pulseDot,
                      {
                        transform: [{ scale: pulseAnim }],
                        opacity: pulseAnim.interpolate({
                          inputRange: [1, 1.6],
                          outputRange: [0.6, 0],
                        }),
                      },
                    ]}
                  />
                )}
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: isOnline ? "#32CD32" : "#FF6B6B" },
                  ]}
                />
              </View>
              <Text style={styles.statusText}>
                {isOnline ? "Live Tracking" : "Currently Offline"}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Map ─────────────────────────────────────────────── */}
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#0047AB" />
            <Text style={styles.loadingText}>Locating your bus...</Text>
          </View>
        ) : (
          <MapView

            ref={mapRef}

            style={styles.map}

            provider={PROVIDER_GOOGLE}

            initialRegion={

              bus?.latitude

                ? {

                    latitude: bus.latitude,

                    longitude: bus.longitude,

                    latitudeDelta: 0.02,

                    longitudeDelta: 0.02,

                  }

                : defaultRegion

            }

            showsCompass

            showsUserLocation

            showsScale

            

          >

            {renderRoute()}
            {renderBusMarker()}

           
            

          </MapView>
        
        )}

        
        {/* ── Floating Locate Button ────────────────────────────── */}
        <TouchableOpacity style={styles.floatBtn} onPress={centerOnBus}>
          <LinearGradient colors={["#2F80ED", "#0047AB"]} style={styles.floatBtnGradient}>
            <MaterialIcons name="my-location" size={22} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        

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

          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("routes"); router.push("/admin/index1"); }}>
            <Ionicons name="notifications-outline" size={24} color={activeTab === "alerts" ? "#0057D9" : "#8A8A8A"} />
            <Text style={[styles.label1, activeTab === "alerts" && styles.activeLabel]}>
              Alerts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("profile"); router.push("/admin/index1"); }}>
            <Feather name="user" size={24} color={activeTab === "profile" ? "#0057D9" : "#8A8A8A"} />
            <Text style={[styles.label1, activeTab === "profile" && styles.activeLabel]}>
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

// ─── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 8,
    shadowColor: "#0047AB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
  },
  statusPillStyle: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.16)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  dotWrap: {
    width: 10,
    height: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  pulseDot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#32CD32",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
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
    fontWeight: "500",
  },
  busMarkerRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(47,128,237,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  busMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0047AB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    elevation: 6,
  },
  infoPanel: {
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    elevation: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0E0",
    alignSelf: "center",
    marginBottom: 14,
  },
  infoRowSplit: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFBFF",
    borderRadius: 14,
    padding: 10,
    width: "48%",
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  statLabel: {
    fontSize: 11,
    color: "#999",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222",
  },
  offlineBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0F0",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  offlineText: {
    fontSize: 13,
    color: "#FF6B6B",
    marginLeft: 8,
    fontWeight: "500",
    flex: 1,
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFBFF",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    width: "48%",
  },
  contactLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  floatBtn: {
    position: "absolute",
    bottom: 180,
    right: 18,
  },
  floatBtnGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#0047AB",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },

  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 55,
    gap: 8,
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

export default PassengerTrackScreen;