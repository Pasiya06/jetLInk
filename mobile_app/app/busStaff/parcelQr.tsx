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
  ActivityIndicator,
} from 'react-native';
import { DetailLine } from "../../components/JetForm";
import { ScreenHeader, GradientButton, C, ui } from "../../components/JetUI";
import SearchPanel from "../../components/SearchPanel";
import { Alert } from "../../components/JetAlert";
import {  
  Ionicons, 
  Feather, 
  FontAwesome,
  Fontisto,
  } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import AlertBadge from "../../components/AlertBadge";

const ParcelService = () => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const params = useLocalSearchParams();
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

  const markParcelDelivered = async () => {
    try {
      const response = await fetch(
        `${API_URL}/parcel/deliver/${parcelId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.valid) {
        if (data.stage === "delivery") {
          Alert.alert(
            "Delivered",
            "Parcel delivered successfully."
          );

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
            })


        }

        console.log("Parcel:", data.parcel);
      } 
      else {
        Alert.alert("Failed", data.reason);
      }
    } 
    catch (error) {
      console.log(error);
      Alert.alert("Error", "Unable to connect to the server.");
    }
  };

  const confirmDelivery = () => {
    Alert.alert(
      "Confirm Delivery",
      "Are you sure this parcel has been delivered?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => markParcelDelivered(),
        },
      ]
    );
  };

    
 
  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
       
        <ScreenHeader eyebrow="Parcel delivery" title={parcelId ? `Parcel #${parcelId}` : "Parcel QR"} />

        <ScrollView style={ui.body} contentContainerStyle={ui.bodyContent} showsVerticalScrollIndicator={false}>
          <View style={[ui.card, styles.qrCard]}>
            <Text style={styles.qrTitle}>Show this to the receiver</Text>
            <Text style={styles.qrSub}>They scan it to confirm they got the parcel</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={C.red} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.qrFrame}>
              {qrToken ? (
                <QRCode
                  value={String(qrToken)}
                  size={210}
                  getRef={(ref) => {
                    qrRef.current = ref;
                  }}
                />
              ) : !error ? (
                <ActivityIndicator size="large" color={C.blue} />
              ) : (
                <Ionicons name="qr-code-outline" size={80} color={C.chevron} />
              )}
            </View>

            <View style={styles.routeRow}>
              <View style={styles.routeDot} />
              <Text style={styles.routeText} numberOfLines={1}>{pickup || "—"}</Text>
              <Ionicons name="arrow-forward" size={16} color={C.muted} />
              <Text style={[styles.routeText, { textAlign: "right" }]} numberOfLines={1}>{drop || "—"}</Text>
              <View style={[styles.routeDot, { backgroundColor: C.green }]} />
            </View>
          </View>

          <View style={[ui.card, styles.infoCard]}>
            <DetailLine icon="person-outline" label="Receiver" value={receivername} />
            <DetailLine icon="call-outline" label="Receiver phone" value={Rmobilenumber} />
            <DetailLine icon="barbell-outline" label="Weight" value={weight ? `${weight} kg` : undefined} />
            <DetailLine icon="cash-outline" label="Total fare" value={totalFare ? `Rs. ${totalFare}` : undefined} last />
          </View>

          <GradientButton label="Mark as delivered" icon="checkmark-done-outline" onPress={confirmDelivery} />
          <TouchableOpacity style={styles.shareBtn} onPress={shareQR} activeOpacity={0.85}>
            <Ionicons name="share-social-outline" size={20} color={C.blue} />
            <Text style={styles.shareText}>Share QR</Text>
          </TouchableOpacity>
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
        end={{ x: 1, y: 1, }}
        style={styles.submitGradient}
        >
        </LinearGradient>
      </View>
            
    </SafeAreaView></>
    
  );
};

const styles = StyleSheet.create({
  qrCard: { padding: 20, alignItems: "center" },
  qrTitle: { fontSize: 18, fontWeight: "800", color: "#0F1B2D" },
  qrSub: { fontSize: 13, color: "#5B6B7F", marginTop: 4, textAlign: "center" },
  qrFrame: { marginTop: 18, width: 250, height: 250, borderRadius: 24, borderWidth: 2, borderColor: "#E3E9F1", borderStyle: "dashed", alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FDE2E2", borderRadius: 14, padding: 12, marginTop: 14, alignSelf: "stretch" },
  routeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 18, alignSelf: "stretch", backgroundColor: "#F3F6FA", borderRadius: 14, padding: 12 },
  routeDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#155B8A" },
  routeText: { flex: 1, fontSize: 14, fontWeight: "700", color: "#0F1B2D" },
  infoCard: { paddingHorizontal: 18, paddingVertical: 4 },
  shareBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52, borderRadius: 16, borderWidth: 1.5, borderColor: "#155B8A", backgroundColor: "#FFFFFF" },
  shareText: { color: "#155B8A", fontSize: 16, fontWeight: "800" },
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

  errorText: { flex: 1, color: "#C62828", fontWeight: "600", fontSize: 13 },

  
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

  button:{
    flexDirection: 'row',
    marginLeft: 14,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: "space-around",
  },

  submitButton: {
    width:"45%",
    justifyContent: "space-around",
    //marginLeft: 20,
    //marginRight: 20,  
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