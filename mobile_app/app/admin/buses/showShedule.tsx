import React, { useEffect, useState } from "react";
import { Stack, useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import { getSchedules, deleteSchedule } from "../../../services/scheduleServices";
import {
  StyleSheet,
  View,
  Text,
  TextInput, 
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { ScreenHeader, IconBox, Pill, EmptyState, GradientButton, NAV_SPACE, C, ui } from "../../../components/JetUI";
import { BusStatusNotice } from "../../../components/BusStatus";
import SearchPanel, { filterBySearch } from "../../../components/SearchPanel";
import { Alert } from "../../../components/JetAlert";
import {Ionicons, 
  MaterialCommunityIcons, 
  Fontisto, 
  FontAwesome6, 
  MaterialIcons, 
  FontAwesome5, 
  FontAwesome, Feather} from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AlertBadge from "../../../components/AlertBadge";
import { useBusNames } from "../../../components/BusName";


interface Bussched {
  _id:string;
  scheduleId:string;
  busdate:string;
  pickuploca?:string;
  dropoffloca?:string;
  arrivaltime?:string;
  depaturetime?:string;
  stops?:string;
  busNo?:string;
  busName?: string;
  noOfSeats?: string;
  ticketPrice:string;
  busStatus?:string;
  busEmergency?:boolean;
  busEmergencyAt?:string;
}

const BusScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { busLabel } = useBusNames();
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState('');
  const [busschedData, setBusschedData] = useState<Bussched[]>([]);
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const loadschedBuses = async () => {
    try {
      const response = await fetch(`${API_URL}/schedules`);
      const data = await response.json();
  
      if (data.success) {
        const filteredSchedules = data.data.filter(
          (schedule: any) => schedule.busType === params.busType
        );
  
        setBusschedData(filteredSchedules);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // const getSchedules = async () => {
  //   try {
  //     const response = await fetch(`${API_URL}/schedules`);

  //     const data = await response.json();

  //     if (data.success) {
  //       setBusschedData(data.data);
  //     } else {
  //       alert(data.message);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     alert("Failed to load schedules");
  //   } finally {
  //     //setLoading(false);
  //   }
  // };

  useEffect(() => {
    loadschedBuses();
  }, []);

  

  const handleSearch = () => {
    router.push({
      pathname:"/admin/buses/selectBus",
      params: {
        busType: params.busType ,
        busTypeTopic:params.busTypeTopic,
        Aid: params.Aid,
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        }, 
    });
  };

  const confirmDelete = (item: Bussched) => {
    Alert.alert(
      "Delete schedule?",
      `${item.pickuploca} → ${item.dropoffloca} at ${item.depaturetime} (bus ${item.busName ? `${item.busName} - ` : ""}${item.busNo}) will be removed.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteBussched(item._id) },
      ]
    );
  };

  const deleteBussched = async (id: string) => {
  try {

    const result = await deleteSchedule(id);

    if (result.success) {

      Alert.alert("Schedule deleted", "The schedule was deleted successfully.");

      loadschedBuses();

    } else {

      Alert.alert("Delete failed", String(result.message || "The schedule couldn't be deleted. Please try again."));

    }

  } catch (error) {

    console.log(error);

  }
};
  


  const renderBusItem = ({item}:{item:Bussched}) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => 
        router.push({
          pathname: "/admin/buses/updateBusSchedule",
          params: {
            Sid: item._id,
            scheduleId: item.scheduleId,
            busdate: item.busdate,
            pickuploca: item.pickuploca ,
            dropoffloca: item.dropoffloca ,
            arrivaltime: item.arrivaltime ,
            depaturetime: item.depaturetime ,
            stops: item.stops ,
            busNo: item.busNo ,
            ticketPrice:item.ticketPrice,

            busTypeTopic:params.busTypeTopic,
            busType: params.busType ,

            Aid: params.Aid,
            firstName: params.firstName,
            lastName: params.lastName,
            email: params.email,

          },
        })
      }
    >
    <View style={[ui.card, styles.schedCard]}>
      <BusStatusNotice item={item} note="Passengers can't book this bus until the emergency is resolved." />
      <View style={styles.schedTop}>
        <View style={styles.busTag}>
          <Ionicons name="bus" size={14} color={C.blue} />
          <Text style={styles.busTagText}>{item.busName ? `${item.busName} · ${item.busNo}` : busLabel(item.busNo)}</Text>
        </View>
        <View style={styles.dayTag}>
          <Ionicons name={item.busdate === "ANY DATE" ? "repeat" : "calendar-outline"} size={13} color={C.muted} />
          <Text style={styles.dayTagText}>{item.busdate === "ANY DATE" ? "Every day" : item.busdate}</Text>
        </View>
      </View>

      <View style={styles.routeWrap}>
        <View style={styles.routeRail}>
          <View style={styles.railDot} />
          <View style={styles.railLine} />
          <View style={styles.railDotEnd} />
        </View>
        <View style={{ flex: 1, justifyContent: "space-between" }}>
          <View style={styles.stopRow}>
            <Text style={styles.stopPlace} numberOfLines={1}>{item.pickuploca}</Text>
            <Text style={styles.stopTime}>{item.depaturetime}</Text>
          </View>
          <View style={[styles.stopRow, { marginTop: 18 }]}>
            <Text style={styles.stopPlace} numberOfLines={1}>{item.dropoffloca}</Text>
            <Text style={styles.stopTime}>{item.arrivaltime}</Text>
          </View>
        </View>
      </View>

      <View style={styles.schedFoot}>
        <Ionicons name="git-commit-outline" size={16} color={C.muted} />
        <Text style={styles.stopsText} numberOfLines={1}>{item.stops ? `Stops: ${item.stops}` : "No stops"}</Text>
        {item.ticketPrice ? <Text style={styles.priceText}>Rs. {item.ticketPrice}</Text> : null}
        <View style={[styles.iconAction, { backgroundColor: C.blueSoft }]}>
          <Ionicons name="create-outline" size={18} color={C.blue} />
        </View>
        <TouchableOpacity
          style={[styles.iconAction, { backgroundColor: C.redSoft }]}
          onPress={() => confirmDelete(item)}
          accessibilityLabel={`Delete schedule for bus ${item.busNo}`}
        >
          <Ionicons name="trash-outline" size={18} color={C.red} />
        </TouchableOpacity>
      </View>
    </View>
    </TouchableOpacity>
  );

  return (

    <>
    <Stack.Screen options={{ title: "", headerShown: false }} />
    <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
      
      <ScreenHeader eyebrow={`${params.busTypeTopic || ""} buses`.trim()} title="Schedules" />

      <View style={styles.listWrap}>
        <View style={[ui.card, styles.introCard]}>
          <IconBox bg={C.purpleSoft} size={44}>
            <Ionicons name="calendar-outline" size={22} color={C.purple} />
          </IconBox>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={ui.rowTitle}>All schedules</Text>
            <Text style={ui.rowSub}>Tap a schedule to edit it</Text>
          </View>
          <Pill text={`${busschedData.length}`} />
        </View>

        <FlatList
          style={{ flex: 1 }}
          data={filterBySearch(busschedData, searchQuery)}
          renderItem={renderBusItem}
          keyExtractor={(item) => String(item.scheduleId)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: NAV_SPACE + 70 }}
          ListEmptyComponent={
            <EmptyState
              icon={<Ionicons name="calendar-outline" size={28} color={C.amber} />}
              title={searchQuery ? "No matching schedules" : "No schedules yet"}
              subtitle={searchQuery ? "Try another place, bus or time." : "Tap Add schedule to create the first one."}
            />
          }
        />
      </View>

      <GradientButton label="Add schedule" icon="add-circle-outline" onPress={handleSearch} style={styles.floatBtn} />


      <SearchPanel
          visible={isSearching}
          query={searchQuery}
          onChangeQuery={setSearchQuery}
          onClose={() => { setIsSearching(false); setSearchQuery(""); }}
          role={"admin"}
          params={params}
          listLabel="schedules"
        />

      <View style={styles.bottomNav}>
      
                <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("home"); if (isSearching) {
                        setIsSearching(false); setSearchQuery(""); 
                      }
      
                      else {
                        router.push({
                          pathname: "/admin/buses/chooseBusType",
                          params: {
                            Aid: params.Aid,
                            firstName: params.firstName,
                            lastName: params.lastName,
                            email: params.email,
                            busType: params.busType ,
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
  schedCard: { padding: 16, marginBottom: 12 },
  schedTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  busTag: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#EAF1FB", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  busTagText: { color: "#155B8A", fontWeight: "800", fontSize: 13.5, letterSpacing: 0.3 },
  dayTag: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#F3F6FA", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  dayTagText: { color: "#5B6B7F", fontWeight: "700", fontSize: 12.5 },
  routeWrap: { flexDirection: "row" },
  routeRail: { alignItems: "center", marginRight: 12, paddingVertical: 4 },
  railDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: "#155B8A" },
  railLine: { width: 2, flex: 1, minHeight: 26, backgroundColor: "#DCE3EC", marginVertical: 3 },
  railDotEnd: { width: 11, height: 11, borderRadius: 6, borderWidth: 2.5, borderColor: "#159B79", backgroundColor: "#FFFFFF" },
  stopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  stopPlace: { fontSize: 15.5, fontWeight: "800", color: "#0F1B2D", flexShrink: 1, textTransform: "capitalize" },
  stopTime: { fontSize: 14, fontWeight: "700", color: "#155B8A", marginLeft: 8 },
  schedFoot: { flexDirection: "row", alignItems: "center", marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#EDF1F6", gap: 8 },
  stopsText: { flex: 1, fontSize: 12.5, color: "#5B6B7F", fontWeight: "600" },
  priceText: { fontSize: 16, fontWeight: "800", color: "#0B6B53" },
  iconAction: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  busRow: { flexDirection: "row", alignItems: "center", padding: 14, marginBottom: 10 },
  busRowIcon: { width: 48, height: 48, borderRadius: 15, backgroundColor: "#EAF1FB", alignItems: "center", justifyContent: "center" },
  busRowTitle: { fontSize: 17, fontWeight: "800", color: "#0F1B2D", letterSpacing: 0.3 },
  busRowSub: { fontSize: 12.5, color: "#5B6B7F", fontWeight: "600", marginTop: 2 },
  rowArrow: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#EAF1FB", alignItems: "center", justifyContent: "center" },
  listWrap: { flex: 1, marginTop: -64, paddingHorizontal: 16 },
  introCard: { flexDirection: "row", alignItems: "center", padding: 16, marginBottom: 12 },
  floatBtn: { position: "absolute", left: 20, right: 20, bottom: 168 },
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
    maxHeight: '61%',
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
    marginTop: 10, 
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25, 
  },

  friendRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  busNoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF1FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  busNoText: {
    color: '#4B7BEC',
    fontWeight: '700',
    fontSize: 13,
  },
  dateText: {
    color: '#8A94A6',
    fontSize: 13,
    fontWeight: '500',
  },
  routeRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  routeLine: {
    alignItems: 'center',
    width: 20,
    marginRight: 12,
  },
  dotFilled: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4B7BEC',
  },
  connector: {
    width: 2,
    flex: 1,
    minHeight: 30,
    backgroundColor: '#D8E2F5',
    marginVertical: 4,
  },
  dotOutline: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#4B7BEC',
    backgroundColor: '#FFFFFF',
  },
  routeDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  routeStop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  locationText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1F36',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B7BEC',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
    borderRadius: 12,
    padding: 10,
    marginTop: 4,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  infoLabel: {
    fontSize: 11,
    color: '#8A94A6',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    color: '#1A1F36',
    fontWeight: '500',
  },
  

  textline0:{
    flex: 1,
    
    flexDirection: 'row',
    justifyContent: 'space-between', 
    

  },

  

  textline1:{
    
    
    
  },

  textline2:{
     
    alignItems: "flex-end",
    
    
  },

  friendName: {
    //flex: 1,
    // marginLeft: 10,
    fontSize: 14,
    color: '#0047AB',
    fontWeight: '500',
  },

  friendName1: {
    //flex: 1,
    //marginRight: 100,
    fontSize: 14,
    color: '#0047AB',
    fontWeight: '500',
  },


  iconButton: { 
    marginRight: 10 
  },

  searchButton: {
    justifyContent: "space-around",
    marginLeft: 20,
    marginRight: 20,  
    height: 55,
    overflow: 'hidden',
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