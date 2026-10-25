import React, { useState, useEffect, useRef } from "react";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";   
import { Ionicons, FontAwesome, Feather, } from "@expo/vector-icons";
import AlertBadge from "../../components/AlertBadge";

// ---- Types ----------------------------------------------------------------

type ScanState = "idle" | "scanning" | "loading" | "success" | "error";

type ParcelResult = {
  valid: boolean;
  stage?: "pickup" | "delivery";
  message?: string;
  reason?: string;
  parcel?: {
    parcelId: string;
    senderName?: string;
    receiverName?: string;
    status: string;
  };
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// ---- Component --------------------------------------------------------------

export default function ParcelScanner() {
  const params = useLocalSearchParams();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [result, setResult] = useState<ParcelResult | null>(null);
  const lockRef = useRef(false); // prevents duplicate scans firing in a row
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState('');
  const router = useRouter();

  const resetScanner = () => {
    lockRef.current = false;
    setResult(null);
    setScanState("idle");
  };

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (lockRef.current) return;
    lockRef.current = true;
    setScanState("loading");

    try {
      const res = await fetch(`${API_URL}/parcel/parcel/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrToken: data }),
      });
      const json: ParcelResult = await res.json();

      setResult(json);
      setScanState(json.valid ? "success" : "error");
    } catch (err) {
      setResult({ valid: false, reason: "Network error. Check your connection." });
      setScanState("error");
    }
  };

  // ---- Permission states ----------------------------------------------------

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  // ---- Main render ------------------------------------------------------------

  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Gradient header */}
      <LinearGradient
        colors={["#173C79","#155B8A","#159B79",]}
        start={{x: 0, y: 0,}}
        end={{x: 1, y: 1,}}
        style={styles.submitGradient1}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>JetLink</Text>
          <Text style={styles.headerSubtitle}>Scan the parcel QR to verify pickup or delivery</Text>
        </View>
      </LinearGradient>

      {/* Camera / result area */}
      <View style={styles.scanArea}>
        
        {scanState === "idle" || scanState === "loading" ? (
          <View style={styles.cameraWrap}>
            <CameraView
              style={StyleSheet.absoluteFill}
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={scanState === "idle" ? handleBarcodeScanned : undefined}
            />
            <View style={styles.frameOverlay}>
              <View style={styles.frameCorner} />
            </View>

            {scanState === "loading" && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>Verifying parcel…</Text>
              </View>
            )}
          </View>
        ) : (
          <ResultCard result={result} onScanAgain={resetScanner} />
        )}
      </View>
      

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

          <TouchableOpacity style={styles.item} onPress={() => {
            setActiveTab("home");
            if (isSearching) {
              setIsSearching(false);
            } else {
              router.push({
                pathname: "/busStaff/manageParcel",
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
            }
          }}>
            <Ionicons name={isSearching ? "arrow-back" : "arrow-back-outline"} size={24} color={activeTab === "home" ? "#0057D9" : "#8A8A8A"} />
            <Text style={[styles.label1, activeTab === "home" && styles.activeLabel]}>
              Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("routes"); setIsSearching(!isSearching); }}>
            <FontAwesome name={isSearching ? "close" : "search"} size={24} color={activeTab === "routes" ? "#0057D9" : "#8A8A8A"} />
            <Text style={[styles.label1, activeTab === "routes" && styles.activeLabel]}>
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
                    },                       
                    });}} > 
                <Ionicons name="home-outline" size={28} color="#fff" />             
            </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("alerts"); router.push({ pathname: "/notifications", params: { role: "staff" } }); }}>
            <View><Ionicons name="notifications-outline" size={24} color={activeTab === "alerts" ? "#0057D9" : "#8A8A8A"} /><AlertBadge role="staff" /></View>
            <Text style={[styles.label1, activeTab === "alerts" && styles.activeLabel]}>
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

      
    </View>
    </>
  );
}

// ---- Result card ------------------------------------------------------------

function ResultCard({
  result,
  onScanAgain,
}: {
  result: ParcelResult | null;
  onScanAgain: () => void;
}) {
  const isSuccess = result?.valid;
  const isPickup = result?.stage === "pickup";

  const accentColor = !isSuccess ? "#EF4444" : isPickup ? "#F59E0B" : "#22C55E";
  const accentTint = !isSuccess ? "#FEF2F2" : isPickup ? "#FFFBEB" : "#F0FDF4";
  const iconName = !isSuccess
    ? "close-circle"
    : isPickup
    ? "cube"
    : "checkmark-done-circle";

  return (
    <View style={styles.resultWrap}>
      <View style={styles.resultCard}>
        <View style={[styles.resultIconCircle, { backgroundColor: accentTint }]}>
          <Ionicons name={iconName as any} size={44} color={accentColor} />
        </View>

        <View style={[styles.pillBadge, { backgroundColor: accentTint }]}>
          <Text style={[styles.pillBadgeText, { color: accentColor }]}>
            {!isSuccess ? "VERIFICATION FAILED" : isPickup ? "PICKUP CONFIRMED" : "DELIVERED"}
          </Text>
        </View>

        <Text style={styles.resultMessage}>
          {result?.message || result?.reason || "Something went wrong."}
        </Text>

        {result?.parcel && (
          <View style={styles.parcelDetails}>
            <InfoRow
              icon="pricetag-outline"
              tint="#EEF2FF"
              iconColor="#4F46E5"
              label="Parcel ID"
              value={result.parcel.parcelId}
            />
            {result.parcel.senderName && (
              <InfoRow
                icon="person-outline"
                tint="#F0FDF4"
                iconColor="#22C55E"
                label="Sender"
                value={result.parcel.senderName}
              />
            )}
            {result.parcel.receiverName && (
              <InfoRow
                icon="location-outline"
                tint="#FFFBEB"
                iconColor="#F59E0B"
                label="Receiver"
                value={result.parcel.receiverName}
              />
            )}
          </View>
        )}

        <TouchableOpacity
          style={[styles.scanAgainButton, { backgroundColor: accentColor }]}
          onPress={onScanAgain}
          activeOpacity={0.85}
        >
          <Ionicons name="scan-outline" size={18} color="#FFFFFF" />
          <Text style={styles.scanAgainText}>Scan Next Parcel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function InfoRow({
  icon,
  tint,
  iconColor,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  iconColor: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIconWrap, { backgroundColor: tint }]}>
        <Ionicons name={icon} size={16} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

// ---- Styles -------------------------------------------------------------

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F8FAFC" 
  },

  centerFill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    padding: 24,
  },

  header: {
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

  headerIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },

  headerTitle: { 
    fontSize: 28, 
    fontWeight: "700", 
    color: "#FFFFFF" 
  },

  headerSubtitle: {
    fontSize: 13,
    color: "#E0E7FF",
    marginTop: 4,
    textAlign: "center",
  },

  scanArea: {
    flex: 1, 
    padding: 20, 
    marginTop: -50,
    maxHeight: '66%', 
  },

  svw: {
    width: '100%',   
  },

  cameraWrap: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#000",
  },

  frameOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },

  frameCorner: {
    width: 220,
    height: 220,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.85)",
    borderRadius: 20,
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: { 
    color: "#FFFFFF", 
    marginTop: 12, 
    fontSize: 15, 
    fontWeight: "500" 
  },

  resultWrap: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center" 
  },

  resultCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },

  resultIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  pillBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
  },

  pillBadgeText: { 
    fontSize: 12, 
    fontWeight: "700", 
    letterSpacing: 0.5 
  },

  resultMessage: {
    fontSize: 15,
    color: "#334155",
    textAlign: "center",
    marginBottom: 18,
    lineHeight: 21,
  },

  parcelDetails: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },

  infoRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingVertical: 8 
  },

  infoIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  infoLabel: { 
    fontSize: 11, 
    color: "#94A3B8", 
    fontWeight: "600" },

  infoValue: { 
    fontSize: 14, 
    color: "#1E293B", 
    fontWeight: "600", 
    marginTop: 1 },

  scanAgainButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: "100%",
    gap: 8,
  },

  scanAgainText: { 
    color: "#FFFFFF", 
    fontSize: 15, 
    fontWeight: "700" 
  },

  permissionTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    color: "#1E293B", 
    marginTop: 16 
  },

  permissionSubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
  },

  permissionButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 14,
  },

  permissionButtonText: { 
    color: "#FFFFFF", 
    fontWeight: "700", 
    fontSize: 14 
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
