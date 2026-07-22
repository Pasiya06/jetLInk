import React, { useState } from 'react';
import { Stack,useRouter,useLocalSearchParams} from "expo-router";
import { 
  StyleSheet, 
  View, 
  Text,
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  Image,
  ScrollView 
} from 'react-native';
import { Ionicons, 
  MaterialCommunityIcons, 
  Feather, 
  FontAwesome6, 
  MaterialIcons, 
  FontAwesome5, 
  FontAwesome } from '@expo/vector-icons';
import { updateSchedule } from "../../../services/scheduleServices";
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';

const ToursScreen: React.FC = () => {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState('');
  const params = useLocalSearchParams();
  const [busdate, setBusDate] = useState(String(params.busdate ||""));
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [date, setDate] = useState(new Date());
  const [pickuploca, setpickuploca] = useState(String(params.pickuploca ||""));
  const [dropoffloca, setdropoffloca] = useState(String(params.dropoffloca ||""));
  const [depaturetime, setdepaturetime] = useState(String(params.depaturetime ||""));
  const [arrivaltime, setarrivaltime] = useState(String(params.arrivaltime ||""));
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showTimePicker1, setShowTimePicker1] = useState(false);
  const [time, setTime] = useState(new Date());
  const [stops, setstops] = useState(String(params.stops ||""));

  const onTimeChange = (event: any, selected?: Date) => {
    setShowTimePicker(false);

    if (selected) {
        setTime(selected);

        const formatted = selected.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        });

        setdepaturetime(formatted);
    }
  };

  const onTimeChange1 = (event: any, selected?: Date) => {
    setShowTimePicker1(false);

    if (selected) {
        setTime(selected);

        const formatted = selected.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        });

        setarrivaltime(formatted);
    }
  };


  const handleAddBus = async () => {

  try {

    await updateSchedule(params.Sid as string, {

      busdate,
      pickuploca,
      dropoffloca,
      depaturetime,
      arrivaltime,
      stops,

    });

    alert("Schedule Updated Successfully");

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

  } catch (error) {

    console.log(error);

    alert("Update Failed");

  }

};

  return (
    <>
    <Stack.Screen options={{ title: "", headerShown: false }} />
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4B6CF5', '#32CD32']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.submitGradient1}
      >
        <View style={styles.header}>
            
        
          <TouchableOpacity >
            <Text style={styles.title}>JetLink</Text>
          </TouchableOpacity>
                  
        </View>
      </LinearGradient> 
            
                  

            <View style={styles.card}>
              <ScrollView style={styles.svw}>
              
                <Text style={styles.label}>Date</Text>
                <View style={styles.inputWrapper}>
                    <TextInput style={styles.input} value={busdate} onChangeText={setBusDate} />
                    <TouchableOpacity onPress={() => setShowCalendar(true)}>
                        <FontAwesome5 name="calendar-alt" size={24} color="#A0A5B1" />  
                    </TouchableOpacity>
                </View>

                {showCalendar && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                            setShowCalendar(false);
                            if (selectedDate) {
                                setDate(selectedDate);
                                setBusDate(selectedDate.toLocaleDateString());
                            }
                            }}
                        />
                        )}

                <Text style={styles.label}>Depature location</Text>
                <View style={styles.inputWrapper}>
                    <TextInput 
                      style={styles.input} 
                      value={pickuploca} 
                      onChangeText={(text) => setpickuploca(text.replace(/\s/g, "").toUpperCase())}
                      autoCapitalize="characters"
                      autoCorrect={false}
                      />
                    <Text style={styles.inputIcon}>📍</Text>
                </View>

                <Text style={styles.label}>Arrival location</Text>
                <View style={styles.inputWrapper}>
                    <TextInput 
                      style={styles.input} 
                      value={dropoffloca} 
                      onChangeText={(text) => setdropoffloca(text.replace(/\s/g, "").toUpperCase())}
                      autoCapitalize="characters"
                      autoCorrect={false} 
                    />
                    <Text style={styles.inputIcon}>📍</Text>
                </View>

                <Text style={styles.label}>Depature Time</Text>
                <View style={styles.inputWrapper}>
                    <TextInput style={styles.input} value={depaturetime} onChangeText={setdepaturetime} />
                    <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                        <Ionicons name="time-outline" size={24} color="#A0A5B1" />
                    </TouchableOpacity>
                </View>

                {showTimePicker && (
                    <DateTimePicker
                    value={time}
                    mode="time"
                    display="default"
                    onChange={onTimeChange}
                    />
                )}    

                <Text style={styles.label}>Arrival Time</Text>
                <View style={styles.inputWrapper}>
                    <TextInput style={styles.input} value={arrivaltime} onChangeText={setarrivaltime} />
                    <TouchableOpacity onPress={() => setShowTimePicker1(true)}>
                        <Ionicons name="time-outline" size={24} color="#A0A5B1" />
                    </TouchableOpacity>
                </View>

                {showTimePicker1 && (
                    <DateTimePicker
                    value={time}
                    mode="time"
                    display="default"
                    onChange={onTimeChange1}
                    />
                )}    

                <Text style={styles.label}>Stops</Text>
                <View style={styles.inputWrapper}>
                    <TextInput 
                      style={styles.input} 
                      value={stops} 
                      onChangeText={(text) => setstops(text.replace(/\s/g, "").toUpperCase())}
                      autoCapitalize="characters"
                      autoCorrect={false}
                      />
                    <Text style={styles.inputIcon}>📍</Text>

                
                </View>
                
      
              </ScrollView>

            </View>
          <TouchableOpacity style={styles.searchButton} onPress={handleAddBus }>
            <LinearGradient
              colors={['#4B6CF5', '#32CD32']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              <Text style={styles.searchButtonText}>Update Schedule</Text>
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

      <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("routes"); setIsSearching(!isSearching); }}>
        <FontAwesome name={isSearching ? "close" : "search"} size={24} color={activeTab  === "routes" ? "#0057D9" : "#8A8A8A"}/>
        <Text style={[ styles.label1,activeTab === "routes" && styles.activeLabel,]}>
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

      <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("routes"); router.push("/admin/index1");}}>
        <Ionicons name="notifications-outline" size={24} color={activeTab === "alerts" ? "#0057D9" : "#8A8A8A"}/>
        <Text style={[styles.label1,activeTab === "alerts" && styles.activeLabel, ]}>
          Alerts
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => {setActiveTab("profile"); router.push("/admin/index1");}}>
        <Feather name="user" size={24} color={activeTab === "profile" ? "#0057D9" : "#8A8A8A"}/>
        <Text style={[styles.label1, activeTab === "profile" && styles.activeLabel,]}>
          Profile
        </Text>
      </TouchableOpacity>
    </View>

      
      <View style={styles.footerGraphic}>
        <LinearGradient
          colors={['#4B6CF5', '#32CD32']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.submitGradient}
        >
        </LinearGradient>
      </View>
      <View style={styles.footerGraphic1}>
        <LinearGradient
          colors={['#4B6CF5', '#32CD32']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
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
    maxHeight: '58%',
    backgroundColor: '#FFF',
    padding: 24,
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

 
 label:{
    color:"#000000",
    fontSize:14,
    marginBottom: 5,
 },

 inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFC',
    borderWidth: 2,
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

  inputIcon: {
    fontSize: 18,
    color: '#999',
  },

  

  
   
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

  svw: {
    width: '100%',  
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
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25, 
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

export default ToursScreen;