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
import { DetailLine } from "../../../components/JetForm";
import { ScreenHeader, C, ui } from "../../../components/JetUI";
import SearchPanel from "../../../components/SearchPanel";
import { Ionicons, 
  MaterialCommunityIcons, 
  Fontisto, 
  FontAwesome, Feather } from '@expo/vector-icons'; 
import { LinearGradient } from 'expo-linear-gradient';
import AlertBadge from "../../../components/AlertBadge";
import { useBusNames, getBusLabel } from "../../../components/BusName";

const ParcelService = () => {
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const params = useLocalSearchParams();
    useBusNames();
    const [activeTab, setActiveTab] = useState('');
    const router = useRouter();
    
    
  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
        <ScreenHeader eyebrow="Delivered parcel" title={String(params.parcelId || "Parcel")} />

        <ScrollView style={ui.body} contentContainerStyle={ui.bodyContent} showsVerticalScrollIndicator={false}>
          <View style={[ui.card, styles.heroCard]}>
            <View style={[styles.heroIcon, { backgroundColor: C.greenSoft }]}>
              <Feather name="check-circle" size={28} color={C.green} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.heroTitle} numberOfLines={1}>{params.pickup} → {params.drop}</Text>
              <Text style={styles.heroSub}>{[params.date, params.time].filter(Boolean).join(" · ")}</Text>
              <View style={[styles.statusPill, { backgroundColor: C.greenSoft }]}>
                <View style={[styles.statusDotSm, { backgroundColor: C.green }]} />
                <Text style={[styles.statusTextSm, { color: C.green }]}>Delivered</Text>
              </View>
            </View>
          </View>

          <View style={[ui.card, styles.detailCard]}>
            <Text style={styles.cardHeading}>Sender</Text>
            <DetailLine icon="person-outline" label="Name" value={String(params.sendername || "")} />
            <DetailLine icon="call-outline" label="Mobile" value={String(params.Smobilenumber || "")} />
            <DetailLine icon="mail-outline" label="Email" value={String(params.Semail || "")} last />
          </View>

          <View style={[ui.card, styles.detailCard]}>
            <Text style={styles.cardHeading}>Receiver</Text>
            <DetailLine icon="person-outline" label="Name" value={String(params.receivername || "")} color={C.green} />
            <DetailLine icon="call-outline" label="Mobile" value={String(params.Rmobilenumber || "")} color={C.green} />
            <DetailLine icon="mail-outline" label="Email" value={String(params.Remail || "")} color={C.green} last />
          </View>

          <View style={[ui.card, styles.detailCard]}>
            <Text style={styles.cardHeading}>Shipment</Text>
            <DetailLine icon="barbell-outline" label="Weight" value={params.weight ? `${params.weight} kg` : ""} color={C.amber} />
            <DetailLine icon="location-outline" label="Pickup" value={String(params.pickup || "")} color={C.amber} />
            <DetailLine icon="flag-outline" label="Drop-off" value={String(params.drop || "")} color={C.amber} />
            <DetailLine icon="bus-outline" label="Bus" value={getBusLabel(params.Bnumber || "")} color={C.amber} />
            <DetailLine icon="cash-outline" label="Total fare" value={params.totalFare ? `Rs. ${params.totalFare}` : ""} color={C.amber} last />
          </View>
        </ScrollView>


      <SearchPanel
          visible={isSearching}
          query={searchQuery}
          onChangeQuery={setSearchQuery}
          onClose={() => { setIsSearching(false); setSearchQuery(""); }}
          role={"admin"}
          params={params}
        />
      
      <View style={styles.bottomNav}>

          

          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("home"); if (isSearching) {
                  setIsSearching(false); setSearchQuery(""); 
                }

                else {
                  router.push({
                    pathname: "/admin/Parcelhistory/parcelReceipt",
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

          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("routes"); if (isSearching) setSearchQuery(""); setIsSearching(!isSearching); }}>
            <FontAwesome name={isSearching ? "close" : "search"} size={24} color={activeTab  === "routes" ? "#0057D9" : "#8A8A8A"}/>
            <Text style={[ styles.label1,activeTab === "routes" && styles.activeLabel,]}>
              Search
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
            
    </SafeAreaView></>
    
  );
};

const styles = StyleSheet.create({
  heroCard: { padding: 18, flexDirection: "row", alignItems: "center" },
  heroIcon: { width: 58, height: 58, borderRadius: 18, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  heroTitle: { fontSize: 22, fontWeight: "800", color: "#0F1B2D", letterSpacing: 0.3 },
  heroSub: { fontSize: 13, color: "#5B6B7F", fontWeight: "600", marginTop: 2 },
  statusPill: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginTop: 6 },
  statusDotSm: { width: 7, height: 7, borderRadius: 4 },
  statusTextSm: { fontSize: 12, fontWeight: "800" },
  editBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, height: 40, borderRadius: 14, backgroundColor: "#EAF1FB" },
  editBtnText: { color: "#155B8A", fontWeight: "800", fontSize: 14 },
  detailCard: { paddingHorizontal: 18, paddingVertical: 6 },
  cardHeading: { fontSize: 13, fontWeight: "800", color: "#5B6B7F", letterSpacing: 0.8, textTransform: "uppercase", marginTop: 12, marginBottom: 2 },
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

  scroll: { flex: 1,marginTop: -50,  },
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