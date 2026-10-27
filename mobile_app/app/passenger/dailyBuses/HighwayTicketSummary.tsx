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
  Alert,
  ScrollView,
} from 'react-native';
import SearchPanel from "../../../components/SearchPanel";
import { 
  Ionicons, 
  MaterialIcons, 
  MaterialCommunityIcons, 
  FontAwesome, 
  Feather } from '@expo/vector-icons';

import { LinearGradient } from 'expo-linear-gradient';
import { ScreenHeader, SectionLabel, Pill, GradientButton, C, ui } from "../../../components/JetUI";

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
                NIC: params.NIC,
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
       
        <ScreenHeader eyebrow="Review & pay" title="Ticket summary" />

        <ScrollView style={ui.body} contentContainerStyle={ui.bodyContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Trip card */}
          <View style={[ui.card, styles.tripCard]}>
            <View style={styles.tripTop}>
              <Pill text={String(params.busType) === "Highway" ? "Highway" : "Normal"} />
              <View style={styles.busTag}>
                <Ionicons name="bus-outline" size={15} color={C.blue} />
                <Text style={styles.busTagText}>{params.bNumber}</Text>
              </View>
            </View>

            <View style={styles.routeRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.routeLabel}>From</Text>
                <Text style={styles.routePlace} numberOfLines={1}>{params.pickup}</Text>
              </View>
              <View style={styles.routeIcon}>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.routeLabel}>To</Text>
                <Text style={styles.routePlace} numberOfLines={1}>{params.drop}</Text>
              </View>
            </View>

            <View style={styles.tripMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={16} color={C.muted} />
                <Text style={styles.metaText}>{params.date}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color={C.muted} />
                <Text style={styles.metaText}>{params.time}</Text>
              </View>
            </View>
          </View>

          {/* Seats */}
          <SectionLabel>Your seats</SectionLabel>
          <View style={[ui.card, styles.seatsCard]}>
            {selectedSeatNumbers.map((n: number | string) => (
              <View key={String(n)} style={styles.seatChip}>
                <MaterialCommunityIcons name="car-seat" size={16} color={C.blue} />
                <Text style={styles.seatChipText}>{n}</Text>
              </View>
            ))}
          </View>

          {/* Price */}
          <SectionLabel>Payment</SectionLabel>
          <View style={[ui.card, styles.priceCard]}>
            <View style={styles.row}>
              <Text style={styles.priceLabel}>Ticket price</Text>
              <Text style={styles.value}>Rs. {params.ticketPrice}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.priceLabel}>Seats</Text>
              <Text style={styles.value}>× {params.seatCount}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>Rs. {total}</Text>
            </View>
          </View>

          <GradientButton label={`Pay Rs. ${total}`} icon="card-outline" onPress={handleSearch} />
        </ScrollView>

        <SearchPanel
          visible={isSearching}
          query={searchQuery}
          onChangeQuery={setSearchQuery}
          onClose={() => { setIsSearching(false); setSearchQuery(""); }}
          role={"passenger"}
          params={params}
        />
      
        <View style={styles.bottomNav}>

          

          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("home"); if (isSearching) {
                  setIsSearching(false); setSearchQuery(""); 
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
                        NIC: params.NIC,
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

          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("routes"); if (isSearching) setSearchQuery(""); setIsSearching(!isSearching); }}>
            <FontAwesome name={isSearching ? "close" : "search"} size={24} color={activeTab  === "routes" ? "#0057D9" : "#8A8A8A"}/>
            <Text style={[ styles.label1,activeTab === "routes" && styles.activeLabel,]}>
              Search
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
                      NIC: params.NIC,
                    },                    
                  });}} > 
            <Ionicons name="home-outline" size={28} color="#fff" />             
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => { router.push({ pathname: "/notifications", params: { role: "passenger" } });}}>
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
            
    </SafeAreaView></>
    
  );
};

const styles = StyleSheet.create({
  seatChipText: { fontSize: 15, fontWeight: '800', color: C.blue },
  seatChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.blueSoft, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  seatsCard: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 16, borderRadius: 22 },
  countInput: { width: 46, height: 44, textAlign: 'center', fontSize: 20, fontWeight: '800', color: C.ink, padding: 0 },
  stepBtnPlus: { backgroundColor: C.blue },
  stepBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: C.blueSoft, alignItems: 'center', justifyContent: 'center' },
  countSub: { fontSize: 12, fontWeight: '500', color: C.muted, marginTop: 2 },
  countTitle: { fontSize: 15, fontWeight: '800', color: C.ink },
  countCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 22, gap: 8 },
  priceLabel: { fontSize: 14, fontWeight: '600', color: C.muted },
  priceCard: { padding: 18, borderRadius: 22 },
  metaText: { fontSize: 14, fontWeight: '700', color: C.ink },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tripMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTopWidth: 1.5, borderTopColor: C.line, borderStyle: 'dashed' },
  routeIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#159B79', alignItems: 'center', justifyContent: 'center', marginHorizontal: 10 },
  routePlace: { fontSize: 18, fontWeight: '800', color: C.navy, marginTop: 2 },
  routeLabel: { fontSize: 12, fontWeight: '700', color: C.muted },
  routeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
  busTagText: { fontSize: 14, fontWeight: '800', color: C.ink, letterSpacing: 0.5 },
  busTag: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tripTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tripCard: { padding: 18, borderRadius: 24 },
  container: { flex: 1, backgroundColor: C.bg },

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
    maxHeight: '38%',
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

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },

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

  value: { fontSize: 15, fontWeight: '800', color: C.ink },

  divider: { height: 1, backgroundColor: C.line, marginVertical: 10 },

  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  totalLabel: { fontSize: 16, fontWeight: '800', color: C.ink },

  totalValue: { fontSize: 22, fontWeight: '800', color: C.blue },

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