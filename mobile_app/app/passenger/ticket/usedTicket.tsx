import React from 'react';
import  { useState } from 'react';
import { Stack,useRouter,useLocalSearchParams} from "expo-router";
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  TextInput,
  ScrollView,
} from 'react-native';
import { 
  Ionicons, 
  MaterialCommunityIcons, 
  FontAwesome, Feather, 
  MaterialIcons} 
from '@expo/vector-icons'; 
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenHeader, C, ui } from "../../../components/JetUI";

const ParcelService = () => {
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const params = useLocalSearchParams();
  const selectedSeatNumbers = params.seatNumbers ? JSON.parse(params.seatNumbers as string): [];
  const [activeTab, setActiveTab] = useState('');
  const router = useRouter();
  
  const seatNumber = () => {
    if (params.busType === "Highway") {
      return selectedSeatNumbers.join(", ");
    }
    else{
      return "Can't book seat";
    }
  };
    
  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <ScreenHeader eyebrow="Used ticket" title={String(params.ticketId ?? "Ticket")} />

        <ScrollView style={ui.body} contentContainerStyle={ui.bodyContent} showsVerticalScrollIndicator={false}>
          <View style={styles.pass}>
          <View style={styles.passTop}>
            <View style={styles.passRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.passLabel}>From</Text>
                <Text style={styles.passPlace} numberOfLines={1}>{params.pickup}</Text>
              </View>
              <View style={styles.passIcon}>
                <Ionicons name="bus" size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.passLabel}>To</Text>
                <Text style={styles.passPlace} numberOfLines={1}>{params.drop}</Text>
              </View>
            </View>
          </View>
          <View style={styles.stamp}>
            <Ionicons name="checkmark-done" size={15} color="#5B6B7F" />
            <Text style={styles.stampText}>USED</Text>
          </View>

          <View style={styles.perf}>
            <View style={styles.notchL} />
            <View style={styles.perfLine} />
            <View style={styles.notchR} />
          </View>

          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Date</Text>
              <Text style={styles.gridValue}>{params.date}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Time</Text>
              <Text style={styles.gridValue}>{params.time}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Bus number</Text>
              <Text style={styles.gridValue}>{params.bNumber}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Seats</Text>
              <Text style={styles.gridValue}>{seatNumber()}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Tickets</Text>
              <Text style={styles.gridValue}>{params.noOfTicket}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Total fare</Text>
              <Text style={styles.gridValue}>Rs. {params.totalFare}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Email</Text>
              <Text style={styles.gridValue}>{params.pemail}</Text>
            </View>
          </View>
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
                  pathname: "/passenger/ticket/usedAndActiveTicket",
                  params: {
                    Pid: params.Pid,
                    Pid1: params.Pid1,
                    pfirstName: params.pfirstName,
                    plastName:params.plastName,
                    pemail: params.pemail,
                    pphoneNumber: params.pphoneNumber,
                    busType:params.busType, 
                    busTypeTopic:params.busTypeTopic, 
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

          <TouchableOpacity 
            style={styles.centerButton} 
            onPress={() => {
              setActiveTab("tickets"); 
              router.push({
                pathname: "/passenger/index1",
                params: {
                  Pid: params.Pid,
                  Pid1: params.Pid1,
                  pfirstName: params.pfirstName,
                  plastName:params.plastName,
                  pemail: params.pemail,
                  pphoneNumber: params.pphoneNumber,
                },                    
              });
            }} 
          > 
            <Ionicons name="home-outline" size={28} color="#fff" />             
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("routes"); router.push({ pathname: "/notifications", params: { role: "passenger" } });}}>
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
};

const styles = StyleSheet.create({
  stampText: { fontSize: 13, fontWeight: '800', color: '#5B6B7F', letterSpacing: 1 },
  stamp: { position: 'absolute', top: 18, right: 18, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 2, borderColor: '#8A97A8', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, transform: [{ rotate: '-8deg' }] },
  errorText: { flex: 1, fontSize: 13, fontWeight: '600', color: C.red },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FDF1F1', borderRadius: 12, padding: 12, marginBottom: 12 },
  gridValue: { fontSize: 15, fontWeight: '800', color: C.ink, marginTop: 2 },
  gridLabel: { fontSize: 12, fontWeight: '600', color: C.muted },
  gridItem: { width: '50%' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, paddingBottom: 20, rowGap: 14 },
  qrHintText: { fontSize: 13, fontWeight: '600', color: C.muted },
  qrHint: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  qrFrame: { padding: 14, borderRadius: 18, borderWidth: 1.5, borderColor: '#E3E9F1', backgroundColor: '#FFFFFF' },
  qrBox: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 20 },
  perfLine: { flex: 1, borderTopWidth: 2, borderTopColor: '#E3E9F1', borderStyle: 'dashed', marginHorizontal: 8 },
  notchR: { width: 24, height: 24, borderRadius: 12, backgroundColor: C.bg, marginRight: -12 },
  notchL: { width: 24, height: 24, borderRadius: 12, backgroundColor: C.bg, marginLeft: -12 },
  perf: { flexDirection: 'row', alignItems: 'center', height: 24 },
  passIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#159B79', alignItems: 'center', justifyContent: 'center', marginHorizontal: 10 },
  passPlace: { fontSize: 20, fontWeight: '800', color: C.navy, marginTop: 2 },
  passLabel: { fontSize: 12, fontWeight: '700', color: C.muted },
  passRow: { flexDirection: 'row', alignItems: 'center' },
  passTop: { padding: 20 },
  pass: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#0F1B2D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
  },
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

  scroll: { flex: 1,marginTop: -70,  },
  scrollContent: { padding: 16, paddingBottom: 150, gap: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoTextWrap: { flex: 1 },
  infoLabel: { fontSize: 12, color: "#94a3b8", marginBottom: 2 },
  infoValue: { fontSize: 15, color: "#1e293b", fontWeight: "600" },
  
   
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