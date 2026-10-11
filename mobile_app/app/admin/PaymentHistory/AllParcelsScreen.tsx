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
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

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


interface Parcel {
  _id: string;
  parcelId?: string;
  sendername?: string;
  Semail?: string;
  SphoneNumber?: string;
  receiverName?: string;
  receiverPhone?: string;
  from?: string;
  to?: string;
  weight?: number;
  totalFare: number;
  busNumber?: string;
  busId?: string;
  createdAt?: string;
}

// ---------- Screen ----------
export default function AllParcelsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState('');

  const load = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/parcel/all`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch parcels");
      }
      setParcels(json.parcels ?? []);
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

  const stats = useMemo(() => { 
    const value = parcels.reduce((sum, p) => sum + Number(p.totalFare || 0), 0);
    return {
      total: parcels.length,
      value,
    };
  }, [parcels]);

  const visible = useMemo(() => {
    return parcels.filter((p) => {
      return [p.parcelId, p.sendername, p.receiverName, p.from, p.to]
    });
  }, [parcels]);

  const renderItem = ({ item }: { item: Parcel }) => {
    const passenger = item.sendername?.trim() || "N/A";
    return (
      <View style={styles.card}>
        {/* Top row: id + status pill */}
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
                {item.Semail || "No email"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.perforation}>
          <View style={[styles.notch, styles.notchLeft]} />
          <View style={styles.dashes}>
            {Array.from({ length: 22 }).map((_, i) => (
              <View key={i} style={styles.dash1} />
            ))}
          </View>
          <View style={[styles.notch, styles.notchRight]} />
        </View>

        <View style={styles.stub}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Parcel</Text>
            <Text style={styles.receiptId} numberOfLines={1}>
              {item.parcelId}
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
              <TouchableOpacity><Text style={styles.title}>Parcel Payment History</Text></TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { flex: 1.25 }]}>
            <Text style={styles.statLabel}>Total Income</Text>
            <Text style={styles.statBig} numberOfLines={1} adjustsFontSizeToFit>
              Rs. {stats.value.toLocaleString()}
            </Text>
            <Text style={styles.statHint}>
              {stats.total} Payments
            </Text>
          </View>  
        </View>

        <StatusBar barStyle="light-content" />
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.muted}>Loading parcels…</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <View style={[styles.bigIcon, { backgroundColor: "#FEE2E2" }]}>
              <Ionicons name="cloud-offline-outline" size={36} color="#DC2626" />
            </View>
            <Text style={styles.stateTitle}>Couldn’t load parcels</Text>
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
                  <MaterialCommunityIcons name="package-variant" size={36} color="#4F46E5" />
                </View>
                <Text style={styles.stateTitle}>No parcels found</Text>
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

// ---------- Styles ----------
const NOTCH = 22;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F8" },

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

  listContent: { 
    paddingBottom: 180, 
  },

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
  cardTop: { paddingBottom: 20 },
  
  fieldLabel: { fontSize: 12, color: C.muted, marginBottom: 3 },

  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 8 },
  empty: { alignItems: "center", paddingTop: 48, paddingHorizontal: 32, gap: 8 },
  bigIcon: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  stateTitle: { fontSize: 17, fontWeight: "700", color: "#111827" },
  muted: { fontSize: 13, color: "#6B7280", textAlign: "center" },
  retryBtn: { marginTop: 12, backgroundColor: "#4F46E5", paddingHorizontal: 22, paddingVertical: 11, borderRadius: 12 },
  retryText: { color: "#fff", fontWeight: "700" },
  perforation: { height: NOTCH, justifyContent: "center", marginTop: -2, marginBottom: 4, },
  notch: {
    position: "absolute",
    width: NOTCH,
    height: NOTCH,
    borderRadius: NOTCH / 2,
    backgroundColor: C.bg,
    top: 0,
  },

  notchLeft: { left: -NOTCH / 2 },
  notchRight: { right: -NOTCH / 2 },
  dashes: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: NOTCH,
  },
  dash1: { width: 7, height: 2, borderRadius: 1, backgroundColor: C.line },

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

  /* Stub */
  stub: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 16,
  },
  receiptId: { fontSize: 15, fontWeight: "700", color: C.ink },
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
