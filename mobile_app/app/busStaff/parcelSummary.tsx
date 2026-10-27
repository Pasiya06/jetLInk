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
  ScrollView,
} from 'react-native';
import { ScreenHeader, GradientButton, C, ui } from "../../components/JetUI";
import SearchPanel from "../../components/SearchPanel";
import { Alert } from "../../components/JetAlert";
import { 
  Ionicons, 
  MaterialCommunityIcons, 
  Fontisto, 
  FontAwesome, 
  Feather } from '@expo/vector-icons';

import { LinearGradient } from 'expo-linear-gradient';
import AlertBadge from "../../components/AlertBadge";

const ParcelService = () => {
    const API_URL = process.env.EXPO_PUBLIC_API_URL;
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const params = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState('');
    const router = useRouter();

    const [busFare, setBusFare] = useState("");
    const [weighFare, setWeighFare] = useState("");
    const [serviceTax, setServiceTax] = useState("");

    const getParcelFee = async () => {
    try {

      const response = await fetch(`${API_URL}/parcelfee`);

      const result = await response.json();


      if (result.success) {

        setBusFare(result.data.busFare.toString());
        setWeighFare(result.data.weighFare.toString());
        setServiceTax(result.data.serviceTax.toString());

      } else {

        Alert.alert("Error", result.message);

      }

    } catch (error) {

      console.log(error);
      Alert.alert("Error", "Failed to load parcel fee");

    }
  };

   useEffect(() => {

    getParcelFee();

  }, []);

  const weightfare = Number(weighFare);
  const weight = Number(params.weight);
  const allweightfair = weight * weightfare;

  const total = (
    Number(busFare || 0) +
    Number(allweightfair || 0) +
    Number(serviceTax || 0)
  ).toFixed(2);
 
  const handleSearch = () => {
        router.push({
            pathname: "/busStaff/paymentGateway",
            params:{ 
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
              sendername:params.sendername,
              smobilenumber:params.smobilenumber,
              semail:params.semail,
              receivername:params.receivername,
              rmobilenumber:params.rmobilenumber,
              remail:params.remail,
              weight:params.weight,
              pickup:params.pickup,
              drop:params.drop,
              date:params.date,
              time:params.time,
              totalFare:total,
            } 
            
        });
      };
  


  const rows = [
    {
      label: 'Bus Fare',
      value: busFare,
      icon: 'bus-outline',
      color: '#4A90E2',
    },
    {
      label: 'Weight Fee ',
      value: allweightfair,
      icon: 'cube-outline',
      color: '#F5A623',
    },
    {
      label: 'Service Tax',
      value: serviceTax,
      icon: 'receipt-outline',
      color: '#7ED321',
    },
  ];

  // Guard against params possibly being arrays (repeated query keys)
  const getParam = (key: string) => {
    const val = params[key];
    return Array.isArray(val) ? val[0] : val;
  };

  const details = [
    { label: 'Weight', value: `${getParam('weight')} kg`, icon: 'cube-outline', color: '#F5A623' },
    { label: 'Pickup Location', value: getParam('pickup'), icon: 'location-outline', color: '#4A90E2' },
    { label: 'Drop Location', value: getParam('drop'), icon: 'flag-outline', color: '#7ED321' },
    { label: 'Date', value: getParam('date'), icon: 'calendar-outline', color: '#9B59B6' },
    { label: 'Time', value: getParam('time'), icon: 'time-outline', color: '#E74C3C' },
  ] as const;
    
  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
       
        <ScreenHeader eyebrow="Book a parcel · Step 2" title="Summary" />

        <ScrollView style={ui.body} contentContainerStyle={ui.bodyContent} showsVerticalScrollIndicator={false}>
          <View style={[ui.card, styles.sumCard]}>
            <Text style={styles.cardTitle}>Shipment</Text>
            {details.map((item, index) => (
              <View key={index} style={[styles.detailRow, index < details.length - 1 && styles.rowDivider]}>
                <View style={[styles.iconWrap, { backgroundColor: `${item.color}1A` }]}>
                  <Ionicons name={item.icon} size={18} color={item.color} />
                </View>
                <View style={styles.detailTextWrap}>
                  <Text style={styles.detailLabel}>{item.label}</Text>
                  <Text style={styles.detailValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={[ui.card, styles.sumCard]}>
            <Text style={styles.cardTitle}>Price</Text>
            {rows.map((row, index) => (
              <View key={index} style={styles.row}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconWrap1, { backgroundColor: `${row.color}1A` }]}>
                    <Ionicons name={row.icon as any} size={18} color={row.color} />
                  </View>
                  <Text style={styles.label}>{row.label}</Text>
                </View>
                <Text style={styles.value}>Rs. {row.value}</Text>
              </View>
            ))}
            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>Total to pay</Text>
              <Text style={styles.totalValue}>Rs. {total}</Text>
            </View>
          </View>

          <GradientButton label="Continue to payment" icon="card-outline" onPress={handleSearch} />
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
                    pathname: "/busStaff/parceldetails",
                    params: {
                      Pid: params.Pid,
                      Pid1: params.Pid1,
                      pfirstName: params.pfirstName,
                      plastName:params.plastName,
                      pphoneNumber: params.pphoneNumber,
                      pemail: params.pemail,
                      sendername:params.sendername,
                      smobilenumber:params.smobilenumber,
                      semail:params.semail,
                      receivername:params.receivername,
                      rmobilenumber:params.rmobilenumber,
                      remail:params.remail,
                      weight:params.weight,
                      pickup:params.pickup,
                      drop:params.drop,
                      date:params.date,
                      time:params.time
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
  sumCard: { padding: 18 },
  cardTitle: { fontSize: 16, fontWeight: "800", color: "#0F1B2D", marginBottom: 6 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: "#EDF1F6" },
  totalBox: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12, backgroundColor: "#E3F5EE", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 },
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
    maxHeight: '33%',
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
    maxHeight: '25%',
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

  
  cardTitle: {
    marginLeft: 20,
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 9 },
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
    marginRight: 12,
  },
  label: { marginLeft: 12, fontSize: 14, color: "#33475B", fontWeight: "600" },
  value: { fontSize: 14.5, color: "#0F1B2D", fontWeight: "800" },
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
  totalLabel: { fontSize: 15, fontWeight: "700", color: "#0B6B53" },
  totalValue: { fontSize: 20, fontWeight: "800", color: "#0B6B53" },

  svw: {
    width: '100%',
      
  },

  detailRow: { flexDirection: "row", alignItems: "center", paddingVertical: 11 },

  iconWrap1: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  detailTextWrap: { flex: 1 },

  detailLabel: { fontSize: 12.5, color: "#5B6B7F", fontWeight: "600", marginBottom: 2 },

  detailValue: { fontSize: 15, color: "#0F1B2D", fontWeight: "700" },

  
  inputWrapper: {
    marginLeft: 20,
    marginRight: 20,
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F4F5',
    borderWidth: 1,
    borderColor: '#32CD32',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 15,
  },
  input3dIcon: {
    marginRight: 12,
    width: 25,
    height: 25
  },
  
  inputInnerWrapper: {
    flex: 1,
  },
  inputLabel: {
    marginLeft: 20,
    marginRight: 20,
    fontSize: 16,
    color: '#0056b3',
    fontWeight: '500',
    marginBottom: 10,
  },
  textInput: {
    fontSize: 16,
    color: '#0056b3',
    fontWeight: '500',
    padding: 0, 
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

  cardText: {
    paddingHorizontal: 10,
    flex: 1,
    fontSize: 24,
    color: '#0047AB',
    fontWeight: '600',
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