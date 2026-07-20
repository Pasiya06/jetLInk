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
import { 
    Ionicons,  
    Feather, 
    FontAwesome,
    FontAwesome5,
    MaterialCommunityIcons, 
} from '@expo/vector-icons';
import { updateBus } from "../../../services/busService";
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';

const ToursScreen: React.FC = () => {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState('');
  const params = useLocalSearchParams();
  const [chassisNo, setChassisNo] = useState(String(params.chassis || ""));
  const [engineNo, setEngineNo] = useState(String(params.engine || ""));
  const [colour, setColour] = useState(String(params.colour || ""));
  const [serviceDate, setServiceDate] = useState(String(params.serviceDate || ""));
  const [licenseDate, setLicenseDate] = useState(String(params.licenseDate || ""));
  const [emissionDate, setEmissionDate] = useState(String(params.emissionDate || ""));
  const [date, setDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [showCalendar1, setShowCalendar1] = useState<boolean>(false);
  const [showCalendar2, setShowCalendar2] = useState<boolean>(false);
  const handleUpdate = async () => {

    try{
        if (!chassisNo || !engineNo  || !colour || !serviceDate  || !licenseDate || !emissionDate) {
            alert("Please fill required fields");
            return;
        }
        await updateBus(params.Bid as string,{
            chassisNo,
            engineNo,
            colour,
            serviceDate,
            licenseDate,
            emissionDate
        });

        alert("Updated Successfully");

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
    catch(err){

        alert("Update Failed");

    }

}

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
                <Text style={styles.title}>{params.busNumber}</Text>
              </TouchableOpacity>
                      
    
        </View>
      </LinearGradient>      

      <View style={styles.card}>
        <ScrollView style={styles.svw} >
      
            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Chassis No</Text>
                <View style={styles.inputWrapper}>
                <View style={[styles.iconWrap, { backgroundColor: "#F725851A"  }]}>
                    <MaterialCommunityIcons name="car-side" size={18} color="#F72585" />
                </View>
                <TextInput
                    style={styles.input}
                    value={chassisNo}
                    onChangeText={(text) => setChassisNo(text.toUpperCase())}
                    placeholder="CHS987654321"
                    placeholderTextColor="#A0A5B1"
                    autoCapitalize="characters"
                    autoCorrect={false}
                />
                </View>
            </View>

            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Engine No</Text>
                <View style={styles.inputWrapper}>
                <View style={[styles.iconWrap, { backgroundColor: "#FF9F1C1A"  }]}>
                    <MaterialCommunityIcons name="engine" size={18} color="#FF9F1C" />
                </View>
                <TextInput
                    style={styles.input}
                    value={engineNo}
                    onChangeText={(text) => setEngineNo(text.toUpperCase())}
                    placeholder="EN12345678"
                    placeholderTextColor="#A0A5B1"
                    autoCapitalize="characters"
                    autoCorrect={false}
                />
                </View>
            </View>

            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Colour</Text>
                <View style={styles.inputWrapper}>
                <View style={[styles.iconWrap, { backgroundColor: "#2EC4B61A"  }]}>
                    <MaterialCommunityIcons name="palette" size={18} color="#2EC4B6" />
                </View>
                <TextInput
                    style={styles.input}
                    value={colour}
                    onChangeText={(text) => setColour(text.toUpperCase())}
                    placeholder="GREEN"
                    placeholderTextColor="#A0A5B1"
                    autoCapitalize="characters"
                    autoCorrect={false}
                />
                </View>
            </View>

            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Service Date</Text>
                <View style={styles.inputWrapper}>
                    <View style={[styles.iconWrap, { backgroundColor: "#7209B71A"  }]}>
                        <MaterialCommunityIcons name="calendar-check" size={18} color="#7209B7" />
                    </View>
                    <TextInput
                        style={styles.input}
                        value={serviceDate}
                        onChangeText={setServiceDate}
                        placeholder="MM/DD/YYYY"
                        placeholderTextColor="#A0A5B1"
                    />
                    <TouchableOpacity onPress={() => setShowCalendar(true)}>
                        <FontAwesome5 name="calendar-alt" size={24} color="#A0A5B1" />  
                    </TouchableOpacity>
                </View>
                
            </View>

            <View style={styles.fieldContainer}>
                <Text style={styles.label}>License Date</Text>
                <View style={styles.inputWrapper}>
                    <View style={[styles.iconWrap, { backgroundColor: "#3A86FF1A"  }]}>
                        <Ionicons name="calendar-clear" size={18} color="#3A86FF" />
                    </View>
                    <TextInput
                        style={styles.input}
                        value={licenseDate}
                        onChangeText={setLicenseDate}
                        placeholder="MM/DD/YYYY"
                        placeholderTextColor="#A0A5B1"
                    />
                    <TouchableOpacity onPress={() => setShowCalendar1(true)}>
                        <FontAwesome5 name="calendar-alt" size={24} color="#A0A5B1" />  
                    </TouchableOpacity>
                </View>
                
            </View>

            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Emission Date</Text>
                <View style={styles.inputWrapper}>
                    <View style={[styles.iconWrap, { backgroundColor: "#38B0001A"  }]}>
                        <MaterialCommunityIcons name="leaf" size={18} color="#38B000" />
                    </View>
                    <TextInput
                        style={styles.input}
                        value={emissionDate}
                        onChangeText={setEmissionDate}
                        placeholder="MM/DD/YYYY"
                        placeholderTextColor="#A0A5B1"
                    />
                    <TouchableOpacity onPress={() => setShowCalendar2(true)}>
                        <FontAwesome5 name="calendar-alt" size={24} color="#A0A5B1" />  
                    </TouchableOpacity>
                </View>
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
                        setServiceDate(selectedDate.toLocaleDateString()); 
                      }
                    }}
                  />
                )}

                {showCalendar1 && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowCalendar1(false);
                      if (selectedDate) {
                        setDate(selectedDate);
                        setLicenseDate(selectedDate.toLocaleDateString());
                        
                      }
                    }}
                  />
                )}

                {showCalendar2 && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowCalendar2(false);
                      if (selectedDate) {
                        setDate(selectedDate);
                        setEmissionDate(selectedDate.toLocaleDateString()); 
                      }
                    }}
                  />
                )}           
      
        </ScrollView>
       
      
      </View>

      <TouchableOpacity style={styles.searchButton} onPress={handleUpdate}>
        <LinearGradient
          colors={['#4B6CF5', '#32CD32']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.submitGradient}
        >
          <Text style={styles.searchButtonText}>Update</Text>
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
                pathname: "/admin/buses/busProfile",
                params: {
                  Bid: params.Bid,
                        busId: params.busId,
                        busNumber: params.busNumber,
                        chassis: params.chassis || "",
                        engine: params.engine || "",
                        colour: params.colour || "",
                        fuel: params.fuel || "",
                        serviceDate: params.serviceDate || "",
                        licenseDate: params.licenseDate || "",
                        emissionDate: params.emissionDate || "",
                        busType: params.busType || "",
                        busTypeTopic:params.busTypeTopic,

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

      <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("routes"); setIsSearching(!isSearching); }}>
        <FontAwesome name={isSearching ? "close" : "search"} size={24} color={activeTab  === "routes" ? "#0057D9" : "#8A8A8A"}/>
        <Text style={[ styles.label1,activeTab === "routes" && styles.activeLabel,]}>
          Routes
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.centerButton} onPress={() => {setActiveTab("tickets"); router.push({
                    pathname: "/admin/index1",
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
    maxHeight: '68%',
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

 
 fieldContainer: {
    marginBottom: 16,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A4F5C',
    marginBottom: 8,
    marginLeft: 2,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    paddingHorizontal: 12,
    height: 52,
  },

  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: '#1A1D26',
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
    marginBottom:70,  
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