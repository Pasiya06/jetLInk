import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Feather, Ionicons, FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TourPackageCard, { TourPackage, packageTitle } from "../../../components/TourPackageCard";
import PickupTownPicker from "../../../components/PickupTownPicker";
import { packageFitsPickup, roadDistanceKm } from "../../../utils/sriLankaTowns";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const PICKUP_KEY = "@jetlink_pickup_town";

export default function PackagesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [pickupTown, setPickupTown] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Remember the passenger's pickup town on this phone
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(PICKUP_KEY);
        if (saved) setPickupTown(saved);
      } catch {}
    })();
  }, []);

  const choosePickup = async (town: string | null) => {
    setPickupTown(town);
    setPickerOpen(false);
    try {
      if (town) await AsyncStorage.setItem(PICKUP_KEY, town);
      else await AsyncStorage.removeItem(PICKUP_KEY);
    } catch {}
  };

  const getPackages = useCallback(async () => {
    try {
      if (!API_URL) throw new Error("EXPO_PUBLIC_API_URL is not configured.");
      const response = await fetch(`${API_URL}/packages`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load packages");
      }
      setPackages(Array.isArray(data.data) ? data.data : []);
    } catch (error: any) {
      console.log("Get Packages Error:", error);
      Alert.alert("Error", error.message || "Could not load packages");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    getPackages();
  }, [getPackages]);

  const goToPackageDetails = (item: TourPackage) => {
    router.push({
      pathname: "/passenger/tours/PackageDetails",
      params: {
        packageId: item._id,
        title: packageTitle(item),
        destination: item.destination ?? "",
        busType: item.busType ?? "",
        description: item.description,
        packageType: item.packageType,
        totalDistance: item.totalDistance,
        tripDuration: item.tripDuration,
        maxPassengers: item.maxPassengers,
        maxPrice: item.maxPrice,
        pickupTown: pickupTown ?? "",
        Pid: params.Pid,
        Pid1: params.Pid1,
        pfirstName: params.pfirstName,
        plastName:params.plastName,
        pphoneNumber: params.pphoneNumber,
        pemail: params.pemail,
      },
    });
  };

  // Filter by pickup town + search, then group by destination
  const sections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = packages.filter((p) => {
      if (!packageFitsPickup(p, pickupTown)) return false;
      if (!q) return true;
      return [packageTitle(p), p.destination, p.packageType, p.description, p.busType]
        .some((v) => v?.toLowerCase().includes(q));
    });

    const groups = new Map<string, TourPackage[]>();
    list.forEach((p) => {
      const key = p.destination?.trim() || "Other tours";
      groups.set(key, [...(groups.get(key) ?? []), p]);
    });

    return Array.from(groups.entries())
      .map(([title, data]) => ({
        title,
        data: data.sort((a, b) => (a.maxPrice || 0) - (b.maxPrice || 0)),
      }))
      .sort((a, b) => (a.title === "Other tours" ? 1 : b.title === "Other tours" ? -1 : a.title.localeCompare(b.title)));
  }, [packages, pickupTown, searchQuery]);

  const total = sections.reduce((n, s) => n + s.data.length, 0);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: "", headerShown: false }} />
        <View style={styles.loadingContainer}>
          <StatusBar barStyle="light-content" />
          <ActivityIndicator size="large" color="#12966F" />
          <Text style={styles.loadingText}>Loading packages...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#173C79" />

        <LinearGradient
          colors={["#173C79","#155B8A","#159B79",]}
            start={{x: 0, y: 0,}}
            end={{x: 1, y: 1,}}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Tour Packages</Text>

          {/* Pickup town selector */}
          {/* <TouchableOpacity style={styles.pickupBtn} activeOpacity={0.85} onPress={() => setPickerOpen(true)}>
            <View style={styles.pickupIcon}>
              <Ionicons name="location" size={18} color="#12966F" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pickupLabel}>Pickup town</Text>
              <Text style={[styles.pickupValue, !pickupTown && { color: "#94A3B8" }]}>
                {pickupTown ?? "Select your town"}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#64748B" />
          </TouchableOpacity> */}
        </LinearGradient>

        <SectionList
          sections={sections}
          keyExtractor={(item) => item._id}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); getPackages(); }}
          
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionTitle}>
              {section.title}
              <Text style={styles.sectionCount}>  ·  {section.data.length} package{section.data.length === 1 ? "" : "s"}</Text>
            </Text>
          )}
          renderItem={({ item }) => (
            <TourPackageCard
              pkg={item}
              pickupTown={pickupTown}
              pickupKm={pickupTown ? roadDistanceKm(pickupTown, item.destination) : null}
              onPress={() => goToPackageDetails(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="map-outline" size={54} color="#98A2B3" />
              <Text style={styles.emptyTitle}>
                {searchQuery ? "No matching packages" : pickupTown ? `No packages from ${pickupTown}` : "No packages yet"}
              </Text>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? "Try another search term."
                  : pickupTown
                  ? "Try a different pickup town."
                  : "New tour packages will appear here."}
              </Text>
              {pickupTown && !searchQuery ? (
                <TouchableOpacity onPress={() => choosePickup(null)} style={styles.showAllBtn}>
                  <Text style={styles.showAllText}>Show all packages</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          }
        />

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
                    pathname: "/passenger/tours/index1",
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
        

        <PickupTownPicker
          visible={pickerOpen}
          selected={pickupTown}
          allowClear
          onSelect={choosePickup}
          onClose={() => setPickerOpen(false)}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F5F8" },
  loadingContainer: { flex: 1, backgroundColor: "#F2F5F8", justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "#667085", fontSize: 14 },

  header: {
    paddingTop: 54,
    paddingBottom: 22,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: { fontSize: 25, fontWeight: "800", color: "#FFFFFF", textAlign: "center", marginBottom: 16 },
  pickupBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pickupIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8F7F2",
    alignItems: "center",
    justifyContent: "center",
  },
  pickupLabel: { fontSize: 11, color: "#64748B", fontWeight: "600" },
  pickupValue: { fontSize: 15, color: "#182B45", fontWeight: "700" },

  listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 245 },
  infoBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#E6EEF9",
    borderRadius: 18,
    padding: 16,
    marginBottom: 6,
  },
  infoText: { flex: 1, color: "#173C79", fontSize: 14, lineHeight: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#182B45", marginTop: 16, marginBottom: 12 },
  sectionCount: { fontSize: 16, fontWeight: "500", color: "#64748B" },

  emptyContainer: { alignItems: "center", paddingHorizontal: 24, marginTop: 40 },
  emptyTitle: { marginTop: 14, fontSize: 18, fontWeight: "800", color: "#344054", textAlign: "center" },
  emptyText: { marginTop: 6, fontSize: 13, color: "#98A2B3", textAlign: "center", lineHeight: 19 },
  showAllBtn: { marginTop: 14, backgroundColor: "#12966F", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20 },
  showAllText: { color: "#fff", fontWeight: "700" },

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
