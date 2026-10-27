import React, { useState, useCallback } from 'react';
import { Stack, useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Alert ,
  StyleSheet,
  View,
  Text,
  TextInput, 
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ScrollView,
} from 'react-native';
import {Ionicons, 
  MaterialCommunityIcons, 
  Fontisto, 
  FontAwesome6, 
  Entypo, 
  Feather, 
  FontAwesome} from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AlertBadge from "../../../components/AlertBadge";
import { ScreenHeader, SearchBox, SectionLabel, Pill, EmptyState, Avatar, C, ui } from "../../../components/JetUI";


interface pasenger {
  id:string;
  firstName:string;
  lastName:string;
  phoneNumber?:string;
  address?:string;
  NIC?:string;
  Birthday?:string;
  gender?:string;
  email?:string;
  password?:string;
}

const RGScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [passengerData, setPassengerData] = useState<pasenger[]>([]);
  const [activeTab, setActiveTab] = useState('');

  const loadPassengers = async () => {
  try {
    const response = await fetch(`${API_URL}/passengers`);
    const result = await response.json();

    if (result.success) {
      const formatted = result.data.map((item: any) => ({
        id: item._id,
        firstName: item.firstName,
        lastName: item.lastName,
        phoneNumber: item.phoneNumber,
        address: item.address,
        NIC: item.NIC,
        Birthday: item.Birthday,
        gender: item.gender,
        email: item.email,
        password: item.password,
      }));

      setPassengerData(formatted);
    }
  } catch (error) {
    console.log(error);
  }
};

useFocusEffect(
  useCallback(() => {
    loadPassengers();
  }, [])
);

const deletePassenger = async (id: string) => {
  Alert.alert(
    "Confirm Delete",
    "Are you sure you want to delete this passenger?",
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
            const response = await fetch(`${API_URL}/passengers/${id}`, {
              method: "DELETE",
            });

            const result = await response.json();

            if (result.success) {
              Alert.alert("Success", result.message);
              loadPassengers();
            } else {
              Alert.alert("Error", result.message);
            }
          } catch (error) {
            console.log(error);
            Alert.alert("Error", "Unable to delete passenger.");
          }
        },
      },
    ],
    { cancelable: true }
  );
};

  
  
  

  const renderBusItem = ({item}:{item:pasenger}) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/admin/regpassengers/index2",
          params: {
            id: item.id,
            pfirstName: item.firstName,
            plastName: item.lastName,
            phoneNumber: item.phoneNumber || "",
            address: item.address || "",
            NIC: item.NIC || "",
            pemail: item.email || "",

            Aid: params.Aid,
            firstName: params.firstName,
            lastName: params.lastName,
            email: params.email,

            
          },
        })
      }
    >
    <View style={styles.friendRow}>
      <Avatar name={`${item.firstName} ${item.lastName}`} size={44} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.friendName} numberOfLines={1}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.friendSub} numberOfLines={1}>
          {item.NIC ? `NIC ${item.NIC}` : item.email || item.phoneNumber || "Passenger"}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={()=>deletePassenger(item.id)}
        accessibilityLabel={`Remove ${item.firstName} ${item.lastName}`}
      >
        <Ionicons name="trash-outline" size={21} color={C.red}/>
      </TouchableOpacity>
    </View>
    </TouchableOpacity>
  );

  const shownPassengers = passengerData.filter((p) =>
    [p.firstName, p.lastName, p.NIC, p.email, p.phoneNumber]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase())
  );

  return (

    <>
    <Stack.Screen options={{ title: "", headerShown: false }} />
    <SafeAreaView style={styles.container}>
      <ScreenHeader eyebrow="Manage all passengers" title="Passengers" />

      <View style={[ui.body, { paddingHorizontal: 16 }]}>
        <SearchBox value={searchQuery} onChangeText={setSearchQuery} placeholder="Name, NIC, email or phone" />
        <SectionLabel style={{ marginTop: 18, marginBottom: 10 }} right={<Pill text={`${shownPassengers.length} registered`} />}>
          Registered
        </SectionLabel>
        <FlatList
          style={{ flex: 1 }}
          data={shownPassengers}
          renderItem={renderBusItem}
          keyExtractor={(item)=>item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 190 }}
          ListEmptyComponent={
            <EmptyState
              icon={<Ionicons name="people-outline" size={28} color={C.amber} />}
              title={passengerData.length ? "No matches" : "No passengers yet"}
              subtitle={passengerData.length ? "Try a different name or NIC." : "Registered passengers will appear here."}
            />
          }
        />
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
                    pathname: "/admin/index1",
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
    backgroundColor:C.bg
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
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flex: 1,
    maxHeight: '70%',
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
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: 10,
    borderRadius: 18,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#0F1B2D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
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

  friendName: { fontSize: 16, color: C.ink, fontWeight: '800' },
  friendSub: { fontSize: 12, color: C.muted, fontWeight: '500', marginTop: 1 },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#FDF1F1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconButton: { 
    marginRight: 10 
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

export default RGScreen;