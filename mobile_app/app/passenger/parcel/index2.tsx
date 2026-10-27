import React, { useCallback, useMemo, useState } from 'react';
import { Stack, useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { 
  Alert ,
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  ScrollView 
} from 'react-native';
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

type Schedule = {
  pickuploca?: string;
  dropoffloca?: string;
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
  const [sendername, setsendername] = useState(`${params.pfirstName ?? ""} ${params.plastName ?? ""}`.trim());
  const [smobilenumber, Ssetmobilenumber] = useState(String(params.pphoneNumber || params.smobilenumber || ""));
  const [receivername, setreceivername] = useState(String(params.receivername || ""));
  const [rmobilenumber, Rsetmobilenumber] = useState(String(params.rmobilenumber || ""));
  const [remail, RsetEmail] = useState(String(params.remail || ""));
  const [weight, setWeight] = useState(String(params.weight || ""));
  const [pickup, setPickup] = useState(String(params.pickup || ""));
  const [drop, setDrop] = useState(String(params.drop || ""));
  const [date, setDate] = useState(String(params.date || ""));
  const [date1, setdate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('');

  // Schedules -> pickup / drop-off dropdowns
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [sheet, setSheet] = useState<null | 'pickup' | 'drop'>(null);
  
  const router = useRouter();
  const { validate: validateFields, errorFor: fieldError } = useFieldErrors();

  const loadSchedules = async () => {
    try {
      setLoadingRoutes(true);
      const result = await getSchedules();
      setSchedules(result?.success && Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.log("Load schedules error:", error);
      setSchedules([]);
    } finally {
      setLoadingRoutes(false);
    }
  };

  useFocusEffect(useCallback(() => { loadSchedules(); }, []));

  // Pickup list: places with a schedule to the chosen drop-off (all if none chosen)
  const pickupOptions = useMemo(
    () => toOptions(schedules.filter((s) => !drop || s.dropoffloca === drop).map((s) => s.pickuploca)),
    [schedules, drop]
  );

  // Drop-off list: places with a schedule from the chosen pickup (all if none chosen)
  const dropOptions = useMemo(
    () => toOptions(schedules.filter((s) => !pickup || s.pickuploca === pickup).map((s) => s.dropoffloca)),
    [schedules, pickup]
  );

  const routeExists = (p: string, d: string) =>
    schedules.some((s) => s.pickuploca === p && s.dropoffloca === d);

  const selectPickup = (name: string) => {
    setPickup(name);
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
      Alert.alert("No return route", `There is no bus from ${drop} to ${pickup}.`);
      return;
    }
    setPickup(drop);
    setDrop(pickup);
  };

  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const handlesenderD = async () => {
    if (!validateFields([
      { key: "sendername", label: "Sender name", value: sendername },
      { key: "smobilenumber", label: "Sender mobile number", value: smobilenumber, type: "phone" },
      { key: "receivername", label: "Receiver name", value: receivername },
      { key: "rmobilenumber", label: "Receiver mobile number", value: rmobilenumber, type: "phone" },
      { key: "remail", label: "Receiver email", value: remail, type: "email" },
      { key: "weight", label: "Weight", value: weight, type: "number", min: 0.1 },
      { key: "pickup", label: "Pickup location", value: pickup },
      { key: "drop", label: "Drop location", value: drop },
      { key: "date", label: "Date", value: date },
    ])) return;


  if (!sendername || !smobilenumber  || !receivername || !remail || !rmobilenumber || !weight || !pickup || !drop ) {
    alert("Please fill required fields");
    return;
  }

  if (!routeExists(pickup, drop)) {
    Alert.alert("No buses on this route", "Please choose a pickup and delivery location from the lists.");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(remail)) {
        Alert.alert("Invalid Receiver Email", "Please enter a valid email address.");
        return false;
      }
  const phoneRegex = /^[0-9]{10}$/;

  if (!phoneRegex.test(smobilenumber)) {
    Alert.alert(
      "Invalid Sender Phone Number",
      "Phone number must contain exactly 10 digits."
    );
    return false;
  }

  if (!phoneRegex.test(rmobilenumber)) {
    Alert.alert(
      "Invalid Receiver Phone Number",
      "Phone number must contain exactly 10 digits."
    );
    return false;
  }


  try {

    router.push({
          pathname: "/passenger/parcel/index3",
          params:{ 
            Pid: params.Pid,
            Pid1: params.Pid1,
            pfirstName: params.pfirstName,
            plastName:params.plastName,
            pphoneNumber: params.pphoneNumber,
            pemail: params.pemail,
            NIC: params.NIC,
            sendername,
            smobilenumber,
            semail:params.pemail,
            receivername,
            rmobilenumber,
            remail,
            weight,
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

      <ScreenHeader eyebrow="Send a parcel" title="Book parcel" />

      <ScrollView style={ui.body} contentContainerStyle={ui.bodyContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Route */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Ionicons name="navigate-outline" size={18} color={C.blue} />
            <Text style={styles.sectionTitle}>Route</Text>
          </View>

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

              <View style={styles.divider} />

              <TouchableOpacity style={styles.selectRow} onPress={() => setSheet('drop')} accessibilityLabel="Choose delivery location">
                <Text style={styles.label}>Delivery location</Text>
                <Text style={[styles.selectValue, !drop && styles.placeholder]} numberOfLines={1}>
                  {drop || "Choose delivery"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.swapBtn} onPress={swapLocations} accessibilityLabel="Swap pickup and delivery">
              <Ionicons name="swap-vertical" size={20} color={C.blue} />
            </TouchableOpacity>
          </View>
          <FieldError message={fieldError("pickup", pickup)} />
          <FieldError message={fieldError("drop", drop)} />

          <Text style={[styles.label, { marginTop: 12 }]}>Date</Text>
          <TouchableOpacity style={styles.inputWrapper} onPress={() => setShowCalendar(true)} accessibilityLabel="Choose date">
            <Ionicons name="calendar-outline" size={19} color={C.muted} style={styles.fieldIcon} />
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

          {!loadingRoutes && schedules.length === 0 ? (
            <View style={styles.notice}>
              <Ionicons name="information-circle-outline" size={18} color={C.amber} />
              <Text style={styles.noticeText}>No bus schedules found yet.</Text>
            </View>
          ) : null}
        </View>

        {/* Parcel */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Feather name="package" size={18} color={C.blue} />
            <Text style={styles.sectionTitle}>Parcel</Text>
          </View>
          <Text style={styles.label}>Weight (kg)</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="barbell-outline" size={19} color={C.muted} style={styles.fieldIcon} />
            <TextInput style={styles.input} value={weight} onChangeText={(t) => setWeight(t.replace(/[^0-9.]/g, ""))} keyboardType="decimal-pad" maxLength={4} placeholder="5" placeholderTextColor="#8A97A8" />
            <Text style={styles.unit}>kg</Text>
          </View>
          <FieldError message={fieldError("weight", weight)} />
        </View>

        {/* Sender */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Ionicons name="person-outline" size={18} color={C.blue} />
            <Text style={styles.sectionTitle}>Sender</Text>
          </View>

          <Text style={styles.label}>Name</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={19} color={C.muted} style={styles.fieldIcon} />
            <TextInput style={styles.input} value={sendername} onChangeText={setsendername} />
          </View>
          <FieldError message={fieldError("sendername", sendername)} />

          <Text style={styles.label}>Mobile number</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={19} color={C.muted} style={styles.fieldIcon} />
            <TextInput 
              style={styles.input} 
              value={smobilenumber} 
              onChangeText={(t) => Ssetmobilenumber(t.replace(/[^0-9]/g, ""))} 
              keyboardType="phone-pad" 
              maxLength={10}/>
          </View>
          <FieldError message={fieldError("smobilenumber", smobilenumber)} />

          <Text style={styles.label}>Email</Text>
          <View style={[styles.inputWrapper, styles.readOnly]}>
            <Ionicons name="mail-outline" size={19} color={C.muted} style={styles.fieldIcon} />
            <Text style={styles.input1} numberOfLines={1}>{params.pemail}</Text>
            <Ionicons name="lock-closed-outline" size={16} color="#8A97A8" />
          </View>
        </View>

        {/* Receiver */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Ionicons name="people-outline" size={18} color={C.blue} />
            <Text style={styles.sectionTitle}>Receiver</Text>
          </View>

          <Text style={styles.label}>Name</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={19} color={C.muted} style={styles.fieldIcon} />
            <TextInput style={styles.input} value={receivername} onChangeText={setreceivername} placeholder="Receiver's name" placeholderTextColor="#8A97A8" />
          </View>
          <FieldError message={fieldError("receivername", receivername)} />

          <Text style={styles.label}>Mobile number</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={19} color={C.muted} style={styles.fieldIcon} />
            <TextInput style={styles.input} value={rmobilenumber} onChangeText={(t) => Rsetmobilenumber(t.replace(/[^0-9]/g, ""))} keyboardType="phone-pad" maxLength={10} placeholder="07XXXXXXXX" placeholderTextColor="#8A97A8" />
          </View>
          <FieldError message={fieldError("rmobilenumber", rmobilenumber)} />

          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={19} color={C.muted} style={styles.fieldIcon} />
            <TextInput 
              style={styles.input} 
              value={remail} 
              onChangeText={(text) => RsetEmail(text.replace(/\s/g, "").toLowerCase())} 
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="name@example.com"
              placeholderTextColor="#8A97A8"
            />
          </View>
          <FieldError message={fieldError("remail", remail)} />
        </View>

        <GradientButton label="Next" icon="arrow-forward" onPress={handlesenderD} />
      </ScrollView>

      <LocationSheet
        visible={sheet === 'pickup'}
        title="Pick up location"
        subtitle={drop ? `Places with a bus to ${drop}` : "All pickup points"}
        options={pickupOptions}
        selected={pickup}
        loading={loadingRoutes}
        emptyText={drop ? `No bus goes to ${drop}` : "No schedules found"}
        onSelect={selectPickup}
        onClear={() => { setPickup(""); setSheet(null); }}
        onClose={() => setSheet(null)}
      />
      <LocationSheet
        visible={sheet === 'drop'}
        title="Delivery location"
        subtitle={pickup ? `Places a bus goes from ${pickup}` : "All delivery points"}
        options={dropOptions}
        selected={drop}
        loading={loadingRoutes}
        emptyText={pickup ? `No bus leaves ${pickup}` : "No schedules found"}
        onSelect={selectDrop}
        onClear={() => { setDrop(""); setSheet(null); }}
        onClose={() => setSheet(null)}
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
                        pathname: "/passenger/parcel/index1",
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
  notice: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.amberSoft, borderRadius: 12, padding: 12, marginTop: 10, marginBottom: 6 },
  dateValue: { flex: 1, fontSize: 15, fontWeight: '700', color: C.ink },
  swapBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E3E9F1', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  divider: { height: 1, backgroundColor: '#E3E9F1' },
  placeholder: { color: '#8A97A8', fontWeight: '600' },
  selectValue: { fontSize: 17, fontWeight: '800', color: C.ink, marginTop: 3, letterSpacing: 0.3 },
  selectRow: { paddingVertical: 10 },
  dash: { width: 2, flex: 1, minHeight: 36, backgroundColor: '#DCE3EC', marginVertical: 4 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  routeLine: { alignItems: 'center', marginRight: 14, paddingVertical: 18 },
  routeBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E3E9F1', backgroundColor: '#F7F9FC', borderRadius: 18, paddingVertical: 6, paddingLeft: 14, paddingRight: 10 },
  unit: { fontSize: 14, fontWeight: '700', color: C.muted },
  fieldIcon: { marginRight: 10 },
  readOnly: { backgroundColor: '#EEF2F7' },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: C.ink },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 12, marginBottom: 14, borderBottomWidth: 1, borderBottomColor: C.line },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    paddingBottom: 10,
    elevation: 3,
    shadowColor: '#0F1B2D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
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
    maxHeight: '60%',
    backgroundColor: '#FFF',
    padding: 15,
    alignItems: 'center',
    marginTop: -50,   
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

  label: { color: C.muted, fontSize: 13, fontWeight: '700', marginBottom: 6, marginLeft: 2 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', minHeight: 52, borderWidth: 1.5, borderColor: '#E3E9F1', backgroundColor: '#F7F9FC', borderRadius: 14, paddingHorizontal: 14, marginBottom: 4 },
  input: { flex: 1, fontSize: 15, fontWeight: '600', color: C.ink, paddingVertical: 12 },

  input1: { flex: 1, fontSize: 15, fontWeight: '600', color: C.muted },

  inputIcon: {
    fontSize: 18,
    color: '#999',
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