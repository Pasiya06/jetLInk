import React, { useState, useEffect, useRef } from "react";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
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
import SearchPanel from "../../../components/SearchPanel";
import { Alert } from "../../../components/JetAlert";
import {  
  Ionicons, 
  Feather, 
  FontAwesome,
  Fontisto,
  } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { ScreenHeader, GradientButton, C, ui } from "../../../components/JetUI";
import { useBusNames, getBusLabel } from "../../../components/BusName";

const ParcelService = () => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const params = useLocalSearchParams();
  useBusNames();
  const [activeTab, setActiveTab] = useState('');
  const router = useRouter();
  const parcelId = params.parcelId as string ;
  const sendername = params.sendername as string ;
  const Smobilenumber = params.Smobilenumber as string ;
  const Semail = params.Semail as string ;
  const receivername = params.receivername as string ;
  const Rmobilenumber = params.Rmobilenumber as string ;
  const Remail = params.Remail as string ;
  const weight = params.weight as string ;
  const pickup = params.pickup as string ;
  const drop = params.drop as string ;
  const date = params.date as string ;
  const time = params.time as string ;
  const Bnumber = params.Bnumber as string ;
  const totalFare = params.totalFare as string ;
  const qrRef = useRef<any>(null);
  const [qrToken, setQrToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fetchParcelQR = async () => {

    try {
      const url = `${API_URL}/parcel/parcel/${parcelId}/qr`;
      console.log("Request URL:", url);
      const response = await fetch(url);
      console.log("Status:", response.status);
      const data = await response.json();
      console.log("Backend Data:", data);

      if (!response.ok) {
        throw new Error(data.error);
      }
      setQrToken(data.qrToken);

    } 
    catch (error: any) {

      console.log("QR Error:", error);
      setError(error.message || "Could not generate QR");
    }
  };

  useEffect(() => {
    fetchParcelQR();
  }, []);

  const shareQR = async () => {
    try {
      if (!qrRef.current) {
        Alert.alert("Error", "QR Code not available.");
        return;
      }

      qrRef.current.toDataURL(async (data: string) => {
        try {
          const fileUri = FileSystem.cacheDirectory + "parcelQR.png";

          await FileSystem.writeAsStringAsync(fileUri, data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          if (!(await Sharing.isAvailableAsync())) {
            Alert.alert("Sharing is not available on this device.");
            return;
          }

          await Sharing.shareAsync(fileUri, {
            mimeType: "image/png",
            dialogTitle: "Share Parcel QR Code",
          });
        } catch (err) {
          console.log(err);
          Alert.alert("Error", "Unable to share QR Code.");
        }
      });
    } 
    catch (err) {
      console.log(err);
    }
  };

    
 
  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <SafeAreaView style={styles.container}>
       
        <ScreenHeader eyebrow="Parcel pickup" title={String(params.parcelId ?? "Your parcel")} />

        <ScrollView style={ui.body} contentContainerStyle={ui.bodyContent} showsVerticalScrollIndicator={false}>
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={18} color={C.red} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.pass}>
          <View style={styles.passTop}>
            <View style={styles.passRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.passLabel}>From</Text>
                <Text style={styles.passPlace} numberOfLines={1}>{pickup}</Text>
              </View>
              <View style={styles.passIcon}>
                <Feather name="package" size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.passLabel}>To</Text>
                <Text style={styles.passPlace} numberOfLines={1}>{drop}</Text>
              </View>
            </View>
          </View>

          <View style={styles.perf}>
            <View style={styles.notchL} />
            <View style={styles.perfLine} />
            <View style={styles.notchR} />
          </View>

          <View style={styles.qrBox}>
            {qrToken ? (
              <View style={styles.qrFrame}>
                <QRCode
                  value={String(qrToken)}
                  size={200}
                  getRef={(ref) => {
                    qrRef.current = ref;
                  }}
                />
              </View>
            ) : null}
            <View style={styles.qrHint}>
              <Ionicons name="scan-outline" size={16} color={C.muted} />
              <Text style={styles.qrHintText}>Show this code to collect your parcel</Text>
            </View>
          </View>

          <View style={styles.perf}>
            <View style={styles.notchL} />
            <View style={styles.perfLine} />
            <View style={styles.notchR} />
          </View>

          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Bus number</Text>
              <Text style={styles.gridValue}>{getBusLabel(params.Bnumber)}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Date</Text>
              <Text style={styles.gridValue}>{params.date}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Time</Text>
              <Text style={styles.gridValue}>{params.time}</Text>
            </View>
          </View>
          </View>

          <GradientButton label="Share QR code" icon="share-social-outline" onPress={shareQR} />
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
                    pathname: "/passenger/receipt/parcelReceipt",
                    params: {
                      Pid: params.Pid,
                      Pid1: params.Pid1,
                      pfirstName: params.pfirstName,
                      plastName:params.plastName,
                      pemail:params.pemail, 
                      pphoneNumber: params.pphoneNumber,                    
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
                    },                    
                  });}} > 
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
            
    </SafeAreaView></>
    
  );
};

const styles = StyleSheet.create({
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
    paddingTop:10,
    marginLeft: 20,
    marginRight: 20,
    flex: 1,
    maxHeight: '25%',
    backgroundColor: '#FFF',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 10,   
    alignSelf: 'center',
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  qrWrapper: {
    marginBottom:40,
    marginLeft:10
  },

  errorText: { flex: 1, fontSize: 13, fontWeight: '600', color: C.red },

  
  cardTitle: {
    marginLeft: 20,
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
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
    marginRight: 12,
  },
  label: {
    marginLeft: 20,
    fontSize: 14,
    color: '#4A4A4A',
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
    padding: 50,
      
  },

  svw1: {
    width: '100%',
      
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

  detailValue: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '600',
  },

  
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