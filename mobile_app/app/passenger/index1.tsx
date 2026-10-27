import React, { useState, useEffect } from 'react';
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import {
  Alert,
  StyleSheet,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image, 
  TextInput,
  BackHandler 
} from "react-native";

// Icons
import { 
  Ionicons, 
  Feather, 
  MaterialCommunityIcons, 
  FontAwesome, 
  MaterialIcons, 
  FontAwesome5,
  SimpleLineIcons 
} from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenHeader, SectionLabel, Tile, Avatar, C, ui } from "../../components/JetUI";




export default function Index() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return "Good Morning ";
    } else if (hour >= 12 && hour < 17) {
      return "Good Afternoon ";
    } else if (hour >= 17 && hour < 21) {
      return "Good Evening ";
    } else {
      return "Good Night 🌙";
    }
  };

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

  const tourinterface = () => {
    router.push({
      pathname: "/passenger/tours/index1",
      params: {
        Pid: params.Pid,
        Pid1: params.Pid1,
        pfirstName: params.pfirstName,
        plastName:params.plastName,
        pphoneNumber: params.pphoneNumber,
        pemail: params.pemail,
      },
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#0056b3" />
      <SafeAreaView style={styles.container}>
        {/* Header Section */}
        <ScreenHeader eyebrow="Passenger" title="JetLink" />

        <ScrollView style={ui.body} contentContainerStyle={ui.bodyContent} showsVerticalScrollIndicator={false}>
          <View style={[ui.card, styles.welcomeCard]}>
            <Avatar name={`${params.pfirstName ?? ""} ${params.plastName ?? ""}`} size={56} />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.title1}>{getGreeting()}</Text>
              <Text style={styles.title2} numberOfLines={1} adjustsFontSizeToFit>
                {params.pfirstName} {params.plastName}
              </Text>
              <Text style={styles.subtitle1}>Welcome to the Jetlink bus panel</Text>
            </View>
          </View>

          <SectionLabel>What do you need?</SectionLabel>

          <View style={ui.grid}>
            <Tile
              icon={<FontAwesome5 name="bus-alt" size={20} color={C.purple} />}
              iconBg={C.purpleSoft}
              title="Buses"
              subtitle="Search & book seats"
              onPress={() =>
                router.push({
                  pathname: "/passenger/dailyBuses/searchBus",
                  params: {
                    Pid: params.Pid,
                    Pid1: params.Pid1,
                    pfirstName: params.pfirstName,
                    plastName:params.plastName,
                    pphoneNumber: params.pphoneNumber,
                    address: params.address,
                    NIC: params.NIC,
                    pemail: params.pemail,
                  },
                })
              }
            />
            <Tile
              icon={<Feather name="gift" size={21} color={C.amber} />}
              iconBg={C.amberSoft}
              title="Parcel"
              subtitle="Send a parcel"
              onPress={() =>
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
                })
              }
            />
            <Tile
              icon={<FontAwesome5 name="route" size={20} color="#B42335" />}
              iconBg="#FDE8EA"
              title="Tours"
              subtitle="Book a tour bus"
              onPress={tourinterface}
            />
            <Tile
              icon={<SimpleLineIcons name="people" size={20} color={C.green} />}
              iconBg={C.greenSoft}
              title="Friend"
              subtitle="Find a friend's bus"
              onPress={() =>
                router.push({
                  pathname: "/passenger/friend/index1",
                  params: {
                    Pid: params.Pid,
                    Pid1: params.Pid1,
                    pfirstName: params.pfirstName,
                    plastName: params.plastName,
                    pphoneNumber: params.pphoneNumber,
                    pemail: params.pemail,
                    NIC: params.NIC
                  }
                })
              }
            />
            <Tile
              icon={<FontAwesome5 name="receipt" size={19} color={C.lime} />}
              iconBg={C.limeSoft}
              title="Receipt"
              subtitle="Your receipts"
              onPress={() =>
                router.push({
                  pathname: "/passenger/receipt/index1",
                  params: {
                    Pid: params.Pid,
                    Pid1: params.Pid1,
                    pfirstName: params.pfirstName,
                    plastName:params.plastName,
                    pphoneNumber: params.pphoneNumber,
                    pemail: params.pemail,
                  },
                })
              }
            />
            <Tile
              icon={<Ionicons name="ticket-outline" size={22} color={C.pink} />}
              iconBg={C.pinkSoft}
              title="Tickets"
              subtitle="Active & used"
              onPress={() =>
                router.push({
                  pathname: "/passenger/ticket/normalwayAndHighway",
                  params: {
                    Pid: params.Pid,
                    Pid1: params.Pid1,
                    pfirstName: params.pfirstName,
                    plastName:params.plastName,
                    pphoneNumber: params.pphoneNumber,
                    pemail: params.pemail,
                  },
                })
              }
            />
          </View>
        </ScrollView>

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
                      Search
                    </Text>
                  </TouchableOpacity>
        
                  <TouchableOpacity style={styles.centerButton} onPress={() => {setActiveTab("tickets"); }} > 
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
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

  title1: { color: C.muted, fontSize: 13, fontWeight: '600' },

  title2: { color: C.navy, fontSize: 20, fontWeight: '800', marginTop: 1 },

  subtitle1: { color: C.muted, fontSize: 12, fontWeight: '500', marginTop: 2 },
  welcomeCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 22 },

  listContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  card1: {
    paddingLeft:10,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    width: '48%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    marginBottom: 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  card2: {
    paddingLeft:10,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    width: '48%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    marginBottom: 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
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
    color: '#000000',
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