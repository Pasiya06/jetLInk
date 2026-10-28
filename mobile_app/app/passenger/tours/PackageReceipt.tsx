import React, { useCallback, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Platform,
  StatusBar,
  Animated,
  Dimensions,
} from "react-native";
import { Alert } from "../../../components/JetAlert";

import {
  Stack,
  useLocalSearchParams,
  useRouter,
  useFocusEffect,
} from "expo-router";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { LinearGradient } from 'expo-linear-gradient';
import { useBusNames, getBusLabel } from "../../../components/BusName";


const { width } = Dimensions.get('window');

// ------------------------------------------------------------
// THEME
// ------------------------------------------------------------

const C = {
  blue: "#173C79",
  blueDeep: "#003580",
  blueSoft: "#E6EFFC",
  lime: "#159B79",
  limeDark: "#0B3D12",
  limeSoft: "#E7F7E7",
  page: "#48ee92",
  card: "#FFFFFF",
  ink: "#0F1B2D",
  body: "#5B6B7F",
  muted: "#5B6B7F",
  line: "#E4E9F1",
};

export default function PackageReceipt() {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const router = useRouter();
  const params = useLocalSearchParams();
  useBusNames();
  const receiptId = params.receiptId as string;
  
  const maxPrice:string = "50942272";

  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchReceipt = useCallback(async () => {
    try {
      if (!receiptId) {
        Alert.alert("Error", "Receipt ID is missing.");
        return;
      }

      const API_URL = process.env.EXPO_PUBLIC_API_URL;

      const response = await fetch(
        `${API_URL}/receipts/${encodeURIComponent(String(receiptId))}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load receipt");
      }

      setReceipt(data.receipt);
    } catch (error: any) {
      console.error("Fetch receipt error:", error);
      Alert.alert("Error", error.message || "Unable to load receipt.");
    }
  }, [receiptId]);

  useFocusEffect(
    useCallback(() => {
      fetchReceipt();
    }, [fetchReceipt])
  );


  // ---------------- DERIVED ----------------

  const price = Number(params.maxPrice).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  //   `${receipt.pfirstName || ""} ${receipt.plastName || ""}`.trim() || "-";

  // const handleDone = () => router.push({
  //   pathname: "/passenger/parcel/index2",
  //   params: {
      
  //     Pid: params.Pid,
  //     Pid1: params.Pid1,
  //     pfirstName: params.pfirstName,
  //     plastName:params.plastName,
  //     pphoneNumber: params.pphoneNumber,
  //     pemail: params.pemail,
      
  //   },
  // })

  // const handleShare = async () => {
  //   try {
  //     await Share.share({
  //       message:
  //         `Jetlink package receipt\n` +
  //         `Receipt: ${receipt.receiptId}\n` +
  //         `Package: ${receipt.packageId} (${receipt.packageType})\n` +
  //         `Pickup: ${receipt.pickup}\n` +
  //         `Date: ${receipt.date} at ${receipt.time}\n` +
  //         `Bus: ${receipt.busNumber}\n` +
  //         `Total: Rs. ${price}`,
  //     });
  //   } catch {
  //     // user dismissed the share sheet
  //   }
  // };

  const handleTour = async () => {
      router.push({
        pathname: "/passenger/tours/index1",
        params: {
          
          Pid: params.Pid,
          Pid1: params.Pid1,
          pfirstName: params.pfirstName,
          plastName:params.plastName,
          pphoneNumber: params.pphoneNumber,
          pemail: params.pemail,
          
        },
      })
    };
  
    const handleSearch = async () => {
      router.push({
        pathname: "/passenger/index1",
        params: {
          
          Pid: params.Pid,
          Pid1: params.Pid1,
          pfirstName: params.pfirstName,
          plastName:params.plastName,
          pphoneNumber: params.pphoneNumber,
          pemail: params.pemail,
          
        },
      })
    };
    
  
    useEffect(() => {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient
        colors={['#173C79', '#155B8A', '#159B79']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Success Icon */}
        <Animated.View
          style={[
            styles.iconWrapper,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.iconCircleOuter}>
            <View style={styles.iconCircleInner}>
              <Ionicons name="checkmark" size={60} color="#159B79" />
            </View>
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, width: '100%', alignItems: 'center' }}>
          <Text style={styles.title}>Payment Successful</Text>
          <Text style={styles.subtitle}>
            Your ticket has been issued successfully
          </Text>

          <View style={styles.ticketWrap}>
            <View style={styles.ticket}>
            
              <View style={styles.ticketTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.metaLabel}>Receipt ID</Text>
                  <Text style={styles.receiptId} numberOfLines={1}>
                    {params.receiptId}
                  </Text>
                </View>

                <View style={styles.typePill}>
                  <Text style={styles.typePillText} numberOfLines={1}>
                    {params.packageType || "Package"}
                  </Text>
                </View>
              </View>

              
              <View style={styles.route}>
                <View style={styles.routeRail}>
                  <View style={styles.routeDot} />
                  <View style={styles.routeLine} />
                  <View style={styles.routeSquare} />
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.routeStop}>
                    <Text style={styles.metaLabel}>Pickup</Text>
                    <Text style={styles.routeValue}>
                      {params.pickup || "-"}
                    </Text>
                  </View>

                  <View style={[styles.routeStop, { marginBottom: 0 }]}>
                    <Text style={styles.metaLabel}>Total distance</Text>
                    <Text style={styles.routeValue}>
                      {params.totalDistance
                        ? `${params.totalDistance} `
                        : "-"}
                      {params.tripDuration
                        ? `  •  ${params.tripDuration}`
                        : ""}
                    </Text>
                  </View>
                </View>
              </View>

          
              <View style={styles.triple}>
                <View style={styles.tripleCell}>
                  <MaterialCommunityIcons name="calendar-blank-outline" size={18} color={C.blue} />
                  <Text style={styles.tripleValue} numberOfLines={1}>
                    {params.date || "-"}
                  </Text>
                  <Text style={styles.tripleLabel}>Date</Text>
                </View>

                <View style={styles.tripleCell}>
                  <MaterialCommunityIcons name="clock-outline" size={18} color={C.blue} />
                  <Text style={styles.tripleValue} numberOfLines={1}>
                    {params.time || "-"}
                  </Text>
                  <Text style={styles.tripleLabel}>Departs</Text>
                </View>

                <View style={styles.tripleCell}>
                  <MaterialCommunityIcons name="bus" size={18} color={C.blue} />
                  <Text style={styles.tripleValue} numberOfLines={1}>
                    {params.busNumber ? getBusLabel(params.busNumber) : "-"}
                  </Text>
                  <Text style={styles.tripleLabel}>Bus</Text>
                </View>
              </View>
          
              <View style={styles.perforation}>
                <View style={[styles.notch, styles.notchLeft]} />
                <View style={styles.dashes}>
                  {Array.from({ length: 26 }).map((_, i) => (
                    <View key={i} style={styles.dash} />
                  ))}
                </View>
                <View style={[styles.notch, styles.notchRight]} />
              </View>

              <View style={styles.ticketBottom}>
                <View>
                  <Text style={styles.metaLabel}>Total paid</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.currency}>Rs.</Text>
                    <Text style={styles.price}>{price}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
          
          {/* Actions */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleTour}
            activeOpacity={0.85}
          >
            
            <Text style={styles.primaryButtonText}>Book Another</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleSearch}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      

      
    </>
  );
}

// ------------------------------------------------------------
// STYLES
// ------------------------------------------------------------

const NOTCH = 26;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  iconWrapper: {
    marginBottom: 24,
  },
  iconCircleOuter: { width: 128, height: 128, borderRadius: 64, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  iconCircleInner: { width: 94, height: 94, borderRadius: 47, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 6 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.88)', marginBottom: 18, textAlign: 'center', lineHeight: 20 },
  amount: {
    fontSize: 34,
    fontWeight: '800',
    color: '#173C79',
    marginBottom: 24,
  },
  card: {
    width: width - 48,
    backgroundColor: '#fff',
    borderRadius: 18,
    
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },

   svw: {
    width: '100%',
    padding: 50,   
  },

  qrWrapper: {
    marginBottom:40,
    marginLeft:10
  },

  errorText: {
    fontSize: 14,
    color: '#c0392b',
    textAlign: 'center',
    marginBottom: 16,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    marginLeft: 8,
    fontSize: 13,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#173C79',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
  },
  primaryButton: { flexDirection: 'row', backgroundColor: '#FFFFFF', height: 54, paddingHorizontal: 32, borderRadius: 27, alignItems: 'center', justifyContent: 'center', width: width - 48, marginBottom: 12, shadowColor: '#0F1B2D', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 14, elevation: 6 },
  primaryButtonText: { fontSize: 16, fontWeight: '800', color: '#173C79' },
  secondaryButton: { paddingVertical: 12, paddingHorizontal: 20 },
  secondaryButtonText: { fontSize: 15, color: '#FFFFFF', fontWeight: '700' },

  // ---------- ticket ----------
  ticketWrap: {width: "100%", paddingHorizontal: 16, marginBottom: 20, },
  ticket: {
    backgroundColor: C.card,
    borderRadius: 24,
    elevation: 6,
    shadowColor: "#0A2A66",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  ticketTop: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 22,
  },
  metaLabel: { fontSize: 12, color: C.muted, fontWeight: "600" },
  receiptId: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: "800",
    color: C.blue,
    letterSpacing: 0.5,
  },
  typePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.blueSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 12,
    maxWidth: 140,
  },
  typePillText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "700",
    color: C.blue,
  },

  route: {
    flexDirection: "row",
    paddingHorizontal: 22,
    marginTop: 22,
  },
  routeRail: { alignItems: "center", width: 20, marginRight: 14, paddingTop: 4 },
  routeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: C.blue,
    backgroundColor: "#FFFFFF",
  },
  routeLine: {
    flex: 1,
    width: 2,
    backgroundColor: C.line,
    marginVertical: 4,
  },
  routeSquare: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: C.lime,
    marginBottom: 22,
  },
  routeStop: { marginBottom: 18 },
  routeValue: {
    marginTop: 3,
    fontSize: 16,
    fontWeight: "700",
    color: C.ink,
    lineHeight: 22,
  },

  triple: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 22,
    marginTop: 8,
    marginBottom: 22,
    paddingVertical: 14,
    backgroundColor: "#F6F8FC",
    borderRadius: 16,
  },
  tripleCell: { flex: 1, alignItems: "center", paddingHorizontal: 6 },
  tripleDivider: { width: 1, height: 38, backgroundColor: C.line },
  tripleValue: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "800",
    color: C.ink,
  },
  tripleLabel: { marginTop: 2, fontSize: 11, color: C.muted },

  perforation: {
    height: NOTCH,
    justifyContent: "center",
  },
  notch: {
    position: "absolute",
    top: 0,
    width: NOTCH,
    height: NOTCH,
    borderRadius: NOTCH / 2,
    backgroundColor: C.page,
  },
  notchLeft: { left: -NOTCH / 2 },
  notchRight: { right: -NOTCH / 2 },
  dashes: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: NOTCH,
  },
  dash: { width: 6, height: 2, borderRadius: 1, backgroundColor: C.line },

  ticketBottom: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 22,
  },
  priceRow: { flexDirection: "row", alignItems: "baseline", marginTop: 2 },
  currency: { fontSize: 15, fontWeight: "700", color: C.body, marginRight: 5 },
  price: {
    fontSize: 32,
    fontWeight: "800",
    color: C.ink,
    letterSpacing: -0.5,
  },
  bookingChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F3F7",
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 6,
  },
  bookingChipOnline: { backgroundColor: C.limeSoft },
  bookingChipText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "700",
    color: C.body,
  },

  
  
});
