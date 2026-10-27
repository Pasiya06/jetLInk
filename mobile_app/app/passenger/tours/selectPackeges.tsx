import React, { useEffect, useState } from "react";
import { Stack, useRouter, useLocalSearchParams} from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import SearchPanel, { filterBySearch } from "../../../components/SearchPanel";
import { Alert } from "../../../components/JetAlert";

import { 
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Feather ,  
  FontAwesome, 
} from "@expo/vector-icons";

import { LinearGradient } from "expo-linear-gradient";
import { C, ScreenHeader, ui } from "../../../components/JetUI";
import { TIER_COLORS, getTier } from "../../../components/TourPackageCard";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type PackageItem = {
  _id: string;
  category: string;
  description: string;
  packageType: string;
  totalDistance: string;
  tripDuration: string;
  maxPassengers: number;
  maxPrice: number;
  createdAt?: string;
};

export default function PackagesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState(''); 
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  /* GET ALL PACKAGES */

  const getPackages = async () => {

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/packages`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
          "Failed to load packages"
        );
      }
      setPackages(data.data || []);
    } 

    catch (error: any) {
      console.log(
        "Get Packages Error:",
        error
      );

      Alert.alert(
        "Error",
        error.message ||
        "Could not load packages"
      );
    } 

    finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    getPackages();

  }, []);

  /*PACKAGE CARD */

  const renderPackage = ({item,}: {item: PackageItem;}) => (

    <TouchableOpacity
      style={styles.packageCard}
      activeOpacity={0.8}
      onPress={() => {
          router.push({
            pathname: "/passenger/tours/PackageDetails",
            params: {
              packageId: item._id,
              description: item.description,
              packageType: item.packageType,
              totalDistance: item.totalDistance,
              tripDuration: item.tripDuration,
              maxPassengers: item.maxPassengers,
              maxPrice: item.maxPrice,
              Pid: params.Pid,
              Pid1: params.Pid1,
              pfirstName: params.pfirstName,
              plastName:params.plastName,
              pphoneNumber: params.pphoneNumber,
              pemail: params.pemail,
            },
          });
      }}
    >
      <View style={[styles.cardStrip, { backgroundColor: TIER_COLORS[getTier(item.packageType)].border }]} />
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.packageTypeBadge,
              {
                backgroundColor: TIER_COLORS[getTier(item.packageType)].pale,
                borderColor: TIER_COLORS[getTier(item.packageType)].border,
              },
            ]}
          >
            <MaterialCommunityIcons name="star-four-points" size={11} color={TIER_COLORS[getTier(item.packageType)].main} />
            <Text style={[styles.packageTypeText, { color: TIER_COLORS[getTier(item.packageType)].main }]}>
              {item.packageType ||"PACKAGE"}
            </Text>
          </View>
          <Text style={styles.wholeBus}>Whole bus</Text>
        </View>

        <Text style={styles.packageName}>
          <Text style={styles.currency}>Rs </Text>
          {Number(item.maxPrice || 0).toLocaleString()}
        </Text>

        {!!item.description && (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons name="navigate" size={16} color={C.blue}/>
            <Text style={styles.detailValue} numberOfLines={1}>
              {item.totalDistance || "No distance"}
            </Text>
            <Text style={styles.detailText}>Distance</Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="time" size={16} color={C.blue} />
            <Text style={styles.detailValue} numberOfLines={1}>
              {item.tripDuration || "No duration"}
            </Text>
            <Text style={styles.detailText}>Duration</Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="people" size={16} color={C.blue}/>
            <Text style={styles.detailValue} numberOfLines={1}>
              {item.maxPassengers || 0}
            </Text>
            <Text style={styles.detailText}>Seats</Text>
          </View>
        </View>

        <View style={styles.cardFoot}>
          <Text style={styles.cardCta}>View package</Text>
          <View style={styles.arrowDot}>
            <Ionicons name="arrow-forward" size={16} color={C.blue} />
          </View>
        </View>
      </View>

    </TouchableOpacity>

  );

  if (loading) {

    return (
      <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#159B79"/>
        <Text style={styles.loadingText}>
          Loading packages...
        </Text>
      </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <View style={styles.container}>
      <StatusBar barStyle="light-content"/>

      <ScreenHeader
        eyebrow="Tours"
        title="Tour packages"
        right={
          <View style={styles.headerBadge}>
            <Ionicons name="map" size={22} color="#FFFFFF" />
          </View>
        }
      />
    

      <FlatList
        style={styles.svw}
        data={filterBySearch(packages, searchQuery)}
        keyExtractor={(item) =>item._id}
        renderItem={renderPackage}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={packages.length === 0 ? styles.emptyList : styles.listContent}
        refreshing={loading}
        onRefresh={getPackages}

        /* EMPTY */

        ListEmptyComponent={
        <View style={[ui.card, styles.emptyContainer]}>
            <View style={styles.emptyIcon}>
              <Ionicons name="cube-outline" size={34} color={C.blue}/>
            </View>
            <Text style={styles.emptyTitle}>
            No packages yet
            </Text>
            <Text style={styles.emptyText}>
            Create your first tour package
            </Text>
        </View>
        }
      />

        <SearchPanel
          visible={isSearching}
          query={searchQuery}
          onChangeQuery={setSearchQuery}
          onClose={() => { setIsSearching(false); setSearchQuery(""); }}
          role={"passenger"}
          params={params}
          listLabel="packages"
        />
          
        
            <View style={styles.bottomNav}>
        
              
              <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("home"); if (isSearching) {
                      setIsSearching(false); setSearchQuery(""); 
                    }
        
                    else {
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

      {/* Bottom Graphic Design Element */}
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

  headerBadge: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardStrip: { height: 5, width: "100%" },
  cardBody: { padding: 18 },
  wholeBus: { fontSize: 12, fontWeight: "600", color: C.muted },
  currency: { fontSize: 15, fontWeight: "700", color: C.muted },
  detailValue: { fontSize: 13.5, fontWeight: "800", color: C.ink, marginTop: 2 },
  cardFoot: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  cardCta: { fontSize: 14, fontWeight: "700", color: C.blue },
  arrowDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.blueSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: C.blueSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  container: {
    flex: 1,
    backgroundColor: "#F3F6FA",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "#5B6B7F",
    fontSize: 14,
  },

  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: "#E3E9F1",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#f5f5f6",
  },

  headerSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#5B6B7F",
  },

  svw: { flex: 1, width: "100%", marginTop: -64, marginBottom: 80 },

  listContent: { paddingHorizontal: 16, paddingTop: 0, paddingBottom: 140 },

  packageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    marginBottom: 14,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#0F1B2D",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  packageTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },

  packageTypeText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.6, textTransform: "uppercase" },

  packageName: { marginTop: 12, fontSize: 26, fontWeight: "800", color: C.navy, letterSpacing: -0.4 },

  icons: {
    flexDirection: "row",
  },

  category: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "700",
    color: "#5B6B7F",
    letterSpacing: 1,
  },

  description: { marginTop: 6, fontSize: 13.5, lineHeight: 20, color: C.muted },

  detailsRow: { marginTop: 14, flexDirection: "row", gap: 8 },

  detailItem: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 3,
  },

  detailText: { fontSize: 11, fontWeight: "600", color: C.muted },

  emptyList: { flexGrow: 1, paddingHorizontal: 16 },

  emptyContainer: { alignItems: "center", paddingVertical: 32, paddingHorizontal: 24 },

  emptyTitle: { marginTop: 14, fontSize: 18, fontWeight: "800", color: C.ink },

  emptyText: {
    marginTop: 6,
    fontSize: 13,
    color: "#5B6B7F",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor:"rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  modalContainer: {
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 30,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#0F1B2D",
  },

  input: {
    height: 48,
    backgroundColor: "#F3F6FA",
    borderWidth: 1,
    borderColor: "#E3E9F1",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#0F1B2D",
    marginBottom: 10,
  },

  descriptionInput: {
    height: 90,
    paddingTop: 12,
    textAlignVertical: "top",
  },

  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },

  cancelButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "#DCE3EC",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  cancelButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#5B6B7F",
  },

  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#159B79",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },

  saveButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  submitButton: {
    bottom: 180,
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