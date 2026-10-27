import React, { useCallback, useMemo, useState } from 'react';
import { Stack, useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import {
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  ScrollView 
} from 'react-native';
import SearchPanel from "../../../components/SearchPanel";
import { Alert } from "../../../components/JetAlert";
import { 
  Ionicons, 
  Feather ,  
  FontAwesome,
  FontAwesome5
} from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';

import FieldError from "../../../components/FieldError";
import { useFieldErrors } from "../../../utils/validation";
import { getSchedules } from "../../../services/scheduleServices";
import LocationSheet, { LocationOption } from "../../../components/LocationSheet";
import { ScreenHeader, GradientButton, C, ui } from "../../../components/JetUI";
type RouteType = 'Highway' | 'NormalWay';

type Schedule = {
  pickuploca?: string;
  dropoffloca?: string;
  busType?: string;
};

// Count how many schedules use each location, sorted A–Z
const toOptions = (names: (string | undefined)[]): LocationOption[] => {
  const counts = new Map<string, number>();
  names.forEach((n) => {
    const name = String(n || "").trim();
    if (name) counts.set(name, (counts.get(name) || 0) + 1);
  });
  return Array.from(counts, ([name, count]) => ({ name, count })).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
};

const JetLinkInterface: React.FC = () => {
  const params = useLocalSearchParams();
  const [routeType, setRouteType] = useState<RouteType>(
    params.routeType === 'NormalWay' ? 'NormalWay' : 'Highway'
  );
  const [pickup, setPickup] = useState(String(params.pickup || ""));
  const [drop, setDrop] = useState(String(params.drop || ""));
  const [date, setDate] = useState(String(params.date || ""));
  const [date1, setdate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('');

  // Schedules -> dropdown options
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [sheet, setSheet] = useState<null | 'pickup' | 'drop'>(null);

  const router = useRouter();
  const { validate: validateFields, errorFor: fieldError } = useFieldErrors();

  const loadSchedules = async () => {
    try {
      setLoadingRoutes(true);
      const result = await getSchedules();
      if (result?.success && Array.isArray(result.data)) {
        setSchedules(result.data);
      } else {
        setSchedules([]);
      }
    } catch (error) {
      console.log("Load schedules error:", error);
      setSchedules([]);
    } finally {
      setLoadingRoutes(false);
    }
  };

  useFocusEffect(useCallback(() => { loadSchedules(); }, []));

  // Only schedules of the selected bus type (Highway / Normal)
  const typeSchedules = useMemo(
    () => schedules.filter((s) => s.busType === routeType),
    [schedules, routeType]
  );

  // Pickup list: every pickup that has a schedule to the chosen drop-off (or all if none chosen)
  const pickupOptions = useMemo(
    () => toOptions(typeSchedules.filter((s) => !drop || s.dropoffloca === drop).map((s) => s.pickuploca)),
    [typeSchedules, drop]
  );

  // Drop-off list: every drop-off that has a schedule from the chosen pickup (or all if none chosen)
  const dropOptions = useMemo(
    () => toOptions(typeSchedules.filter((s) => !pickup || s.pickuploca === pickup).map((s) => s.dropoffloca)),
    [typeSchedules, pickup]
  );

  // Does a schedule exist for this exact pair and bus type?
  const routeExists = (p: string, d: string, type: RouteType = routeType) =>
    schedules.some((s) => s.busType === type && s.pickuploca === p && s.dropoffloca === d);

  const changeRouteType = (type: RouteType) => {
    if (type === routeType) return;
    setRouteType(type);
    const inType = schedules.filter((s) => s.busType === type);
    // keep selections only if they still make sense for the new bus type
    if (pickup && drop && !routeExists(pickup, drop, type)) {
      setPickup("");
      setDrop("");
    } else {
      if (pickup && !inType.some((s) => s.pickuploca === pickup)) setPickup("");
      if (drop && !inType.some((s) => s.dropoffloca === drop)) setDrop("");
    }
  };

  const selectPickup = (name: string) => {
    setPickup(name);
    // clear drop-off if there's no bus between them
    if (drop && !routeExists(name, drop)) setDrop("");
    setSheet(null);
  };

  const selectDrop = (name: string) => {
    setDrop(name);
    if (pickup && !routeExists(pickup, name)) setPickup("");
    setSheet(null);
  };

  const swapLocations = () => {
    if (!pickup && !drop) return;
    if (pickup && drop && !routeExists(drop, pickup)) {
      Alert.alert("No return route", `There is no ${routeType === 'Highway' ? 'highway' : 'normal'} bus from ${drop} to ${pickup}.`);
      return;
    }
    setPickup(drop);
    setDrop(pickup);
  };

  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const handlesenderD = async () => {
    if (!validateFields([
      { key: "pickup", label: "Pickup location", value: pickup },
      { key: "drop", label: "Drop location", value: drop },
      { key: "date", label: "Date", value: date },
    ])) return;

    if (!routeExists(pickup, drop)) {
      Alert.alert("No buses on this route", "Please choose a pickup and drop-off from the lists.");
      return;
    }

  try {

    router.push({
          pathname: "/passenger/dailyBuses/timeTable",
          params:{ 
            Pid: params.Pid,
            Pid1: params.Pid1,
            pfirstName: params.pfirstName,
            plastName:params.plastName,
            pphoneNumber: params.pphoneNumber,
            pemail: params.pemail,
            NIC: params.NIC,
            routeType,
            pickup,
            drop,
            date,
          } 
          
      });


  } catch(error){

    console.log(error);

  }

};
  

  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#173C79" />

      <ScreenHeader eyebrow="Daily buses" title="Search bus" />

      <ScrollView style={ui.body} contentContainerStyle={ui.bodyContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={[ui.card, styles.formCard]}>
          {/* Bus type */}
          <View style={styles.toggleWrapper}>
            <TouchableOpacity
              style={[styles.toggleBtn, routeType === 'Highway' && styles.activeToggle]}
              onPress={() => changeRouteType('Highway')}
            >
              <Ionicons name="speedometer-outline" size={17} color={routeType === 'Highway' ? '#FFFFFF' : C.blue} />
              <Text style={[styles.toggleText, routeType === 'Highway' && styles.activeToggleText]}>Highway</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, routeType === 'NormalWay' && styles.activeToggle]}
              onPress={() => changeRouteType('NormalWay')}
            >
              <Ionicons name="bus-outline" size={17} color={routeType === 'NormalWay' ? '#FFFFFF' : C.blue} />
              <Text style={[styles.toggleText, routeType === 'NormalWay' && styles.activeToggleText]}>Normal</Text>
            </TouchableOpacity>
          </View>

          {/* Pickup + drop-off with swap */}
          <View style={styles.routeBox}>
            <View style={styles.routeLine}>
              <View style={[styles.dot, { backgroundColor: C.blue }]} />
              <View style={styles.dash} />
              <View style={[styles.dot, { backgroundColor: '#159B79' }]} />
            </View>

            <View style={{ flex: 1 }}>
              <TouchableOpacity style={styles.selectRow} onPress={() => setSheet('pickup')} accessibilityLabel="Choose pickup location">
                <Text style={styles.label}>Pick up location</Text>
                <Text style={[styles.selectValue, !pickup && styles.placeholder]} numberOfLines={1}>
                  {pickup || "Choose pickup"}
                </Text>
              </TouchableOpacity>
              <FieldError message={fieldError("pickup", pickup)} />

              <View style={styles.divider} />

              <TouchableOpacity style={styles.selectRow} onPress={() => setSheet('drop')} accessibilityLabel="Choose drop-off location">
                <Text style={styles.label}>Drop off location</Text>
                <Text style={[styles.selectValue, !drop && styles.placeholder]} numberOfLines={1}>
                  {drop || "Choose drop-off"}
                </Text>
              </TouchableOpacity>
              <FieldError message={fieldError("drop", drop)} />
            </View>

            <TouchableOpacity style={styles.swapBtn} onPress={swapLocations} accessibilityLabel="Swap pickup and drop-off">
              <Ionicons name="swap-vertical" size={20} color={C.blue} />
            </TouchableOpacity>
          </View>

          {/* Date */}
          <Text style={[styles.label, { marginTop: 16 }]}>Travel date</Text>
          <TouchableOpacity style={styles.inputWrapper} onPress={() => setShowCalendar(true)} accessibilityLabel="Choose travel date">
            <Ionicons name="calendar-outline" size={20} color={C.muted} style={{ marginRight: 10 }} />
            <Text style={[styles.dateValue, !date && styles.placeholder]}>{date || "Choose a date"}</Text>
            <Ionicons name="chevron-down" size={18} color="#8A97A8" />
          </TouchableOpacity>
          <FieldError message={fieldError("date", date)} />

          {showCalendar && (
            <DateTimePicker
              value={date1 || new Date()}
              mode="date"
              display="default"
              minimumDate={new Date()}   // Cannot select a date before today
              onChange={(event, selectedDate) => {
                setShowCalendar(false);

                if (selectedDate) {
                  setdate(selectedDate);
                  setDate(selectedDate.toLocaleDateString());
                }
              }}
            />
          )}

          {!loadingRoutes && typeSchedules.length === 0 ? (
            <View style={styles.notice}>
              <Ionicons name="information-circle-outline" size={18} color={C.amber} />
              <Text style={styles.noticeText}>
                No {routeType === 'Highway' ? 'highway' : 'normal'} bus schedules yet.
              </Text>
            </View>
          ) : null}
        </View>

        <GradientButton label="Search buses" icon="search" onPress={handlesenderD} />
      </ScrollView>

      <LocationSheet
        visible={sheet === 'pickup'}
        title="Pick up location"
        subtitle={drop ? `Places with a bus to ${drop}` : `All ${routeType === 'Highway' ? 'highway' : 'normal'} pickup points`}
        options={pickupOptions}
        selected={pickup}
        loading={loadingRoutes}
        emptyText={drop ? `No bus goes to ${drop} on this route type` : "No schedules found"}
        onSelect={selectPickup}
        onClear={() => { setPickup(""); setSheet(null); }}
        onClose={() => setSheet(null)}
      />
      <LocationSheet
        visible={sheet === 'drop'}
        title="Drop off location"
        subtitle={pickup ? `Places a bus goes from ${pickup}` : `All ${routeType === 'Highway' ? 'highway' : 'normal'} drop-off points`}
        options={dropOptions}
        selected={drop}
        loading={loadingRoutes}
        emptyText={pickup ? `No bus leaves ${pickup} on this route type` : "No schedules found"}
        onSelect={selectDrop}
        onClear={() => { setDrop(""); setSheet(null); }}
        onClose={() => setSheet(null)}
      />

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
                        pathname: "/passenger/index1",
                        params: {
                          Pid: params.Pid,
                          Pid1: params.Pid1,
                          pfirstName: params.pfirstName,
                          plastName:params.plastName,
                          pphoneNumber: params.pphoneNumber,
                          pemail: params.pemail,
                          NIC: params.NIC,
                          role: "passenger"
                          
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
                          NIC: params.NIC,
                        },                    
                      });}} > 
                <Ionicons name="home-outline" size={28} color="#fff" />             
              </TouchableOpacity>
        
              <TouchableOpacity style={styles.item} onPress={() => { router.push({ pathname: "/notifications", params: { role: "passenger" } }); }}>
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
    </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  noticeText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#8A4B00' },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.amberSoft,
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  dateValue: { flex: 1, fontSize: 15, fontWeight: '700', color: C.ink },
  swapBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E3E9F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  divider: { height: 1, backgroundColor: '#E3E9F1' },
  placeholder: { color: '#8A97A8', fontWeight: '600' },
  selectValue: { fontSize: 17, fontWeight: '800', color: C.ink, marginTop: 3, letterSpacing: 0.3 },
  selectRow: { paddingVertical: 10 },
  dash: { width: 2, flex: 1, minHeight: 36, backgroundColor: '#DCE3EC', marginVertical: 4 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  routeLine: { alignItems: 'center', marginRight: 14, paddingVertical: 18 },
  routeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E3E9F1',
    backgroundColor: '#F7F9FC',
    borderRadius: 18,
    paddingVertical: 6,
    paddingLeft: 14,
    paddingRight: 10,
  },
  formCard: { padding: 18, borderRadius: 24 },
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
    width: '90%',
    flex: 1,
    maxHeight: '45%',
    backgroundColor: '#FFF',
    padding: 15,
    alignItems: 'center',
    marginTop: -50,   
    marginBottom: 15,
    alignSelf: 'center',
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  svw: {
    width: '100%',
      
  },

  toggleWrapper: {
    flexDirection: 'row',
    backgroundColor: '#F3F6FA',
    borderRadius: 16,
    padding: 5,
    gap: 6,
    marginBottom: 18,
  },
  toggleBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeToggle: { backgroundColor: C.blue },
  activetoggleText: {
    
    color: '#e9e9e9',
    fontWeight: 'bold',
  },
  activeToggleText: { color: '#FFFFFF' },
  toggleText: { fontSize: 15, color: C.blue, fontWeight: '700' },

  label: { color: C.muted, fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E3E9F1',
    backgroundColor: '#F7F9FC',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    marginTop: 6,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#333',
  },

  input1: {
    flex: 1,
    height: '100%',
    color: '#333',
    marginTop:20,
  },

  inputIcon: {
    fontSize: 18,
    color: '#999',
  },

  dateandtime:{
    flexDirection: 'row',
  },

  
  
  submitButton: {
    
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

   submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
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

export default JetLinkInterface;