import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
   SafeAreaView,
  ScrollView
} from "react-native";

import {  } from "react-native-safe-area-context";
import { Stack,useRouter,useLocalSearchParams } from "expo-router";
import { Ionicons, FontAwesome, Feather } from '@expo/vector-icons';



const AddBus = () => {
 
  const [busdate, setBusDate] = useState("");
  const [pickuploca, setpickuploca] = useState("");
  const [dropoffloca, setdropoffloca] = useState("");
  const [depaturetime, setdepaturetime] = useState("");
  const [arrivaltime, setarrivaltime] = useState("");
  const [stops, setstops] = useState("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState('');
  const params = useLocalSearchParams();
  const router = useRouter();
  const busNumber = params.busNumber as string;
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const handleAddBus = async () => {
  try {
    const response = await fetch(`${API_URL}/schedules`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        busdate,
        pickuploca,
        dropoffloca,
        depaturetime,
        arrivaltime,
        stops,
        busNo: busNumber,
      }),
    });

    const data = await response.json();

    if (data.success) {
      alert("Schedule Added Successfully");

      router.push({
        pathname: "/admin/buses/index20",
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

                Aid: params.Aid,
                firstName: params.firstName,
                lastName: params.lastName,
                email: params.email,
        },
      });
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.log(error);
    alert("Server Error");
  }
};

  return (
    <>
    <Stack.Screen options={{ title: "", headerShown: false }} />
    <SafeAreaView style={styles.container}>
      
      <View style={styles.header}>
          <TouchableOpacity>
            <Ionicons name="menu" size={30} color="#ffffff" />
          </TouchableOpacity>
          
          <TouchableOpacity><Text style={styles.title}>Jetlink</Text></TouchableOpacity>
          
          <TouchableOpacity>
            <Ionicons name="notifications" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

      
      <View style={styles.card}>
        <ScrollView style={styles.svw}>
        
        <Text style={styles.label}>Date</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} value={busdate} onChangeText={setBusDate} />
            <Text style={styles.inputIcon}>📍</Text>
          </View>

          <Text style={styles.label}>Depature location</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} value={pickuploca} onChangeText={setpickuploca} />
            <Text style={styles.inputIcon}>📍</Text>
          </View>

          <Text style={styles.label}>Arrival location</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} value={dropoffloca} onChangeText={setdropoffloca} />
            <Text style={styles.inputIcon}>📍</Text>
          </View>

          <Text style={styles.label}>Depature Time</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} value={depaturetime} onChangeText={setdepaturetime} />
            <Text style={styles.inputIcon}>📍</Text>
          </View>

          <Text style={styles.label}>Arrival Time</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} value={arrivaltime} onChangeText={setarrivaltime} />
            <Text style={styles.inputIcon}>📍</Text>
          </View>

          <Text style={styles.label}>Stops</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} value={stops} onChangeText={setstops} />
            <Text style={styles.inputIcon}>📍</Text>

          
          </View>

          

          </ScrollView>

          <TouchableOpacity style={styles.searchButton} onPress={handleAddBus }>
            <Text style={styles.searchButtonText}>Add Schedule</Text>
          </TouchableOpacity>

      </View>




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
                pathname: "/admin/buses/index20",
                params: {
                  Aid: params.Aid,
                  firstName: params.firstName,
                  lastName: params.lastName,
                  email: params.email,

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

      <TouchableOpacity style={styles.centerButton} onPress={() => {setActiveTab("tickets"); router.push("/admin/index1");}} > 
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
      <View style={styles.blueCurve} />
      <View style={styles.greenCurve} />
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
    backgroundColor: '#0047AB',
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

  label:{
    color:"#0047AB",
    fontSize:14,
    marginBottom: 5,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#32CD32',
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
    position: "absolute",
    bottom: 15,
    left: 10,
    right: 10,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
      
    height: 55,
    backgroundColor: "#32CD32",
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

  svw: {
    width: '100%',
    marginBottom:70,  
  },

  footerGraphic: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 60,
    overflow: 'hidden',
  },

  blueCurve: {
    backgroundColor: '#ffffff',
    height: 90,
    width: '100%',
    borderRadius: 50,
    position: 'absolute',  
  },

  greenCurve: {
    backgroundColor: '#0052cc',
    height: 100,
    width: '100%',
    borderRadius: 25,
    position: 'absolute',   
  },


});


export default AddBus;