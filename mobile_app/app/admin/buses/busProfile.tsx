import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
   SafeAreaView,
  ScrollView
} from "react-native";
import { DetailLine } from "../../../components/JetForm";
import { ScreenHeader, GRADIENT, C, ui } from "../../../components/JetUI";
import SearchPanel from "../../../components/SearchPanel";

import {  } from "react-native-safe-area-context";
import { Stack,useRouter,useLocalSearchParams } from "expo-router";
import { Ionicons, FontAwesome, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AlertBadge from "../../../components/AlertBadge";



const AddBus = () => {
 
  
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState('');
  const params = useLocalSearchParams();
  const router = useRouter();
  const busNumber = params.busNumber as string;
  const API_URL = process.env.EXPO_PUBLIC_API_URL;  
  const isOnline = params.isOnline === 'true';

  const handleSearch = () => {
    router.push({
      pathname: "/admin/buses/updateBuses",
      params: {
        Bid: params.Bid,
        busId: params.busId,
        busNumber: params.busNumber,
        busName: params.busName || "",
        noOfSeats: params.noOfSeats || "",
        chassis: params.chassis || "",
        engine: params.engine || "",
        colour: params.colour || "",
        fuel: params.fuel || "",
        serviceDate: params.serviceDate || "",
        licenseDate: params.licenseDate || "",
        emissionDate: params.emissionDate || "",
        busType: params.busType || "",
        busTypeTopic:params.busTypeTopic,
        driverD:params.driverD,
        conductorD: params.conductorD,
        isOnline: params.isOnline,

        Aid: params.Aid,
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
      } 
    });
  };




  return (
    <>
    <Stack.Screen options={{ title: "", headerShown: false }} />
    <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
      <ScreenHeader eyebrow={`${params.busTypeTopic || "Bus"} profile`} title={String(params.busName || params.busNumber || "Bus")} />

      <ScrollView style={ui.body} contentContainerStyle={ui.bodyContent} showsVerticalScrollIndicator={false}>
        <View style={[ui.card, styles.heroCard]}>
          <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroIcon}>
            <MaterialCommunityIcons name="bus" size={30} color="#FFFFFF" />
          </LinearGradient>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.heroTitle}>{params.busName || params.busNumber}</Text>
            {!!params.busName && (
              <Text style={styles.heroSub}>{params.busNumber}</Text>
            )}
            <View style={[styles.statusPill, { backgroundColor: isOnline ? C.greenSoft : C.redSoft }]}>
              <View style={[styles.statusDotSm, { backgroundColor: isOnline ? C.green : C.red }]} />
              <Text style={[styles.statusTextSm, { color: isOnline ? C.green : C.red }]}>{isOnline ? "Online" : "Offline"}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editBtn} activeOpacity={0.85} onPress={handleSearch} accessibilityLabel="Edit bus">
            <Ionicons name="create-outline" size={18} color={C.blue} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={[ui.card, styles.detailCard]}>
          <Text style={styles.cardHeading}>Crew</Text>
          <DetailLine icon="person-outline" label="Driver" value={String(params.driverD || "")} />
          <DetailLine icon="person-circle-outline" label="Conductor" value={String(params.conductorD || "")} last />
        </View>

        <View style={[ui.card, styles.detailCard]}>
          <Text style={styles.cardHeading}>Vehicle</Text>
          <DetailLine icon="bus-outline" label="Bus name" value={String(params.busName || "")} />
          <DetailLine icon="barcode-outline" label="Chassis number" value={String(params.chassis || "")} />
          <DetailLine icon="hardware-chip-outline" label="Engine number" value={String(params.engine || "")} />
          <DetailLine icon="people-outline" label="Seats" value={String(params.noOfSeats || "")} />
          <DetailLine icon="color-palette-outline" label="Colour" value={String(params.colour || "")} last />
        </View>

        <View style={[ui.card, styles.detailCard]}>
          <Text style={styles.cardHeading}>Renewal dates</Text>
          <DetailLine icon="construct-outline" label="Service" value={String(params.serviceDate || "")} color={C.green} />
          <DetailLine icon="document-text-outline" label="Licence" value={String(params.licenseDate || "")} color={C.green} />
          <DetailLine icon="leaf-outline" label="Emission test" value={String(params.emissionDate || "")} color={C.green} last />
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
                pathname: "/admin/buses/showBuses",
                params: {
                  Aid: params.Aid,
                  firstName: params.firstName,
                  lastName: params.lastName,
                  email: params.email,

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
                  busTypeTopic:params.busTypeTopic,
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

    </SafeAreaView>

    </>
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

  card: {
    marginTop: -50,   
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },

  header1: {
    justifyContent: "space-between",
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingBottom: 2,
    backgroundColor: '#F4F7FC',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  subHead:{
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 64, 
    height: 64, 
    borderRadius: 32,
    backgroundColor: '#4A6FA5',
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 10,
    marginRight: 10,
  },

  avatarText: { 
    color: '#FFF', 
    fontSize: 22, 
    fontWeight: '700' 
  },

  fullName: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#1E293B' 
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF7EC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    gap: 4,
  },

  badgeText: { 
    fontSize: 11, 
    color: '#2F9E44', 
    fontWeight: '600', 
    marginLeft: 4 
  },

   busNumber: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginRight: 6,
  },

  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  body: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowText: {
    flex: 1,
  },

  value: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '600',
  },

  label:{
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 2,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#32CD32',
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

  inputIcon: {
    fontSize: 18,
    color: '#999',
  },

  searchButton: {
    
    marginLeft: 15,
    marginRight: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
      
    height: 45,
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
    color: '#8A8A8A',
    fontSize: 13,
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

  svw: {
    width: '100%',
    marginBottom:70,  
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


export default AddBus;