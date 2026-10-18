
import React, { useCallback, useEffect, useState } from "react";
import { Stack,useRouter,useLocalSearchParams} from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from "react-native";
import { 
  AntDesign,
  Ionicons, 
  MaterialCommunityIcons, 
  Fontisto, 
  FontAwesome6, 
  MaterialIcons, 
  FontAwesome5,
  Feather, 
  FontAwesome 
} from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type EmergencyStatus = "normal" | "accident" | "breakdown";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function EmergencyButton() {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState('');
  const params = useLocalSearchParams();
  const [emergency, setEmergency] = useState(false);
  const [status, setStatus] = useState<EmergencyStatus>("normal");
  const [loading, setLoading] = useState(false);
  const busNumber:string = "HH-7788";
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
      <View style={styles.container}>
        <LinearGradient
          colors={["#173C79","#155B8A","#159B79",]}
          start={{x: 0, y: 0,}}
          end={{x: 1, y: 1,}}
          style={styles.submitGradient1}
        >
  
          <View style={styles.header}>          
            <TouchableOpacity><Text style={styles.title}>Emergency States</Text></TouchableOpacity>          
          </View>
    
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bus Emergency</Text>

          <Text style={styles.busNumber}>
              Bus Number: {busNumber}
          </Text>
          <View
            style={[
            styles.statusBox,
            emergency ? styles.emergencyBox : styles.normalBox,
            ]}
          >
            <Text style={styles.statusLabel}>
            Current Status
            </Text>

            <Text
            style={[
                styles.statusText,
                { color: emergency ? "#B91C1C" : "#15803D" },
            ]}
            >
            {emergency
                ? status.toUpperCase()
                : "NORMAL"}
            </Text>
          </View>

        
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#0047AB"
            style={styles.loader}
          />
        ) : (
          <>  
            {emergency && (
              <TouchableOpacity
                style={[styles.card1, styles.resolveButton]}
                onPress={resolveEmergency}
                accessibilityRole="button"
                accessibilityLabel="Resolve emergency"
              >
                <Text style={styles.buttonText}>
                    ✓ Resolve Emergency
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}

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
                  pathname: "/admin/emergency/EmergencyBuses",
                  params: {
                    Aid: params.Aid,
                    firstName: params.firstName,
                    lastName: params.lastName,
                    email: params.email,
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
  container:{
    flex:1,
    backgroundColor:"#fff"
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
    alignItems: "center",
    padding: 18,
    marginTop: 16,
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

  cardTitle: {
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
  statusLabel: {
    fontSize: 14,
    color: "#333333",
  },
  statusText: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 4,
  },
  
  resolveButton: {
    backgroundColor: "#15803D",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
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
