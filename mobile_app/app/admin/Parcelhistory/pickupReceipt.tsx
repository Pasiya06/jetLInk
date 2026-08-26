import React, { useState, useCallback } from 'react';
import { Stack, useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import { getSchedules,  } from "../../../services/scheduleServices";
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  TextInput,
   
} from 'react-native';
import { 
  Ionicons, 
  Feather,  
  FontAwesome,
  MaterialCommunityIcons
} from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView } from 'react-native-reanimated/lib/typescript/Animated';



interface parcel {
  _id:string;
  parcelId:string;
  sendername:string;
  Smobilenumber?:string;
  Semail?:string;
  receivername?:string;
  Rmobilenumber?:string;
  Remail?:string;
  weight?:string;
  pickup?:string;
  drop?:string;
  date?:string;
  time?:string;
  Bnumber?:string;
  totalFare?:number;
}


const JetLinkInterface: React.FC = () => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const params = useLocalSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('');
  const [parcelData, setParcelData] = useState<parcel[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const status : string = "PickedUp";

  const getParcelByEmailAndUsed = async () => {
    try {

        const response = await fetch(
        `${API_URL}/parcel/${status}`
        );

        const data = await response.json();

        console.log("Parcel Data:", data);


        if (!response.ok) {
        throw new Error(data.message);
        }


        setParcelData(data.data);


    } catch (error) {

        console.log("Get Parcel Error:", error);

        setParcelData([]);

    }
};

  
    useFocusEffect(useCallback(()=>{getParcelByEmailAndUsed();},[]));
    
    const renderBusItem = ({item}:{item:parcel}) => (
      <TouchableOpacity
        onPress={() => 
          router.push({
            pathname: "/admin/Parcelhistory/parcelLocation",
            params: {
              parId: item._id,
              parcelId: item.parcelId,
              sendername: item.sendername,
              Smobilenumber: item.Smobilenumber || "",
              Semail: item.Semail || "",
              receivername: item.receivername || "",
              Rmobilenumber: item.Rmobilenumber || "",
              Remail: item.Remail || "",
              weight: item.weight || "",
              pickup: item.pickup || "",
              drop: item.drop || "",
              date: item.date || "",
              time: item.time || "",
              Bnumber: item.Bnumber || "",
              totalFare: item.totalFare || "",

              Aid: params.Aid,
                firstName: params.firstName,
                lastName: params.lastName,
                email: params.email,



            },
          })
        }
      >
      <View style={styles.friendRow}>
        <View style={styles.icon}>
          <View style={[styles.iconWrap, { backgroundColor: "#F59E0B18" }]}>
            <Feather name="gift" size={50} color="#F59E0B" />
          </View>
          <View>
            <Text style={styles.friendName1}>{item.parcelId}</Text>
            <Text style={styles.friendName}>{item.pickup} - {item.drop}</Text>
            <Text style={styles.friendName}>{item.date} - {item.time}</Text>
            <Text style={styles.friendName}>{item.Bnumber}</Text>
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC"  />
        
      </View>
      </TouchableOpacity>
    );
  
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
            <Text style={styles.cardtitle}>Select a parcel for tracking</Text>
            <FlatList style={styles.svw}
                data={parcelData}
                renderItem={renderBusItem}
                keyExtractor={(item)=>item.parcelId}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 10 }}
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
                        pathname: "/admin/Parcelhistory/receiptType",
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

      {/* Bottom Graphic Design Element */}
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
    width: '100%',
    flex: 1,
    maxHeight: '90%',
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 55,
    borderTopRightRadius: 55,
    marginTop: -50,   
    alignSelf: 'center',
  },

  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  tabContainer: {
    marginLeft: 25,
    marginRight: 25,
    backgroundColor: '#F2F4F5',
    borderRadius: 12,
    flexDirection: 'row',
    padding: 6,
    marginTop: 22,
    marginBottom: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeTabButton: {
    backgroundColor: '#32CD32',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0056b3',
  },
  activeTabButtonText: {
    color: '#FFF',
  },

  svw: {
    
    width: '100%',
    marginBottom:150,
    marginTop: 3, 
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25, 
  },

  cardtitle:{
    marginTop:10,
    fontSize: 20,
    fontWeight: '800',
    color: '#999797',
    letterSpacing: 0.5,
  },

  friendRow: {
    backgroundColor: '#ffffff',
    flexDirection: "row",
    alignItems: "center",
    //alignSelf: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: '#32CD32',
    marginLeft:20,
    marginRight:20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4, },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  textline0:{
    flex: 1,
    
    

  },

  textline10:{
    justifyContent: 'space-between', 
    flexDirection: 'row',

  },

  textline1:{
    
    
    
  },

  textline2:{
    marginLeft: 50, 
    
    
  },

  friendName: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },

  friendName1: {
    fontSize: 20,
    color: '#0047AB',
    fontWeight: '500',
  },


  icon: { 
    flex: 1,
    flexDirection: 'row',
    
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

export default JetLinkInterface;