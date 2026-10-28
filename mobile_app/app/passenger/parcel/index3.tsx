import React, { useState, useCallback } from 'react';
import { Stack, useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import { getSchedules,  } from "../../../services/scheduleServices";
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  TextInput 
} from 'react-native';
import { BusStatusNotice, isBusBlocked, showBusBlockedAlert } from "../../../components/BusStatus";
import SearchPanel, { filterBySearch } from "../../../components/SearchPanel";
import { 
  Ionicons, 
  Feather, 
  Fontisto, 
  FontAwesome6, 
  MaterialIcons, 
  FontAwesome5, 
  FontAwesome
} from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenHeader, SectionLabel, Pill, EmptyState, IconBox, C, ui } from "../../../components/JetUI";
import AlertBadge from "../../../components/AlertBadge";



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
  busStatus?:string;
  busEmergency?:boolean;
  busEmergencyAt?:string;
}


// ---- Hide buses that already left today ----
// "08:30 AM" / "8:30 pm" / "20:30" -> minutes after midnight (null if unreadable)
const timeToMinutes = (value?: string): number | null => {
  const m = /(\d{1,2})[:.](\d{2})\s*(am|pm|a\.m\.|p\.m\.)?/i.exec(String(value || "").replace(/\u202f|\u00a0/g, " "));
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2]);
  const ap = (m[3] || "").toLowerCase().replace(/\./g, "");
  if (ap === "pm" && h < 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  return h > 23 || min > 59 ? null : h * 60 + min;
};

// True when the travel date is today and the bus's pickup (departure) time has already passed.
// The date picker saves dates with toLocaleDateString(), so comparing with today's
// toLocaleDateString() on the same phone works for any date format.
const leftAlreadyToday = (depaturetime?: string, travelDate?: string): boolean => {
  const now = new Date();
  const today = now.toLocaleDateString();
  const day = String(travelDate || "").trim();
  if (day && day !== today) return false; // another day -> every time is fine
  const dep = timeToMinutes(depaturetime);
  return dep !== null && dep <= now.getHours() * 60 + now.getMinutes();
};

