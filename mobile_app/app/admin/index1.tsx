import React, { useState, useEffect } from 'react';
import { Image, TextInput } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import {
  Alert,
  StyleSheet,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  BackHandler,
} from "react-native";

// Icons
import { 
  Ionicons, 
  MaterialIcons, 
  FontAwesome, 
  Feather 
} from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';




export default function Index() {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState('');
  const params = useLocalSearchParams();

  useEffect(() => {
    const backAction = () => {
      handleLogout(); // Navigate to a specific path
      return true; // Prevent default back behavior
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => subscription.remove();
  }, []);

  const handleLogout = () => {
  Alert.alert(
    "Logout",
    "Are you sure you want to logout?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.clear(); // or remove specific keys
          router.replace("/passenger/selectScreen");
        },
      },
    ]
  );
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
              <Text style={styles.title}>Jetlink</Text>
            </TouchableOpacity>
            
            
          </View>
        </LinearGradient>
        
       
        <View style={styles.card}>
          <View>
            <Text style={styles.title1}>Good Morning</Text>                    
          </View> 
        
          <View style={styles.iconContainer1}>
            <Text style={styles.title2}>{params.firstName} {params.lastName}</Text>
            <MaterialIcons name="waving-hand" size={30} color={"#FFA500"} />
          </View>
                          
          <View>
            <Text style={styles.subtitle1}>Welcome to Jetlink Bus Panel</Text>
          </View>
        </View>

        
        <View style={styles.listContainer}>
          
          <TouchableOpacity style={styles.card1} onPress={() => router.push({
                pathname: "/admin/buses/busAndSchedule", 
                params: {
                  Aid: params.Aid,
                  firstName: params.firstName,
                  lastName: params.lastName,
                  email: params.email,
                },
              })} >
              <View style={styles.iconContainer}>
                <Image source ={require("../../assets/images/icons8-bus-94.png")} style={styles.input3dIcon1} />
              </View>
              <Text style={styles.cardText}>Busses</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card2} onPress={() => router.push({
                pathname: "/admin/Parcelhistory/parcelFees", 
                params: {
                  Aid: params.Aid,
                  firstName: params.firstName,
                  lastName: params.lastName,
                  email: params.email,
                },
              })} >
              <View style={styles.iconContainer}>
                <Image source ={require("../../assets/images/icons8-package-94.png")} style={styles.input3dIcon} />
              </View>
              <Text style={styles.cardText}>Parcel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card1} onPress={() => router.push("/admin/buses/index1")} >
              <View style={styles.iconContainer}>
                <Image source ={require("../../assets/images/icons8-beach-94.png")} style={styles.input3dIcon} />
              </View>
              <Text style={styles.cardText}>Tours</Text>              
          </TouchableOpacity>

          <TouchableOpacity style={styles.card2} onPress={() => router.push({
                pathname: "/admin/regpassengers/index1", 
                params: {
                  Aid: params.Aid,
                  firstName: params.firstName,
                  lastName: params.lastName,
                  email: params.email,
                },
              })} >
                
              <View style={styles.iconContainer}>
                <Image source ={require("../../assets/images/icons8-users-94.png")} style={styles.input3dIcon} />
              </View>
              <Text style={styles.cardText}>Passengers</Text>              
          </TouchableOpacity>

          <TouchableOpacity style={styles.card1} onPress={() => router.push({
                pathname: "/admin/Staff/index1", 
                params: {
                  Aid: params.Aid,
                  firstName: params.firstName,
                  lastName: params.lastName,
                  email: params.email,
                },
              })} >
              <View style={styles.iconContainer}>
                <Image source ={require("../../assets/images/icons8-administrator-94.png")} style={styles.input3dIcon} />
              </View>
              <Text style={styles.cardText}>Staff</Text>              
          </TouchableOpacity>

          <TouchableOpacity style={styles.card2} onPress={() => router.push("/admin/buses/index1")} >
              <View style={styles.iconContainer}>
                <Image source ={require("../../assets/images/icons8-hospital-94.png")} style={styles.input3dIcon} />
              </View>
              <Text style={styles.cardText}>Emergency</Text>
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
            ) : (
              <Text style={styles.subHeaderTitle}>{params.busNumber}</Text>
          )}

        <View style={styles.bottomNav}>
        
                  
        
                  <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("home"); handleLogout();}}>
                    <Ionicons name="log-out-outline" size={24} color={activeTab === "home" ? "#0057D9" : "#8A8A8A"}/>
                    
                    <Text style={[styles.label1,activeTab === "home" && styles.activeLabel,]}>
                      Logout
                    </Text>
                  </TouchableOpacity>
        
                  <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("routes"); setIsSearching(!isSearching); }}>
                    <FontAwesome name={isSearching ? "close" : "search"} size={24} color={activeTab  === "routes" ? "#0057D9" : "#8A8A8A"}/>
                    <Text style={[ styles.label1,activeTab === "routes" && styles.activeLabel,]}>
                      Routes
                    </Text>
                  </TouchableOpacity>
        
                  <TouchableOpacity style={styles.centerButton} onPress={() => {setActiveTab("tickets"); router.push({
                            pathname: "/busStaff/index1",
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
}

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
    height: '20%',
    backgroundColor: '#FFF',
    padding: 14,
    borderLeftColor: '#32CD32',
    borderRightColor: '#32CD32',
    borderTopColor: '#32CD32',
    marginTop: -50,   
    alignSelf: 'center',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 2,
    borderRadius: 20,
    elevation: 10,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  iconContainer1: { 
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 15,
  },

  title1: {
    width: '100%',    
    color: '#0047AB',
    fontSize: 16,
    fontWeight: '700',
  },

  title2: {
    color: '#0047AB',
    fontSize: 20,
    fontWeight: '700',
    marginRight: 15,
  },

  subtitle1: {
    color: '#555',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },

  listContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  card1: {
    backgroundColor: '#ffffff',
    width: '48%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    marginBottom: 15,
    borderLeftWidth: 6,
    borderTopColor: '#32CD32',
    borderTopWidth: 2,
    borderLeftColor: '#32CD32',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  card2: {
    backgroundColor: '#ffffff',
    width: '48%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    marginBottom: 15,
    borderTopColor: '#32CD32',
    borderTopWidth: 2,
    borderRightWidth: 6,
    borderRightColor: '#32CD32',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  input3dIcon1: {
    marginRight: 12,
    marginLeft: 19,
    width:35,
    justifyContent: 'center',
    height:35,
    marginTop: 15,
  },

  input3dIcon: {
    marginRight: 12,
    marginLeft: 19,
    width:35,
    justifyContent: 'center',
    marginTop: 25,
    height:35,
    marginBottom: 15,
  },

  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  cardText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#0047AB',
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