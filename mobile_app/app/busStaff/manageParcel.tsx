import React from 'react';
import  { useState } from 'react';
import { Stack,useRouter,useLocalSearchParams} from "expo-router";
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  Image ,
  TextInput,
  ScrollView,
} from 'react-native';
import SearchPanel from "../../components/SearchPanel";
import { 
  Ionicons, 
  MaterialCommunityIcons, 
  Fontisto, 
  FontAwesome, 
  Feather,
  AntDesign 
} from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; 
import AlertBadge from "../../components/AlertBadge";
import { ScreenHeader, FeatureCard, RowCard, SectionLabel, Pill, C, ui } from "../../components/JetUI";

const ParcelService = () => {
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const params = useLocalSearchParams();

    const [activeTab, setActiveTab] = useState('');
    const router = useRouter();
    const handleSearch = () => {
      router.push({
        pathname: "/busStaff/parcelQrScan",
        params: {
            Cid: params.Cid,
            conductorId: params.conductorId,
            conductorNIC:params.conductorNIC,
            cfirstName: params.cfirstName,
            clastName: params.clastName,
            cphoneNumber:params.cphoneNumber,
            driverId:params.driverId,
            dfirstName:params.dfirstName,
            dlastName:params.dlastName,
            dphoneNumber:params.dphoneNumber,
            busNo: params.busNo,
        },         
      });
    };

    const handleSearch1 = () => {
      router.push({
        pathname: "/busStaff/pendingParcel",
        params: {
            Cid: params.Cid,
            conductorId: params.conductorId,
            conductorNIC:params.conductorNIC,
            cfirstName: params.cfirstName,
            clastName: params.clastName,
            cphoneNumber:params.cphoneNumber,
            driverId:params.driverId,
            dfirstName:params.dfirstName,
            dlastName:params.dlastName,
            dphoneNumber:params.dphoneNumber,
            busNo: params.busNo,
        },         
      });
    };

    const handleSearch2 = () => {
      router.push({
        pathname: "/busStaff/busBookedParcel",
        params: {
            Cid: params.Cid,
            conductorId: params.conductorId,
            conductorNIC:params.conductorNIC,
            cfirstName: params.cfirstName,
            clastName: params.clastName,
            cphoneNumber:params.cphoneNumber,
            driverId:params.driverId,
            dfirstName:params.dfirstName,
            dlastName:params.dlastName,
            dphoneNumber:params.dphoneNumber,
            busNo: params.busNo,
        },         
      });
    };
  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <ScreenHeader eyebrow={params.busNo ? `Bus ${params.busNo}` : "Bus staff"} title="Parcels" />

        <ScrollView style={ui.body} contentContainerStyle={ui.bodyContent} showsVerticalScrollIndicator={false}>
          <FeatureCard
            icon={<AntDesign name="scan" size={28} color="#FFFFFF" />}
            iconBg={C.blue}
            title="Scan parcel"
            subtitle="Scan a parcel's code at pickup or delivery"
            cta="Open scanner"
            tag={<Pill text="Most used" bg={C.greenSoft} color={C.green} />}
            onPress={handleSearch}
          />

          <SectionLabel>Manage</SectionLabel>

          <RowCard
            icon={<Feather name="package" size={24} color={C.purple} />}
            iconBg={C.purpleSoft}
            title="Pending parcels"
            subtitle="Parcels waiting on this bus"
            onPress={handleSearch1}
          />
          <RowCard
            icon={<Feather name="gift" size={24} color={C.green} />}
            iconBg={C.greenSoft}
            title="Book a parcel"
            subtitle="Register a parcel for transport"
            onPress={handleSearch2}
          />
        </ScrollView>

      <SearchPanel
          visible={isSearching}
          query={searchQuery}
          onChangeQuery={setSearchQuery}
          onClose={() => { setIsSearching(false); setSearchQuery(""); }}
          role={"staff"}
          params={params}
        />
      
      <View style={styles.bottomNav}>

        <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("home"); if (isSearching) {
                setIsSearching(false); setSearchQuery(""); 
              }

              else {
                router.push({
                  pathname: "/busStaff/index1",
                  params: {
                      Cid: params.Cid,
                      conductorId: params.conductorId,
                      conductorNIC:params.conductorNIC,
                      cfirstName: params.cfirstName,
                      clastName: params.clastName,
                      cphoneNumber:params.cphoneNumber,
                      driverId:params.driverId,
                      dfirstName:params.dfirstName,
                      dlastName:params.dlastName,
                      dphoneNumber:params.dphoneNumber,
                      busNo: params.busNo,
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
                      pathname: "/busStaff/index1",
                      params: {
                          Cid: params.Cid,
                          conductorId: params.conductorId,
                          conductorNIC:params.conductorNIC,
                          cfirstName: params.cfirstName,
                          clastName: params.clastName,
                          cphoneNumber:params.cphoneNumber,
                          driverId:params.driverId,
                          dfirstName:params.dfirstName,
                          dlastName:params.dlastName,
                          dphoneNumber:params.dphoneNumber,
                          busNo: params.busNo,
                      },                           
                  });}} > 
              <Ionicons name="home-outline" size={28} color="#fff" />             
          </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("alerts"); router.push({ pathname: "/notifications", params: { role: "staff" } }); }}>
          <View><Ionicons name="notifications-outline" size={24} color={activeTab === "alerts" ? "#0057D9" : "#8A8A8A"}/><AlertBadge role="staff" /></View>
          <Text style={[styles.label1,activeTab === "alerts" && styles.activeLabel, ]}>
            Alerts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={() => {setActiveTab("profile"); router.push({
                      pathname: "/busStaff/busProfile",
                      params: {
                        Cid: params.Cid,
                        conductorId: params.conductorId,
                        conductorNIC: params.conductorNIC,
                        cfirstName: params.cfirstName,
                        clastName: params.clastName,
                        cphoneNumber: params.cphoneNumber,
                        driverId: params.driverId,
                        dfirstName: params.dfirstName,
                        dlastName: params.dlastName,
                        dphoneNumber: params.dphoneNumber,
                        busNo: params.busNo,
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
  container:{
    flex:1,
    backgroundColor: C.bg
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
    marginLeft: 20,
    marginRight: 20,
    flex: 1,
    maxHeight: '15%',
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
    maxHeight: '15%',
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
    maxHeight: '15%',
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

  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginLeft: 20,
  },

  cardText: {
    paddingHorizontal: 10,
    flex: 1,
    fontSize: 24,
    color: '#0047AB',
    fontWeight: '600',
  },

  text1:{
    fontSize: 24,
    color: '#000000',
    fontWeight: '600',
  
  },

  text2:{
    fontSize: 14,
    color: '#7b7b7b',
    fontWeight: '600',
  
  },

  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
    alignItems: 'center',
  },

  mmr:{
    marginRight: 10,
    marginLeft: 20,
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