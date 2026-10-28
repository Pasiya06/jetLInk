import React, { useState, useCallback } from 'react';
import { Stack, useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  StyleSheet,
  View,
  Text,
  TextInput, 
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import BusCard, { BusCardAction } from "../../../components/BusCard";
import { BusStatusNotice, isBusBlocked } from "../../../components/BusStatus";
import SearchPanel from "../../../components/SearchPanel";
import { Alert } from "../../../components/JetAlert";
import { Ionicons, MaterialIcons, FontAwesome, Feather, Fontisto } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AlertBadge from "../../../components/AlertBadge";
import { ScreenHeader, SearchBox, SectionLabel, Pill, EmptyState, GradientButton, C, ui } from "../../../components/JetUI";

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

const BusScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const busType = params.busType as string;
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [busData, setBusData] = useState<Bus[]>([]);
  const [activeTab, setActiveTab] = useState('');
  const [filter, setFilter] = useState<"all" | "online" | "offline" | "alerts">("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  
  const loadBuses = async () => {
    try {
      const response = await fetch(`${API_URL}/buses?busType=${busType}`);

      if (!response.ok) {
        throw new Error("Network issues encountered");
      }

      const data = await response.json();

      const typeOfBuses = data.filter(
        (bus: any) => bus.busType === busType
      );

      setBusData(typeOfBuses);
    } catch (error) {
      console.log("Error details:", error);
      Alert.alert(
        "Couldn't load buses",
        "Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBuses();  
    }, [])
  );

  const handleSearch = () => {
    router.push({
      pathname: "/admin/buses/addBus",
      params: {
        Aid: params.Aid,
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        busType: params.busType,
        busTypeTopic:params.busTypeTopic,
      } 
    });
  };

  

  const deleteBus = async (id: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this bus?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/buses/${id}`, {
                method: "DELETE",
              });

              const result = await response.json();

              if (result.success) {
                Alert.alert("Success", "Bus deleted successfully.");
                loadBuses();
              } else {
                Alert.alert(
                  "Failed",
                  result.message || "Could not complete deletion."
                );
              }
            } catch (error) {
              console.log(error);
              Alert.alert(
                "Error",
                "Server connection failed during deletion handling."
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  
  const isOnlineBus = (b: Bus) => String(b.isOnline) === "true";

  const openProfile = (item: Bus) =>
    router.push({
      pathname: "/admin/buses/busProfile",
      params: {
        Bid: item._id,
        busId: String(item.busId),
        busNumber: item.busNumber,
        busName: item.busName || "",
        noOfSeats: String(item.noOfSeats || ""),
        chassis: item.chassisNo || "",
        engine: item.engineNo || "",
        colour: item.colour || "",
        serviceDate: item.serviceDate || "",
        licenseDate: item.licenseDate || "",
        emissionDate: item.emissionDate || "",
        busType: item.busType || "",
        driverNIC: item.driverNIC,
        conductorNIC: item.conductorNIC,
        driverD: item.driverD,
        conductorD: item.conductorD,
        isOnline: item.isOnline,
        busTypeTopic: params.busTypeTopic,
        Aid: params.Aid,
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
      },
    });

  const openLocation = (item: Bus) =>
    router.push({
      pathname: "/admin/buses/loaction",
      params: {
        Bid: item._id,
        busId: String(item.busId),
        busNum: item.busNumber,
        busName: item.busName || "",
        noOfSeats: String(item.noOfSeats || ""),
        chassis: item.chassisNo || "",
        engine: item.engineNo || "",
        colour: item.colour || "",
        fuel: item.fuelType || "",
        serviceDate: item.serviceDate || "",
        licenseDate: item.licenseDate || "",
        emissionDate: item.emissionDate || "",
        busType: item.busType || "",
        busTypeTopic: params.busTypeTopic,
        Aid: params.Aid,
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
      },
    });

  const renderBusItem = ({ item }: { item: Bus }) => {
    const online = isOnlineBus(item);
    return (
      <BusCard
        bus={item}
        statusLabel={online ? "Online" : "Offline"}
        tone={online ? "green" : "grey"}
        onPress={() => openProfile(item)}
        blockedNote="Passengers can't book this bus until the emergency is resolved."
        footer={
          <>
            <View style={styles.crew}>
              <Ionicons name="people-outline" size={15} color={C.muted} />
              <Text style={styles.crewText} numberOfLines={1}>
                {crewText(item)}
              </Text>
            </View>
            <BusCardAction
              icon="location-outline"
              label="Track"
              tone="green"
              onPress={() => openLocation(item)}
              accessibilityLabel={`Show location of ${item.busName || item.busNumber}`}
            />
            <BusCardAction
              icon="trash-outline"
              tone="red"
              onPress={() => deleteBus(item._id)}
              accessibilityLabel={`Delete ${item.busName || item.busNumber}`}
            />
          </>
        }
      />
    );
  };

  const q = searchQuery.trim().toLowerCase();
  const searchedBuses = busData.filter(bus =>
    bus.busNumber.toLowerCase().includes(q) ||
    (bus.busName || "").toLowerCase().includes(q)
  );
  const counts = {
    all: busData.length,
    online: busData.filter(isOnlineBus).length,
    alerts: busData.filter((b) => isBusBlocked(b)).length,
  };
  const filteredBusData = searchedBuses.filter((b) =>
    filter === "online" ? isOnlineBus(b) :
    filter === "offline" ? !isOnlineBus(b) :
    filter === "alerts" ? isBusBlocked(b) : true
  );

  const FILTERS: { key: typeof filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "online", label: "Online" },
    { key: "offline", label: "Offline" },
    { key: "alerts", label: "Alerts" },
  ];

  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <ScreenHeader eyebrow="Fleet management" title={String(params.busTypeTopic || "Buses")} />

        <View style={[ui.body, { paddingHorizontal: 16 }]}>
          {/* Fleet overview */}
          <View style={[ui.card, styles.stats]}>
            <Stat value={counts.all} label="Total buses" icon="bus" color={C.blue} bg={C.blueSoft} />
            <View style={styles.statDivider} />
            <Stat value={counts.online} label="Online now" icon="radio-outline" color={C.green} bg={C.greenSoft} />
            <View style={styles.statDivider} />
            <Stat value={counts.alerts} label="Alerts" icon="warning-outline" color={counts.alerts ? C.red : C.muted} bg={counts.alerts ? C.redSoft : "#EEF2F7"} />
          </View>

          <View style={{ marginTop: 14 }}>
            <SearchBox value={searchQuery} onChangeText={setSearchQuery} placeholder="Search by bus name or number" />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsScroll}
            contentContainerStyle={styles.chips}
          >
            {FILTERS.map((f) => {
              const active = filter === f.key;
              const n = f.key === "offline" ? counts.all - counts.online : counts[f.key as "all" | "online" | "alerts"];
              return (
                <TouchableOpacity
                  key={f.key}
                  onPress={() => setFilter(f.key)}
                  activeOpacity={0.85}
                  style={[styles.chip, active && styles.chipActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
                  <View style={[styles.chipCount, active && styles.chipCountActive]}>
                    <Text style={[styles.chipCountText, active && { color: "#FFFFFF" }]}>{n}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <FlatList
            style={{ flex: 1 }}
            data={filteredBusData}
            renderItem={renderBusItem}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 4, paddingBottom: 250 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await loadBuses(); setRefreshing(false); }} tintColor={C.blue} colors={[C.blue]} />
            }
            ListEmptyComponent={
              loading ? (
                <ActivityIndicator size="large" color={C.blue} style={{ marginTop: 40 }} />
              ) : (
                <EmptyState
                  icon={<Fontisto name="bus" size={26} color={C.amber} />}
                  title={busData.length ? "No matching buses" : "No buses yet"}
                  subtitle={busData.length ? "Try another search or filter." : "Tap Add bus to register one."}
                />
              )
            }
          />
        </View>

        <GradientButton label="Add bus" icon="add" onPress={handleSearch} style={styles.addButton} />

        <SearchPanel
          visible={isSearching}
          query={searchQuery}
          onChangeQuery={setSearchQuery}
          onClose={() => { setIsSearching(false); setSearchQuery(""); }}
          role={"admin"}
          params={params}
          listLabel="buses"
        />
        

        <View style={styles.bottomNav}>

          

          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("home"); if (isSearching) {
                  setIsSearching(false); setSearchQuery(""); 
                }

                else {
                  router.push({
                    pathname: "/admin/buses/busType",
                    params: {
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

// Driver / conductor shown in the card footer
const crewText = (b: Bus) => {
  const loggedIn = (v?: string) => !!v && !/not\s*login/i.test(v);
  const names = [b.driverD, b.conductorD].filter(loggedIn);
  return names.length ? names.join(" · ") : "No crew logged in";
};

function Stat({
  value,
  label,
  icon,
  color,
  bg,
}: {
  value: number;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  bg: string;
}) {
  return (
    <View style={styles.stat}>
      <View style={[styles.statIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={17} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: "row", alignItems: "center", paddingVertical: 16, paddingHorizontal: 8 },
  stat: { flex: 1, alignItems: "center" },
  statIcon: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: "800", color: C.ink },
  statLabel: { fontSize: 12, fontWeight: "600", color: C.muted, marginTop: 1 },
  statDivider: { width: 1, alignSelf: "stretch", backgroundColor: C.line, marginVertical: 6 },

  chipsScroll: { flexGrow: 0, marginTop: 14, marginBottom: 10 },
  chips: { gap: 8, paddingRight: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    height: 38,
    paddingLeft: 14,
    paddingRight: 8,
    borderRadius: 19,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  chipActive: { backgroundColor: C.navy, borderColor: C.navy },
  chipText: { fontSize: 13.5, fontWeight: "700", color: C.ink },
  chipTextActive: { color: "#FFFFFF" },
  chipCount: { minWidth: 24, height: 22, borderRadius: 11, paddingHorizontal: 7, backgroundColor: "#EEF2F7", alignItems: "center", justifyContent: "center" },
  chipCountActive: { backgroundColor: "rgba(255,255,255,0.2)" },
  chipCountText: { fontSize: 12, fontWeight: "800", color: C.muted },

  crew: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6, marginRight: 4 },
  crewText: { flex: 1, fontSize: 12.5, fontWeight: "600", color: C.muted },

  container:{
    flex:1,
    backgroundColor:C.bg
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
    width: '100%',
    flex: 1,
    maxHeight: '60%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 55,
    borderTopRightRadius: 55,
    marginTop: -50,   
    alignSelf: 'center',
    
  },

  cardtitle:{
    marginTop:10,
    fontSize: 20,
    fontWeight: '800',
    color: '#999797',
    letterSpacing: 0.5,
  },

  svw: {
    width: '100%',
    
    //marginBottom:80,
    marginTop: 10, 
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25, 
  },
 
  friendRow: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: 10,
    borderRadius: 18,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#0F1B2D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },

  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.amberSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },

  friendName: {
    fontSize: 16,
    color: C.ink,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  friendSub: { fontSize: 12, color: C.muted, fontWeight: '500', marginTop: 1 },

  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: C.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#FDF1F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: { position: 'absolute', left: 20, right: 20, bottom: 165 },

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

export default BusScreen;