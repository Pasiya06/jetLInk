import React, { useState } from 'react';
import { Stack,useRouter,useLocalSearchParams} from "expo-router";
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
type RouteType = 'Highway' | 'NormalWay';

const JetLinkInterface: React.FC = () => {
  const params = useLocalSearchParams();
  const [routeType, setRouteType] = useState<RouteType>('Highway');
  const [pickup, setPickup] = useState(String(params.pickup || ""));
  const [drop, setDrop] = useState(String(params.drop || ""));
  const [date, setDate] = useState(String(params.date || ""));
  const [date1, setdate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [activeTab, setActiveTab] = useState('');
  
  const router = useRouter();
  const { validate: validateFields, errorFor: fieldError } = useFieldErrors();

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowCalendar(false);

    if (selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString("en-US");
      setDate(formattedDate);
    }
  };
  const onTimeChange = (event: any, selected?: Date) => {
  setShowTimePicker(false);

  if (selected) {
    setTime(selected);

    const formatted = selected.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setSelectedTime(formatted);
  }
};

  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const handlesenderD = async () => {
    if (!validateFields([
      { key: "pickup", label: "Pickup location", value: pickup },
      { key: "drop", label: "Drop location", value: drop },
      { key: "date", label: "Date", value: date },
      { key: "selectedTime", label: "Time", value: selectedTime },
    ])) return;


  if (!pickup || !drop || !date) {
    alert("Please fill required fields");
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
            //time:selectedTime
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
      <StatusBar barStyle="light-content" backgroundColor="#0056b3" />
      
      {/* Header Section */}
      <LinearGradient
            colors={["#173C79","#155B8A","#159B79",]}
          start={{x: 0, y: 0,}}
          end={{x: 1, y: 1,}}
            style={styles.submitGradient1}
        >
            <View style={styles.header}>
                  
                <TouchableOpacity >
                  <Text style={styles.title}>Search Bus</Text>
                </TouchableOpacity>
                       
            </View>
        </LinearGradient> 

      
    

      
      <View style={styles.card}>
        
        <View style={styles.toggleWrapper}>
            <TouchableOpacity 
            style={[styles.toggleBtn, routeType === 'Highway' && styles.activeToggle ]}
            onPress={() => setRouteType('Highway')}
            >
            <Text style={[styles.toggleText, routeType === 'Highway' && styles.activeToggleText]}>Highway</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
            style={[styles.toggleBtn, routeType === 'NormalWay' && styles.activeToggle ]}
            onPress={() => setRouteType('NormalWay')}
            >
            <Text style={[styles.toggleText, routeType === 'NormalWay' && styles.activeToggleText ]}>Normal</Text>
            </TouchableOpacity>
        </View>
        

        
        <ScrollView style={styles.svw}>
          
          
            <Text style={styles.label}>Pick up Location</Text>
            <View style={styles.inputWrapper}>
                <TextInput 
                style={styles.input} 
                value={pickup}  
                onChangeText={(text) => setPickup(text.replace(/\s/g, "").toUpperCase())}
                placeholder="MATARA"
                placeholderTextColor="#99999a"
                autoCapitalize="characters"
                autoCorrect={false}
                />
            </View>
            <FieldError message={fieldError("pickup", pickup)} />
          
          
            <Text style={styles.label}>Drop off Location</Text>
            <View style={styles.inputWrapper}>
                <TextInput 
                style={styles.input} 
                value={drop} 
                onChangeText={(text) => setDrop(text.replace(/\s/g, "").toUpperCase())}
                placeholder="GALLE"
                placeholderTextColor="#99999a"
                autoCapitalize="characters"
                autoCorrect={false} 
                />
                
            </View>
            <FieldError message={fieldError("drop", drop)} />
            
            <Text style={styles.label}>Date</Text>
            <View style={styles.inputWrapper}>
                <TextInput 
                    style={styles.input} 
                    value={date} 
                    placeholder="MM/DD/YYYY" 
                    placeholderTextColor="#99999a"
                    onChangeText={setDate} />
                <TouchableOpacity onPress={() => setShowCalendar(true)}>
                <FontAwesome5 name="calendar-alt" size={24} color="#99999a" />  
                </TouchableOpacity>
            </View>
            <FieldError message={fieldError("date", date)} />

            {/* <Text style={styles.label}>Time</Text>
            <View style={styles.inputWrapper}>
                <TextInput style={styles.input}
                
                value={selectedTime}
                placeholder="00:00"
                placeholderTextColor="#99999a"
                editable={false}
                />

                <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                <Ionicons name="time-outline" size={24} color="#99999a" />
                </TouchableOpacity>
                
            </View>
            <FieldError message={fieldError("selectedTime", selectedTime)} /> */}

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

          {/* {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="default"
              onChange={onTimeChange}
            />
          )}                    */}
 
        </ScrollView>
        
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handlesenderD}>
        <LinearGradient
            colors={["#173C79","#155B8A","#159B79",]}
            start={{x: 0, y: 0,}}
            end={{x: 1, y: 1,}}
            style={styles.submitGradient}
        >
        <Text style={styles.submitText}>Search</Text>
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
        
              
              <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("home"); if (isSearching) {
                      setIsSearching(false); 
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
    width: '100%',
    backgroundColor: '#F2F4F5',
    borderRadius: 12,
    flexDirection: 'row',
    padding: 6,
    marginTop: 12,
    marginBottom: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    
  },
  toggleBtn: {
    flex: 0.48,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    
  },
  activeToggle: {
    backgroundColor: '#4B6CF5',
    color: '#f1f7ff',
    fontWeight: 'bold',
    
  },
  activetoggleText: {
    
    color: '#e9e9e9',
    fontWeight: 'bold',
  },
  activeToggleText: {
    color: '#FFFFFF', // This makes it white when active
  },
  toggleText: {
    fontSize: 18,
    color: '#4B6CF5',
    fontWeight: 'bold',
  },

  label: {
    color: '#4B6CF5',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    backgroundColor: '#F2F4F5',
    borderColor: '#ECEEF2',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 45,
    marginBottom: 15,
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