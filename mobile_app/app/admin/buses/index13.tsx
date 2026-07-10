import React, { useState } from 'react';
import { Stack,useRouter,useLocalSearchParams} from "expo-router";
import { 
  StyleSheet, 
  View, 
  Text,
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  Image 
} from 'react-native';
import { 
  AntDesign,
  Ionicons, 
  MaterialCommunityIcons, 
  Feather, 
  FontAwesome6, 
  MaterialIcons, 
  FontAwesome5, 
  FontAwesome } from '@expo/vector-icons';


const ToursScreen: React.FC = () => {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState('');
  const params = useLocalSearchParams();
  
  return (
    <>
    <Stack.Screen options={{ title: "", headerShown: false }} />
    <SafeAreaView style={styles.container}>
      
      <View style={styles.header}>
          
          
          <TouchableOpacity><Text style={styles.title}>{params.busNumber}</Text></TouchableOpacity>
          
          
        </View>

      

      
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/admin/buses/index11",
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
              })
            }
          style={styles.card} 
        >
          <AntDesign name="profile" size={33} color="#32CD32" />
          <Text style={styles.menuLabel}>Profile</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
        </TouchableOpacity>
 
        <TouchableOpacity 
          style={styles.card1} 
          onPress={() =>
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
            })
          }
        >
          <AntDesign name="schedule" size={33} color="#FFA500" />
          <Text style={styles.menuLabel}>Schedule</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card2} 
          onPress={() =>
            router.push({
              pathname: "/admin/buses/index11",
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
            })
          }
        >
          <MaterialIcons name="details" size={33} color="#FF0000" />
          <Text style={styles.menuLabel}>Today Details</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
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

          <TouchableOpacity 
            style={styles.item} 
            onPress={() => { 
              setActiveTab("home"); 
              if (isSearching) {
                setIsSearching(false); 
              }

              else {
                router.push({
                  pathname: "/admin/buses/index3",
                  params: {
                    Aid: params.Aid,
                    firstName: params.firstName,
                    lastName: params.lastName,
                    email: params.email,
                  },                    
                });
              };
            }}
          >
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
    marginLeft: 20,
    marginRight: 20,
    flex: 1,
    maxHeight: '20%',
    backgroundColor: '#FFF',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: -50,   
    alignSelf: 'center',
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  card1: {
    marginLeft: 20,
    marginRight: 20,
    flex: 1,
    maxHeight: '20%',
    backgroundColor: '#FFF',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 30,   
    alignSelf: 'center',
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  card2: {
    marginLeft: 20,
    marginRight: 20,
    flex: 1,
    maxHeight: '20%',
    backgroundColor: '#FFF',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 30,   
    alignSelf: 'center',
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
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

  menuLabel: {
    paddingHorizontal: 25,
    fontSize: 21,
    color: '#0047AB',
    fontWeight: '500',
    flex: 1,
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

export default ToursScreen;