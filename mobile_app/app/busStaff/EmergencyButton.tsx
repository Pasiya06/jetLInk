
import React, { useCallback, useEffect, useState,  } from "react";
import { Stack,useRouter,useLocalSearchParams} from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  ScrollView,
} from "react-native";
import { ScreenHeader, IconBox, GradientButton, C, ui } from "../../components/JetUI";
import SearchPanel from "../../components/SearchPanel";
import { Alert } from "../../components/JetAlert";
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

type EmergencyStatus = "normal" | "accident" | "breakdown";


const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function EmergencyButton() {
  const [emergency, setEmergency] = useState(false);
  const [status, setStatus] = useState<EmergencyStatus>("normal");
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const params = useLocalSearchParams();
  const router = useRouter();
  const busNumber = params.busNumber as string;
  const [activeTab, setActiveTab] = useState('');
  const fetchEmergency = useCallback(async () => {
    if (!API_URL || !busNumber) return;

    try {
      const response = await fetch(
        `${API_URL}/buses/${encodeURIComponent(
          busNumber
        )}/emergency`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to get status");
      }

      setEmergency(data.bus.emergency);
      setStatus(data.bus.status);
    } catch (error) {
      console.error("Fetch emergency error:", error);
    }
  }, [busNumber]);

  useEffect(() => {
    fetchEmergency();
  }, [fetchEmergency]);

  const reportEmergency = async (
    emergencyType: "accident" | "breakdown"
  ) => {
    if (loading) return;

    Alert.alert(
      "Confirm Emergency",
      `Are you sure you want to report a ${emergencyType}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          style: "destructive",
          onPress: async () => {
            if (!API_URL) {
              Alert.alert("Error", "API URL is not configured.");
              return;
            }

            try {
              setLoading(true);

              const response = await fetch(
                `${API_URL}/buses/${encodeURIComponent(
                  busNumber
                )}/emergency`,
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    status: emergencyType,
                  }),
                }
              );

              const data = await response.json();

              if (!response.ok) {
                throw new Error(
                  data.message || "Failed to report emergency"
                );
              }

              setEmergency(data.bus.emergency);
              setStatus(data.bus.status);

              // The server now sends this emergency to admins and all bus staff

              Alert.alert(
                "Emergency Reported",
                `Bus ${busNumber}: ${emergencyType.toUpperCase()}`
              );
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "Failed to report emergency"
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const resolveEmergency = () => {
    if (loading) return;

    Alert.alert(
      "Resolve Emergency",
      "Has the emergency been resolved?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes, Resolve",
          onPress: async () => {
            if (!API_URL) {
              Alert.alert("Error", "API URL is not configured.");
              return;
            }

            try {
              setLoading(true);

              const response = await fetch(
                `${API_URL}/buses/${encodeURIComponent(
                  busNumber
                )}/emergency/resolve`,
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );

              const data = await response.json();

              if (!response.ok) {
                throw new Error(
                  data.message || "Failed to resolve emergency"
                );
              }

              setEmergency(data.bus.emergency);
              setStatus(data.bus.status);

              Alert.alert(
                "Success",
                "Emergency resolved successfully."
              );
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "Failed to resolve emergency"
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <View style={[styles.container, { backgroundColor: C.bg }]}>
        <ScreenHeader eyebrow={`Bus ${busNumber || ""}`.trim()} title="Emergency" />

        <ScrollView style={ui.body} contentContainerStyle={ui.bodyContent} showsVerticalScrollIndicator={false}>
          <View style={[ui.card, styles.statusCard, emergency ? styles.statusBad : styles.statusOk]}>
            <IconBox bg={emergency ? C.redSoft : C.greenSoft} size={58}>
              <Ionicons
                name={emergency ? (status === "accident" ? "warning" : "construct") : "shield-checkmark"}
                size={30}
                color={emergency ? C.red : C.green}
              />
            </IconBox>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.statusLabel}>Current status</Text>
              <Text style={[styles.statusText, { color: emergency ? C.red : C.green }]}>
                {emergency ? (status === "accident" ? "Accident reported" : "Breakdown reported") : "Running normally"}
              </Text>
              <Text style={styles.statusHint}>
                {emergency
                  ? "Passengers can't book this bus until you mark it fixed."
                  : "Report a problem below if something goes wrong."}
              </Text>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={C.blue} style={{ marginTop: 24 }} />
          ) : !emergency ? (
            <>
              <Text style={styles.sectionTitle}>Report a problem</Text>
              <TouchableOpacity
                style={[ui.card, styles.actionCard]}
                onPress={() => reportEmergency("accident")}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Report accident"
              >
                <IconBox bg={C.redSoft} size={52}>
                  <Ionicons name="warning" size={26} color={C.red} />
                </IconBox>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={ui.rowTitle}>Accident</Text>
                  <Text style={ui.rowSub}>The bus was in an accident</Text>
                </View>
                <View style={[styles.goDot, { backgroundColor: C.red }]}>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[ui.card, styles.actionCard]}
                onPress={() => reportEmergency("breakdown")}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Report breakdown"
              >
                <IconBox bg={C.amberSoft} size={52}>
                  <Ionicons name="construct" size={26} color={C.amber} />
                </IconBox>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={ui.rowTitle}>Breakdown</Text>
                  <Text style={ui.rowSub}>The bus can't continue the trip</Text>
                </View>
                <View style={[styles.goDot, { backgroundColor: C.amber }]}>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <View style={{ marginTop: 6 }}>
              <GradientButton
                label="Bus is fixed – back in service"
                icon="checkmark-circle-outline"
                onPress={resolveEmergency}
              />
            </View>
          )}
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
                    pathname: "/busStaff/help",
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
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  statusCard: { flexDirection: "row", alignItems: "center", padding: 18, borderWidth: 1.5 },
  statusOk: { borderColor: "#BFE6D6" },
  statusBad: { borderColor: "#F5B5B5" },
  statusHint: { fontSize: 12.5, color: "#5B6B7F", marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#0F1B2D", marginTop: 6, marginBottom: 10, marginLeft: 4 },
  actionCard: { flexDirection: "row", alignItems: "center", padding: 16 },
  goDot: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },

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
    backgroundColor: "#FFFFFF",
    padding: 18,
    marginTop: -36,
    marginLeft: 16,
    marginRight: 16,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  card1: {
    backgroundColor: "#FFFFFF",
    height: 100,
    padding: 18,
    margin: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  CardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0047AB",
    marginBottom: 8,
  },
  busNumber: {
    fontSize: 16,
    color: "#555555",
    marginBottom: 14,
  },
  statusBox: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: "center",
  },
  normalBox: {
    backgroundColor: "#DCFCE7",
  },
  emergencyBox: {
    backgroundColor: "#FEE2E2",
  },
  statusLabel: { fontSize: 12.5, fontWeight: "700", color: "#5B6B7F" },
  statusText: { fontSize: 19, fontWeight: "800", marginTop: 2 },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  accidentButton: {
    backgroundColor: "#DC2626",
  },
  breakdownButton: {
    backgroundColor: "#EA580C",
  },
  resolveButton: {
    backgroundColor: "#15803D",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "bold",
  },
  loader: {
    marginVertical: 20,
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
