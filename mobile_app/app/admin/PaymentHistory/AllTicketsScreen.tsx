import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { 
  Ionicons, 
  MaterialCommunityIcons,
  FontAwesome, 
  Feather, 
} from "@expo/vector-icons";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import AlertBadge from "../../../components/AlertBadge";


const API_URL = process.env.EXPO_PUBLIC_API_URL;

const C = {
  brand: "#0056b3",
  brandSoft: "#e7f0ff",
  bg: "#eef2f8",
  card: "#ffffff",
  ink: "#0f1b2d",
  muted: "#64748b",
  line: "#d5dde9",
  success: "#15803d",
  successSoft: "#dcfce7",
  neutral: "#475569",
  neutralSoft: "#e8edf3",
  danger: "#dc3545",
};

interface Ticket {
  _id: string;
  ticketId?: string;
  pemail?: string;
  pfirstName?: string;
  plastName?: string;
  busNumber?: string;
  from?: string;
  to?: string;
  seatNumber?: number | string;
  totalFare?: number;
  travelDate?: string;
  createdAt?: string;
}

// ---------- Screen ----------
export default function AllTicketsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstname, setfirstname] = useState("");
  const [lastname, setlastname] = useState("");

  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState('');
  

  const load = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/tickets`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch tickets");
      }
      setTickets(json.tickets ?? []);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const GetName = async ({ item }: { item: Ticket }) => {
    try {
 
      const email = item.pemail;
      const passengerResponse = await fetch(`${API_URL}/passengers/get/${email}`);
      const passenger = await passengerResponse.json();
      console.log("Pending Parcel Data:", passenger);
      setfirstname(passenger.data.firstName);
      setlastname(passenger.data.lastName);

    }

    catch (error) {
      console.log(error);
      alert("Server connection failed");
    }
  };

  const stats = useMemo(() => {
    const value = tickets.reduce((sum, t) => sum + Number(t.totalFare || 0), 0);
    return {
      total: tickets.length,
      value,
    };
  }, [tickets]);

  const visible = useMemo(() => {
    return tickets.filter((t) => {
      return [t.ticketId, t.pfirstName, t.plastName, t.busNumber, t.from, t.to]
    });
  }, [tickets]);

  const renderItem = ({ item }: { item: Ticket }) => {
    

    const passenger = `${item.pfirstName} ${item.plastName}`.trim() || "N/A";
    return (
      <View style={styles.card}>
        {/* Top: bus + status */}
        <View style={styles.cardTop}>
          <View style={styles.passengerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(passenger[0] || "?").toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.passengerName} numberOfLines={1}>
                {passenger}
              </Text>
              <Text style={styles.passengerEmail} numberOfLines={1}>
                {item.pemail || "No email"}
              </Text>
            </View>
          </View>
        </View>

        {/* Perforated divider with notches */}
        <View style={styles.perfRow}>
          <View style={[styles.notch, styles.notchLeft]} />
          <View style={styles.perfLine} />
          <View style={[styles.notch, styles.notchRight]} />
        </View>

        <View style={styles.stub}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Ticket</Text>
            <Text style={styles.receiptId} numberOfLines={1}>
              {item.ticketId}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.fieldLabel}>Price</Text>
            <Text style={styles.price}>
              Rs. {Number(item.totalFare || 0).toLocaleString()}
            </Text>
          </View>
        </View>  
        
      </View>
      
    );
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
            <TouchableOpacity><Text style={styles.title}>Ticket Payment History</Text></TouchableOpacity>
          </View>
        </LinearGradient>

        <View>
          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { flex: 1.25 }]}>
              <Text style={styles.statLabel}>Total Income</Text>
              <Text style={styles.statBig} numberOfLines={1} adjustsFontSizeToFit>
                Rs. {stats.value.toLocaleString()}
              </Text>
              <Text style={styles.statHint}>{stats.total} Payments</Text>
            </View>  
          </View>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.muted}>Loading tickets…</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <View style={[styles.bigIcon, { backgroundColor: "#FEE2E2" }]}>
              <Ionicons name="cloud-offline-outline" size={36} color="#DC2626" />
            </View>
            <Text style={styles.stateTitle}>Couldn’t load tickets</Text>
            <Text style={styles.muted}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => load()}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={visible}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#4F46E5" />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <View style={[styles.bigIcon, { backgroundColor: "#E0E7FF" }]}>
                  <MaterialCommunityIcons name="ticket-confirmation-outline" size={36} color="#4F46E5" />
                </View>
                <Text style={styles.stateTitle}>No tickets found</Text>
                <Text style={styles.muted}>Try a different search or filter.</Text>
              </View>
            }
          />
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
                  pathname: "/admin/PaymentHistory/paymentHistory",
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
  
          <TouchableOpacity 
            style={styles.centerButton} 
            onPress={() => {
              setActiveTab("tickets"); 
              router.push({
                pathname: "/admin/index1",
                params: {
                  Aid: params.Aid,
                  firstName: params.firstName,
                  lastName: params.lastName,
                  email: params.email,
                },                    
              });
            }} 
          > 
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

      </View>
    </>
  );
}

// ---------- Styles ----------
const BG = "#F3F4F8";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 40,   
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

  statsRow: { 
    flexDirection: "row", 
    gap: 12, 
    marginBottom: 14, 
    marginTop: -20, 
    marginLeft: 20, 
    marginRight: 20, 
  },

  statCard: {
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 16,
    elevation: 2,
    shadowColor: "#0b2a5b",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },

  statLabel: { 
    fontSize: 12, 
    color: C.muted, 
    marginBottom: 4 
  },

  statBig: {
    fontSize: 24,
    fontWeight: "800",
    color: C.brand,
    letterSpacing: -0.4,
  },

  statHint: { 
    fontSize: 12, 
    color: C.muted, 
    marginTop: 4 },

  listContent: { paddingBottom: 170 },

  stat: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  statValue: { color: "#fff", fontSize: 19, fontWeight: "800" },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    gap: 8,
    elevation: 4,
    shadowColor: "#4F46E5",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  searchInput: { flex: 1, fontSize: 14, color: "#111827" },

  chipsRow: { flexDirection: "row", paddingHorizontal: 16, marginTop: 14, marginBottom: 6, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipActive: { backgroundColor: "#4F46E5", borderColor: "#4F46E5" },
  chipText: { fontSize: 13, color: "#4B5563", fontWeight: "600" },
  chipTextActive: { color: "#fff" },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 18,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  cardTop: {
    paddingBottom: 20
  },
  idRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  busNumber: { fontSize: 15, fontWeight: "700", color: "#111827" },
  ticketId: { fontSize: 12, color: "#9CA3AF", marginTop: 1 },

  pill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  pillText: { fontSize: 12, fontWeight: "700" },

  routeRow: { flexDirection: "row", alignItems: "center", marginTop: 16, gap: 8, paddingHorizontal: 16 },
  routeStop: { flex: 1 },
  routeLabel: { fontSize: 11, color: "#9CA3AF", marginBottom: 2 },
  routeValue: { fontSize: 14, fontWeight: "600", color: "#1F2937" },
  routeLine: { flex: 1.2, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#C7D2FE" },
  dash: { flex: 1, height: 1.5, backgroundColor: "#C7D2FE", marginHorizontal: 2 },

  // Ticket perforation: notches share the screen background colour
  

  footer: { flexDirection: "row", paddingHorizontal: 16, gap: 10 },
  footerCol: { flex: 1.4 },
  footerColSmall: { flex: 1 },
  footerValue: { fontSize: 13, fontWeight: "600", color: "#374151" },

  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 8 },
  empty: { alignItems: "center", paddingTop: 48, paddingHorizontal: 32, gap: 8 },
  bigIcon: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  stateTitle: { fontSize: 17, fontWeight: "700", color: "#111827" },
  muted: { fontSize: 13, color: "#6B7280", textAlign: "center" },
  retryBtn: { marginTop: 12, backgroundColor: "#4F46E5", paddingHorizontal: 22, paddingVertical: 11, borderRadius: 12 },
  retryText: { color: "#fff", fontWeight: "700" },

  passengerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginLeft: 16,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#eef2f7",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: C.brand, fontWeight: "800", fontSize: 15 },
  passengerName: { fontSize: 14, fontWeight: "700", color: C.ink },
  passengerEmail: { fontSize: 12, color: C.muted, marginTop: 1 },

  perfRow: { 
    justifyContent: "center", 
    marginTop: -2, 
    marginBottom: 4, 
    height: 16, 
    flexDirection: "row", 
    alignItems: "center", 
    marginVertical: 14, 
  },

  perfLine: {
    flex: 1,
    height: 0,
    borderTopWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#E5E7EB",
    marginHorizontal: 4,
  },
  notch: { width: 16, height: 16, borderRadius: 8, backgroundColor: BG },
  notchLeft: { marginLeft: -8 },
  notchRight: { marginRight: -8 },

  stub: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 16,
  },
  receiptId: { fontSize: 15, fontWeight: "700", color: C.ink },
  fieldLabel: { fontSize: 12, color: C.muted, marginBottom: 3 },
  price: { fontSize: 20, fontWeight: "800", color: C.brand },

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