const JetLinkInterface: React.FC = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('');
  const [busschedData, setBusschedData] = useState<Bussched[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const loadschedBuses = async () => {
    try {
      const result = await getSchedules();
  
      if (result.success) {
        const filteredSchedules = result.data.filter(
          (schedule: any) => 
            schedule.pickuploca === params.pickup &&
            schedule.dropoffloca === params.drop &&
            !leftAlreadyToday(schedule.depaturetime, String(params.date || ""))
        );
  
        setBusschedData(filteredSchedules);
      }
    } catch (error) {
      console.log(error);
    }
  };
  
    useFocusEffect(useCallback(()=>{loadschedBuses();},[]));
    
    const renderBusItem = ({item}:{item:Bussched}) => (
      <TouchableOpacity
        activeOpacity={isBusBlocked(item) ? 1 : 0.7}
        onPress={() => isBusBlocked(item) ? showBusBlockedAlert(item) :
          router.push({
            pathname: "/passenger/parcel/index4",
            params: {
              Sid: item._id,
              scheduleId: item.scheduleId,
              pickuploca: item.pickuploca || "",
              dropoffloca: item.dropoffloca || "",
              arrivaltime: item.arrivaltime || "",
              depaturetime: item.depaturetime || "",
              stops: item.stops || "",
              bNumber: item.busNo || "",

              Pid: params.Pid,
              Pid1: params.Pid1,
              pfirstName: params.pfirstName,
              plastName:params.plastName,
              pphoneNumber: params.pphoneNumber,
              pemail: params.pemail,
              sendername:params.sendername,
              smobilenumber:params.smobilenumber,
              semail:params.semail,
              receivername:params.receivername,
              rmobilenumber:params.rmobilenumber,
              remail:params.remail,
              weight:params.weight,
              pickup:params.pickup,
              drop:params.drop,
              date:params.date,
              //time:params.time



            },
          })
        }
      >
      <View style={[styles.friendRow, isBusBlocked(item) && { opacity: 0.85, borderColor: C.redBorder, borderWidth: 1 }]}>
        <BusStatusNotice item={item} />
        <View style={styles.topRow}>
          <View style={styles.busNoPill}>
            <Ionicons name="bus" size={14} color="#155B8A" />
            <Text style={styles.busNoText}>{item.busName ? `${item.busName} · ${item.busNo}` : item.busNo}</Text>
          </View>
          <Text style={styles.dateText}>{params.date}</Text>
        </View>
  
        {/* Route visual */}
        <View style={styles.routeRow}>
          <View style={styles.routeLine}>
            <View style={styles.dotFilled} />
            <View style={styles.connector} />
            <View style={styles.dotOutline} />
          </View>
  
          <View style={styles.routeDetails}>
            <View style={styles.routeStop}>
              <Text style={styles.locationText}>{item.pickuploca}</Text>
              <Text style={styles.timeText}>{item.depaturetime}</Text>
            </View>
  
            <View style={[styles.routeStop, { marginTop: 22 }]}>
              <Text style={styles.locationText}>{item.dropoffloca}</Text>
              <Text style={styles.timeText}>{item.arrivaltime}</Text>
            </View>
          </View>
        </View>
  
        {/* Stops row */}
        <View style={styles.infoRow}>
          <View style={styles.iconWrap}>
            <Ionicons name="location-outline" size={16} color="#155B8A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>Stops</Text>
            <Text style={styles.infoValue}>{item.stops}</Text>
          </View>
        </View>
      </View>
      </TouchableOpacity>
    );
  
    return (
  
      <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <SafeAreaView style={styles.container}>
        
        <ScreenHeader eyebrow="Send a parcel" title="Choose a bus" /> 
             
        <View style={[ui.body, { paddingHorizontal: 16 }]}>
          <View style={[ui.card, styles.summary]}>
            <IconBox bg={C.amberSoft} size={48}>
              <Feather name="package" size={24} color={C.amber} />
            </IconBox>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.summaryRoute}>
                <Text style={styles.summaryPlace} numberOfLines={1}>{params.pickup}</Text>
                <Ionicons name="arrow-forward" size={16} color="#159B79" style={{ marginHorizontal: 6 }} />
                <Text style={[styles.summaryPlace, { flexShrink: 1 }]} numberOfLines={1}>{params.drop}</Text>
              </View>
              <Text style={styles.summaryMetaText}>
                {params.date}{params.weight ? ` · ${params.weight} kg` : ""}
              </Text>
            </View>
            <Pill text={`${busschedData.length} ${busschedData.length === 1 ? "bus" : "buses"}`} bg={C.greenSoft} color={C.green} />
          </View>

          <SectionLabel style={{ marginTop: 18, marginBottom: 6 }}>Select a bus for your parcel</SectionLabel>
          <FlatList
            style={{ flex: 1 }}
            data={filterBySearch(busschedData, searchQuery)}
            renderItem={renderBusItem}
            keyExtractor={(item)=>item.scheduleId}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 190 }}
            ListEmptyComponent={
              <EmptyState
                icon={<Ionicons name="bus-outline" size={28} color={C.amber} />}
                title="No buses on this route"
                subtitle="Go back and choose another pickup or delivery location."
              />
            }
          />
        </View>

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
                        pathname: "/passenger/parcel/index2",
                        params: {
                          Pid: params.Pid,
                          Pid1: params.Pid1,
                          pfirstName: params.pfirstName,
                          plastName:params.plastName,
                          pphoneNumber: params.pphoneNumber,
                          pemail: params.pemail,
                          sendername:params.sendername,
                          smobilenumber:params.smobilenumber,
                          semail:params.semail,
                          receivername:params.receivername,
                          rmobilenumber:params.rmobilenumber,
                          remail:params.remail,
                          weight:params.weight,
                          pickup:params.pickup,
                          drop:params.drop,
                          date:params.date,
                          time:params.time
                                      
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
        
              <TouchableOpacity style={styles.item} onPress={() => { router.push({ pathname: "/notifications", params: { role: "passenger" } }); }}>
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
    </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  summaryMetaText: { fontSize: 13, fontWeight: '600', color: C.muted, marginTop: 3 },
  summaryPlace: { fontSize: 16, fontWeight: '800', color: C.navy },
  summaryRoute: { flexDirection: 'row', alignItems: 'center' },
  summary: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 22 },
  container: { flex: 1, backgroundColor: C.bg },

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
    borderTopLeftRadius: 55,
    borderTopRightRadius: 55,
    width: '100%',
    flex: 1,
    maxHeight: '70%',
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom:80,
    marginTop: 3, 
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25, 
  },

  friendRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginVertical: 6,
    shadowColor: '#0F1B2D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
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
    backgroundColor: '#EAF1FB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  busNoText: {
    color: '#155B8A',
    fontWeight: '700',
    fontSize: 13,
  },
  dateText: {
    color: '#5B6B7F',
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
    backgroundColor: '#155B8A',
  },
  connector: {
    width: 2,
    flex: 1,
    minHeight: 30,
    backgroundColor: '#DCE3EC',
    marginVertical: 4,
  },
  dotOutline: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#155B8A',
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
  locationText: { fontSize: 15, fontWeight: '800', color: '#0F1B2D', flex: 1, marginRight: 8 },
  timeText: { fontSize: 14, fontWeight: '800', color: '#155B8A' },
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
    backgroundColor: '#EAF1FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  infoLabel: {
    fontSize: 11,
    color: '#5B6B7F',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    color: '#0F1B2D',
    fontWeight: '500',
  },

  textline0:{
    flex: 1,
    
    flexDirection: 'row',

  },

  textline10:{
    justifyContent: 'space-between', 
    flexDirection: 'row',

  },

  textline1:{
    
    
    
  },

  textline2:{
    marginLeft: 50, 
    
    
  },

  friendName: {
    //flex: 1,
    // marginLeft: 10,
    fontSize: 14,
    color: '#173C79',
    fontWeight: '500',
  },

  friendName1: {
    //flex: 1,
    //marginRight: 100,
    fontSize: 14,
    color: '#173C79',
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

export default JetLinkInterface;