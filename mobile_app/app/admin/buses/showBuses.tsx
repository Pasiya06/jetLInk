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
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome, Feather, Fontisto } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Bus {
  _id: string; 
  busId: number; 
  driverNIC: string;
  conductorNIC: string;
  driverD: string;
  conductorD: string;
  busNumber: string;
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

  const handleSearch = () => {
    router.push({
      pathname: "/admin/buses/addBus",
      params: {
        Aid: params.Aid,
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        busType: params.busType,
        busTypeTopic:params.busTypeTopic,
      } 
    });
  };

  

  const deleteBus = async (id: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this bus?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/buses/${id}`, {
                method: "DELETE",
              });

              const result = await response.json();

              if (result.success) {
                Alert.alert("Success", "Bus deleted successfully.");
                loadBuses();
              } else {
                Alert.alert(
                  "Failed",
                  result.message || "Could not complete deletion."
                );
              }
            } catch (error) {
              console.log(error);
              Alert.alert(
                "Error",
                "Server connection failed during deletion handling."
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  
  const renderBusItem = ({ item }: { item: Bus }) => (
    <TouchableOpacity style={styles.friendRow}
      onPress={() =>
        router.push({
          pathname: "/admin/buses/busProfile",
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
      
      <View style={styles.profileCircle}>
        <Fontisto name={"bus"} size={25} color="#32CD32" />
      </View>
      <Text style={styles.friendName}>{item.busNumber}</Text>
      <TouchableOpacity style={styles.iconButton}>
        <MaterialIcons name="location-on" size={32} color="#32CD32" 
        onPress={() =>
        router.push({
          pathname: "/admin/buses/loaction",
          params: {
            Bid: item._id, 
            busId: String(item.busId),
            busNum: item.busNumber,
            chassis: item.chassisNo || "",
            engine: item.engineNo || "",
            colour: item.colour || "",
            fuel: item.fuelType || "",
            serviceDate: item.serviceDate || "",
            licenseDate: item.licenseDate || "",
            emissionDate: item.emissionDate || "",
            busType: item.busType || "",
            busTypeTopic:params.busTypeTopic,

            Aid: params.Aid,
            firstName: params.firstName,
            lastName: params.lastName,
            email: params.email,
          },
        })
      }
      />    
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteBus(item._id)}>
        <Ionicons name="trash" size={30} color="red" />
      </TouchableOpacity>
      
    </TouchableOpacity>
  );

  const filteredBusData = busData.filter(bus => 
    bus.busNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <LinearGradient
                colors={["#173C79","#155B8A","#159B79",]}
          start={{x: 0, y: 0,}}
          end={{x: 1, y: 1,}}
                style={styles.submitGradient1}
          >
          <View style={styles.header}>          
            <TouchableOpacity><Text style={styles.title}>{params.busTypeTopic}</Text></TouchableOpacity>          
          </View>
        </LinearGradient>
        
              
        
        <View style={styles.card}>
          <Text style={styles.cardtitle}>Manage all buses</Text>
          <FlatList style={styles.svw}
            data={filteredBusData}
            renderItem={renderBusItem}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 10 }}
          />

          

        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <LinearGradient
            colors={["#173C79","#155B8A","#159B79",]}
            start={{x: 0, y: 0,}}
            end={{x: 1, y: 1,}}
            style={styles.submitGradient}
          >
            <Text style={styles.searchButtonText}>Add Bus</Text>
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
                    pathname: "/admin/buses/busType",
                    params: {
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
    width: '100%',
    flex: 1,
    maxHeight: '60%',
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