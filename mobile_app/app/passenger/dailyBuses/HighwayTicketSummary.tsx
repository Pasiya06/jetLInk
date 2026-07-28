import React from 'react';
import  { useState,useEffect } from 'react';
import { Stack,useRouter,useLocalSearchParams} from "expo-router";
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  TextInput,
  Alert
} from 'react-native';
import { 
  Ionicons, 
  MaterialIcons, 
  MaterialCommunityIcons, 
  FontAwesome, 
  Feather } from '@expo/vector-icons';

import { LinearGradient } from 'expo-linear-gradient';

const ParcelService = () => {
    const API_URL = process.env.EXPO_PUBLIC_API_URL;
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const params = useLocalSearchParams();
    const seatNumbers:string = "Not";
    const [activeTab, setActiveTab] = useState('');
    const router = useRouter();

    const selectedSeatNumbers = params.seatNumbers ? JSON.parse(params.seatNumbers as string): [];

    const total = (
        Number(params.ticketPrice || 0) *
        Number(params. seatCount || 0) 
    ).toFixed(2);
    
    const handleSearch = () => {
        router.push({
            pathname: "/passenger/dailyBuses/paymentGateway",
            params:{ 
                Pid: params.Pid,
                Pid1: params.Pid1,
                pfirstName: params.pfirstName,
                plastName:params.plastName,
                pphoneNumber: params.pphoneNumber,
                pemail: params.pemail,
                pickup:params.pickup,
                drop:params.drop,
                date:params.date,
                time:params.time,
                bNumber:params.bNumber,
                busType:params.busType,
                seatNumbers:params.seatNumbers,
                noOfTicket:params.seatCount,
                totalFare:total,
            } 
            
        });
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

        <View style={styles.card} >
            <View style={styles.svw1}> 
                <Text style={styles.sectionHeader}>Ticket Summary</Text>
                
                <View style={styles.detailRow}>
                    <View style={[styles.iconWrap, { backgroundColor: '#FACC1520' }]}>
                    <Ionicons name="location-outline" size={18} color='#FACC15' />
                    </View>
                    <View style={styles.detailTextWrap}>
                    <Text style={styles.detailLabel}>Pickup Location</Text>
                    <Text style={styles.detailValue}>{params.pickup}</Text>
                    </View>
                    <View style={[styles.iconWrap, { backgroundColor: '#22C55E20' }]}>
                    <Ionicons name="flag-outline" size={18} color='#22C55E' />
                    </View>
                    <View style={styles.detailTextWrap}>
                    <Text style={styles.detailLabel}>Drop Location</Text>
                    <Text style={styles.detailValue}>{params.drop}</Text>
                    </View>
                </View>

                <View style={styles.detailRow}>
                    <View style={[styles.iconWrap, { backgroundColor: '#3B82F620' }]}>
                    <Ionicons name="calendar-outline" size={18} color='#3B82F6' />
                    </View>
                    <View style={styles.detailTextWrap}>
                    <Text style={styles.detailLabel}>Date</Text>
                    <Text style={styles.detailValue}>{params.date}</Text>
                    </View>
                    <View style={[styles.iconWrap, { backgroundColor: '#8B5CF620' }]}>
                    <Ionicons name="time-outline" size={18} color='#8B5CF6' />
                    </View>
                    <View style={styles.detailTextWrap}>
                    <Text style={styles.detailLabel}>Time</Text>
                    <Text style={styles.detailValue}>{params.time}</Text>
                    </View>
                    
                </View>

                <View style={styles.detailRow}>
                    
                    <View style={[styles.iconWrap, { backgroundColor: '#F9731620' }]}>
                    <MaterialCommunityIcons name="car-seat" size={18} color='#F97316' />
                    </View>
                    <View style={styles.detailTextWrap}>
                    <Text style={styles.detailLabel}>Seat Numbers</Text>
                    <Text style={styles.detailValue}>{selectedSeatNumbers.join(", ")}</Text>
                    </View>
                    
                </View>

            </View>      
        </View>

        <View style={styles.card2} >
            <View style={styles.svw}>

                <View style={styles.row}>
                    <View style={styles.rowLeft}>
                    <View style={[styles.iconWrap1, { backgroundColor: '#7ED32120' }]}>
                        <Ionicons name ="ticket-outline" size={18} color='#7ED321' />
                    </View>
                    <Text style={styles.detailLabel1}>Ticket Price</Text>
                    </View>
                    <Text style={styles.value}>Rs. {params.ticketPrice}</Text>
                </View>

                <View style={styles.row}>
                    <View style={styles.rowLeft}>
                    <View style={[styles.iconWrap1, { backgroundColor: '#FACC1520' }]}>
                        <MaterialIcons name="format-list-numbered" size={18} color='#FACC15' />
                    </View>
                    <Text style={styles.detailLabel1}>No of Seats</Text>
                    </View>
                    <Text style={styles.value}>{params.seatCount}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>Rs. {total}</Text>
                </View>

            </View>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSearch}>
            <LinearGradient
                colors={['#4B6CF5', '#32CD32']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGradient}
            >
            <Text style={styles.submitText}>Submit payment</Text>
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
                    pathname: "/passenger/dailyBuses/selectSeat",
                    params: {
                        Pid: params.Pid,
                        Pid1: params.Pid1,
                        pfirstName: params.pfirstName,
                        plastName:params.plastName,
                        pphoneNumber: params.pphoneNumber,
                        pemail: params.pemail,
                        pickup:params.pickup,
                        drop:params.drop,
                        date:params.date,
                        time:params.depaturetime,
                        bNumber:params.bNumber,
                        busType:params.busType,
                        seatCount: params.seatCount,
                        seatNumbers: params.seatNumbers,
                        ticketPrice:params.ticketPrice,
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
                    pathname: "/passenger/index1",
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
            
    </SafeAreaView></>
    
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
    paddingTop:10,
    marginLeft: 20,
    marginRight: 20,
    flex: 1,
    maxHeight: '25%',
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
    paddingTop:10,
    marginLeft: 20,
    marginRight: 20,
    flex: 1,
    maxHeight: '13%',
    backgroundColor: '#FFF',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 15,   
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
    marginTop: 15,   
    alignSelf: 'center',
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  sectionHeader: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4B6CF5",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 15,
    
  },

  row: {
    marginLeft: 20,
    marginRight: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },

  label: {
    marginLeft: 20,
    fontSize: 14,
    color: '#4B6CF5',
    fontWeight: '500',
  },

  value: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
  },

  divider: {
    marginLeft: 20,
    marginRight: 20,
    height: 1,
    backgroundColor: '#515151a0',
    marginVertical: 8,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },

  totalLabel: {
    marginLeft: 20,
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  totalValue: {
    marginRight: 20,
    fontSize: 18,
    fontWeight: '800',
    color: '#4A90E2',
  },

  svw: {
    width: '100%',  
    
  },

  svw1: {
    width: '100%',  
    alignItems: 'center', 
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginLeft: 20,
  },

  iconWrap1: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  detailTextWrap: {
    marginLeft: 12,
    flex: 1,
  },

  detailLabel: {
    fontSize: 12,
    color: '#8A8A8A',
    fontWeight: '500',
    marginBottom: 2,
  },

  detailLabel1: {
    fontSize: 12,
    color: '#8A8A8A',
    fontWeight: '500',
    marginBottom: 2,
    marginLeft: 20,
  },

  detailValue: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '600',
  },

  
  inputWrapper: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    backgroundColor: '#F2F4F5',
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

  submitButton: {
    
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

   submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
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

export default ParcelService;