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
} from 'react-native';
import { ScreenHeader, IconBox, Pill, EmptyState, NAV_SPACE, C, ui } from "../../../components/JetUI";
import SearchPanel from "../../../components/SearchPanel";
import { Alert } from "../../../components/JetAlert";
import { Ionicons, MaterialIcons, FontAwesome, Feather, Fontisto } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AlertBadge from "../../../components/AlertBadge";

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
}

const BusScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const busType = params.busType as string;
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [busData, setBusData] = useState<Bus[]>([]);
  const [activeTab, setActiveTab] = useState('');
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
      "Network Error",
      "Unable to load data elements from database server context."
    );
  }
};

  useFocusEffect(
    useCallback(() => {
      loadBuses();
    }, [])
  );


  
  
  const renderBusItem = ({ item }: { item: Bus }) => (
    <TouchableOpacity style={[ui.card, styles.busRow]} activeOpacity={0.85}
      onPress={() =>
        router.push({
          pathname: "/admin/buses/addSchedule",
          params: {
            Bid: item._id, 
            busId: String(item.busId),
            busNumber: item.busNumber,
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


            busTypeTopic:params.busTypeTopic,
            
            Aid: params.Aid,
            firstName: params.firstName,
            lastName: params.lastName,
            email: params.email,
          },
        })
      }
    >
      
      <View style={styles.busRowIcon}>
        <Fontisto name="bus" size={20} color={C.blue} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.busRowTitle}>{item.busName || item.busNumber}</Text>
        <Text style={styles.busRowSub}>
          {item.busName ? `${item.busNumber}  •  ` : ""}
          {item.noOfSeats ? `${item.noOfSeats} seats  •  ` : ""}Tap to add a schedule
        </Text>
      </View>
      <View style={styles.rowArrow}>
        <Ionicons name="add" size={20} color={C.blue} />
      </View>
    </TouchableOpacity>
  );

  const filteredBusData = busData.filter(bus =>
    bus.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (bus.busName || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
        <ScreenHeader eyebrow={`${params.busTypeTopic || ""} schedules`.trim()} title="Choose a bus" />

        <View style={styles.listWrap}>
          <View style={[ui.card, styles.introCard]}>
            <IconBox bg={C.purpleSoft} size={44}>
              <Ionicons name="calendar-outline" size={22} color={C.purple} />
            </IconBox>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={ui.rowTitle}>New schedule</Text>
              <Text style={ui.rowSub}>Pick the bus that will run this trip</Text>
            </View>
            <Pill text={`${filteredBusData.length} ${filteredBusData.length === 1 ? "bus" : "buses"}`} />
          </View>

          <FlatList
            style={{ flex: 1 }}
            data={filteredBusData}
            renderItem={renderBusItem}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: NAV_SPACE }}
            ListEmptyComponent={
              <EmptyState
                icon={<Ionicons name="bus-outline" size={28} color={C.amber} />}
                title={searchQuery ? "No matching buses" : "No buses yet"}
                subtitle={searchQuery ? "Try another bus number." : "Add a bus first, then create its schedule."}
              />
            }
          />
        </View>


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
                    pathname: "/admin/buses/showShedule",
                    params: {
                      Aid: params.Aid,
                      firstName: params.firstName,
                      lastName: params.lastName,
                      email: params.email,
                      busType: params.busType ,
                      busTypeTopic:params.busTypeTopic,
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
  busRow: { flexDirection: "row", alignItems: "center", padding: 14, marginBottom: 10 },
  busRowIcon: { width: 48, height: 48, borderRadius: 15, backgroundColor: "#EAF1FB", alignItems: "center", justifyContent: "center" },
  busRowTitle: { fontSize: 17, fontWeight: "800", color: "#0F1B2D", letterSpacing: 0.3 },
  busRowSub: { fontSize: 12.5, color: "#5B6B7F", fontWeight: "600", marginTop: 2 },
  rowArrow: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#EAF1FB", alignItems: "center", justifyContent: "center" },
  listWrap: { flex: 1, marginTop: -64, paddingHorizontal: 16 },
  introCard: { flexDirection: "row", alignItems: "center", padding: 16, marginBottom: 12 },
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
    width: '100%',
    flex: 1,
    maxHeight: '70%',
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

  iconButton: { 
    marginRight: 10 
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