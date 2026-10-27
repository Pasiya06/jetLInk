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

import { Ionicons, MaterialIcons, FontAwesome, Feather, Entypo } from '@expo/vector-icons';
import {getConductors, deleteConductor,} from "../../../services/conductorService";
import { LinearGradient } from 'expo-linear-gradient';
import AlertBadge from "../../../components/AlertBadge";
interface Conductor {
  _id: string;
  conductorId: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  NIC: string;
  Birthday: string;
  email: string;
  password: string;
}

const BusScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState('');
  const [conductors, setConductors] = useState<Conductor[]>([]);
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  
  
  const loadConductors = async () => {
  try {
    const response = await getConductors();
    setConductors(response.data);
  } catch (error) {
    console.log(error);
    Alert.alert("Error", "Failed to load conductors.");
  }
};

useFocusEffect(
  useCallback(() => {
    loadConductors();
  }, [])
);

  const handleSearch = () => {
    router.push({
      pathname: "/admin/Staff/index6",
      params: {
        Aid: params.Aid,
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
      } 
    });
  };

    const handleDeleteConductor = async (id: string) => {
      Alert.alert(
        "Confirm Delete",
        "Are you sure you want to delete this conductor?",
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
                const result = await deleteConductor(id);

                if (result.success) {
                  Alert.alert("Success", "Conductor deleted successfully.");
                  loadConductors();
                } else {
                  Alert.alert("Failed", result.message);
                }
              } catch (error) {
                console.log(error);
                Alert.alert("Error", "Server connection failed.");
              }
            },
          },
        ],
        { cancelable: true }
      );
    };
  
  const renderConductorItem = ({ item }: { item: Conductor }) => (
  <TouchableOpacity
    style={styles.friendRow}
    onPress={() =>
      router.push({
        pathname: "/admin/Staff/conductorProfile",
        params: {
          Cid: item._id,
          conductorId: String(item.conductorId),
          cfirstName: item.firstName,
          clastName: item.lastName,
          phoneNumber: item.phoneNumber,
          address: item.address,
          NIC: item.NIC,
          Birthday: item.Birthday,
          cemail: item.email,
          password: item.password || "",

          Aid: params.Aid,
          firstName: params.firstName,
          lastName: params.lastName,
          Email: params.email,
        },
      })
    }
  >
    <View style={styles.profileCircle}>
      <Entypo name="user" size={25} color="#32CD32" />
    </View>

    <Text style={styles.friendName}>
      {item.firstName} {item.lastName}
    </Text>

    <TouchableOpacity
      onPress={() => handleDeleteConductor(item._id)}
    >
      <Ionicons name="trash" size={30} color="red" />
    </TouchableOpacity>
  </TouchableOpacity>
);

  const filteredConductors = conductors.filter((conductor) =>
  `${conductor.firstName} ${conductor.lastName}`
    .toLowerCase()
    .includes(searchQuery.toLowerCase())
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
          <TouchableOpacity><Text style={styles.title}>Conductors</Text></TouchableOpacity>          
        </View>
        </LinearGradient>      
        
        <View style={styles.card}>
          <Text style={styles.cardtitle}>Manage all Conductors</Text>
          <FlatList style={styles.svw}
            data={filteredConductors}
            renderItem={renderConductorItem}
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
            <Text style={styles.searchButtonText}>Add Conductor</Text>
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
                    pathname: "/admin/Staff/index1",
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
    borderWidth: 0.5,
    borderColor: '#32CD32',
   
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