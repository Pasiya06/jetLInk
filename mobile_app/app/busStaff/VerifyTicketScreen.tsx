import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Modal,
  ActivityIndicator,
  TextInput,
  Dimensions,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { 
  Ionicons, 
  Feather, 
  FontAwesome,
  MaterialIcons, 
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import axios from "axios";

const { width } = Dimensions.get("window");
const API_URL = process.env.EXPO_PUBLIC_API_URL; // TODO: replace with your backend base URL

type VerifyResult = {
  valid: boolean;
  reason?: string;
  ticket?: {
    ticketId?: string;
    pickup?: string;
    drop?: string;
    noOfTicket?: number;
    totalFare?: number;
  };
};

export default function VerifyTicketScreen() {
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('');
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // Scanning line animation loop
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    if (!scanned) loop.start();
    return () => loop.stop();
  }, [scanned]);

  const animateResultIn = () => {
    scaleAnim.setValue(0);
    iconRotate.setValue(0);
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(iconRotate, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);
    setModalVisible(true);

    try {
      const res = await axios.post(`${API_URL}/tickets/verify`, {
        qrToken: data,
      });
      setResult(res.data);
    } catch (err) {
      setResult({ valid: false, reason: "Network error. Please try again." });
    } finally {
      setLoading(false);
      animateResultIn();
    }
  };

  const resetScanner = () => {
    setModalVisible(false);
    setResult(null);
    setTimeout(() => setScanned(false), 300);
  };

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 230],
  });

  const iconScale = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const handleBusTicket = () => {
      
      router.push({

        pathname: "/busStaff/VerifyTicketScreen",
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
      <View style={styles.container}>
        

        {/* Header */}
        <LinearGradient
          colors={["#173C79","#155B8A","#159B79",]}
          start={{x: 0, y: 0,}}
          end={{x: 1, y: 1,}}
          style={styles.submitGradient1}
        >
          <View style={styles.header}>    
            <TouchableOpacity >
              <Text style={styles.title}>Scan Ticket</Text>
            </TouchableOpacity>          
          </View>
        </LinearGradient>

        {/* Camera */}
        <View style={styles.cameraWrap}>
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          />
            
              {!scanned && (
                <Animated.View
                  style={[
                    styles.scanLine,
                    { transform: [{ translateY: scanLineTranslate }] },
                  ]}
                />
              )}
            
            
          
        </View>

        {/* Result Modal */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              {loading ? (
                <View style={styles.loadingWrap}>
                  <ActivityIndicator size="large" color="#6C5CE7" />
                  <Text style={styles.loadingText}>Verifying ticket...</Text>
                </View>
              ) : (
                <>
                  <Animated.View
                    style={[
                      styles.resultIconCircle,
                      result?.valid
                        ? styles.resultIconValid
                        : styles.resultIconInvalid,
                      {
                        transform: [
                          { scale: scaleAnim },
                          { scale: iconScale },
                        ],
                      },
                    ]}
                  >
                    <Ionicons
                      name={result?.valid ? "checkmark" : "close"}
                      size={44}
                      color="#fff"
                    />
                  </Animated.View>

                  <Text style={styles.resultTitle}>
                    {result?.valid ? "Ticket Verified" : "Verification Failed"}
                  </Text>

                  <View
                    style={[
                      styles.pillBadge,
                      result?.valid ? styles.pillValid : styles.pillInvalid,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pillBadgeText,
                        result?.valid
                          ? styles.pillTextValid
                          : styles.pillTextInvalid,
                      ]}
                    >
                      {result?.valid ? "VALID" : (result?.reason || "INVALID").toUpperCase()}
                    </Text>
                  </View>

                  {result?.valid && result?.ticket && (
                    <View style={styles.infoCard}>
                      
                      <View style={styles.infoRow}>
                        <View style={styles.infoIconTint}>
                          <Ionicons name="navigate-outline" size={16} color="#6C5CE7" />
                        </View>
                        <Text style={styles.infoLabel}>Pickup Location</Text>
                        <Text style={styles.infoValue}>{result.ticket.pickup}</Text>
                      </View>

                      <View style={styles.infoRow}>
                        <View style={styles.infoIconTint}>
                          <Ionicons name="navigate-outline" size={16} color="#6C5CE7" />
                        </View>
                        <Text style={styles.infoLabel}>Drop off Location</Text>
                        <Text style={styles.infoValue}>{result.ticket.drop}</Text>
                      </View>

                      <View style={styles.infoRow}>
                        <View style={styles.infoIconTint}>
                          <MaterialIcons name="format-list-numbered" size={16} color="#6C5CE7" />
                        </View>
                        <Text style={styles.infoLabel}>No of Tickets</Text>
                        <Text style={styles.infoValue}>{result.ticket.noOfTicket}</Text>
                      </View>

                      <View style={styles.infoRow}>
                        <View style={styles.infoIconTint}>
                          <MaterialCommunityIcons name="currency-usd" size={16} color="#6C5CE7" />
                        </View>
                        <Text style={styles.infoLabel}>Total Fare</Text>
                        <Text style={styles.infoValue}>{result.ticket.totalFare}</Text>
                      </View>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.scanAgainButton}
                    onPress={resetScanner}
                  >
                    <LinearGradient
                      colors={["#6C5CE7", "#4834D4"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.scanAgainGradient}
                    >
                      <Ionicons name="scan-outline" size={18} color="#fff" />
                      <Text style={styles.scanAgainText}>Scan Next Ticket</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  

                  
                </>
              )}
            </View>
          </View>
        </Modal>
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
                    }
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
                    }              
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
      </View>
    </>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  
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

  cameraWrap: {
    flex: 1,
    marginLeft: 20,
    marginRight: 20,
    marginTop: -60,
    borderRadius: 24,
    overflow: "hidden",
    maxHeight: "65%",
  },

  frameWrap: {
    width: 250,
    height: 250,
    borderRadius: 20,
    overflow: "hidden",
  },
  corner: {
    position: "absolute",
    width: 32,
    height: 32,
    borderColor: "#A29BFE",
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  scanLine: {
    width: "100%",
    height: 2,
    backgroundColor: "#A29BFE",
    shadowColor: "#A29BFE",
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  overlayHint: {
    marginTop: 24,
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
    opacity: 0.85,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(11,11,20,0.65)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  loadingWrap: { alignItems: "center", paddingVertical: 20 },
  loadingText: { marginTop: 14, fontSize: 14, color: "#8A8A9E", fontWeight: "500" },

  resultIconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  resultIconValid: { backgroundColor: "#2ECC71" },
  resultIconInvalid: { backgroundColor: "#FF5C5C" },

  resultTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 12,
  },

  pillBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  pillValid: { backgroundColor: "#E4F9EE" },
  pillInvalid: { backgroundColor: "#FFEAEA" },
  pillBadgeText: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  pillTextValid: { color: "#27AE60" },
  pillTextInvalid: { color: "#E74C3C" },

  infoCard: {
    width: "100%",
    backgroundColor: "#F7F7FC",
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#ECECF5",
  },
  infoIconTint: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#EFEBFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  infoLabel: { flex: 1, fontSize: 13, color: "#8A8A9E", fontWeight: "500" },
  infoValue: { fontSize: 13, color: "#1A1A2E", fontWeight: "700" },

  scanAgainButton: { width: "100%", borderRadius: 14, overflow: "hidden" },
  scanAgainGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
  },
  scanAgainText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  exitButton: {
    width: "100%",
    marginTop: 12,
    backgroundColor: "#E74C3C",
    height: 50,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },                                            

  exitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
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
