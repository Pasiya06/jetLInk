import React, { useEffect, useState } from "react";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import SearchPanel from "../../components/SearchPanel";
import { Alert } from "../../components/JetAlert";

import { LinearGradient } from "expo-linear-gradient";
import { C, GRADIENT, NAV_SPACE } from "../../components/JetUI";
import AlertBadge from "../../components/AlertBadge";

import {
  Ionicons,
  MaterialCommunityIcons,
  Feather ,  
  FontAwesome, 
} from "@expo/vector-icons";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Place = {
  _id: string;
  name: string;
  description: string;
  icon: string;
  iconType: string;
  color: string;
  order: number;
};

type PackageData = {
  _id: string;
  description: string;
  packageType: string;
  totalDistance: string;
  tripDuration: string;
  maxPassengers: number;
  maxPrice: number;
  places: Place[];
};

export default function PackageDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const PACKAGE_ID = params.packageId as string;
  const [packageData, setPackageData] = useState<PackageData | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState(''); 
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');


  /* LOAD PACKAGE */

  const loadPackage = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/packages/${PACKAGE_ID}`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
          "Failed to load package"
        );
      }
      setPackageData(data.data);
      setPlaces(data.data.places || []);
    } 

    catch (error: any) {
      console.log(
        "Load Package Error:",
        error
      );

      Alert.alert(
        "Error",
        error.message ||
        "Could not load package"
      );

    } 

    finally {
      setLoading(false);
    }
  };


  /* LOAD ON SCREEN OPEN */

  useEffect(() => {
    loadPackage();
  }, []);

  /* RENDER ICON */

  const renderIcon = (item: Place) => {
    if (item.iconType === "material") {
      return (
        <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color}/>
      );
    }

    return (
      <Ionicons name={item.icon as any} size={20} color={item.color}/>
    );
  };



  /*  LOADING SCREEN */

  if (loading) {
    return (
      <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#159B79"/>
          <Text style={styles.loadingText}>
            Loading package...
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

        {/*  HEADER  */}

        <LinearGradient
          colors={GRADIENT}
          start={{x: 0, y: 0,}}
          end={{x: 1, y: 1,}}
          style={styles.header}
        >
          <View style={styles.decorCircle}/>

          {/* BRAND + PACKAGE TYPE */}

          <View style={styles.headerTop}>
            <View style={styles.brandContainer}>
              <View style={styles.brandDot}/>
              <Text style={styles.brandText}>
                JetLink Tours
              </Text>
            </View>

            <View style={styles.goldenBadge}>
              <MaterialCommunityIcons name="crown" size={14} color="#FFE58A" />
              <Text style={styles.goldenText}>
                {packageData?.packageType || "PACKAGE"}
              </Text>
            </View>
          </View>

          <Text style={styles.category}>WHOLE BUS PRICE</Text>
          <Text style={styles.title}>
            <Text style={styles.titleCurrency}>Rs </Text>
            {Number(packageData?.maxPrice || 0).toLocaleString()}
          </Text>

          {/* DESCRIPTION */}

          {!!packageData?.description && (
            <Text style={styles.description} numberOfLines={3}>
              {packageData?.description}
            </Text>
          )}
        </LinearGradient>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
        >

          {/*  STATS  */}

          <View style={styles.statsRow}>
            <StatCard
              icon="map-marker-multiple"
              value={places.length.toString()}
              label="Places"
            />

            <StatCard
              icon="map-marker-distance"
              value={packageData?.totalDistance || "0 km"}
              label="Distance"
            />

            <StatCard
              icon="clock-outline"
              value={ packageData?.tripDuration || "0h"}
              label="Duration"
            />

            <StatCard
              icon="account-group"
              value={packageData?.maxPassengers ?.toString() || "0"}
              label="Seats"
            />
          </View>

          {/*  SECTION HEADER  */}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Places included
            </Text>
            <View style={styles.sectionPill}>
              <Text style={styles.sectionPillText}>
                {places.length} stop{places.length === 1 ? "" : "s"}
              </Text>
            </View>
          </View>

          {/*  PLACES  */}

          <View style={styles.placesSection}>
            <View style={styles.timelineContainer}>
              {places.length > 1 && (
                <View style={styles.timelineLine}/>
              )}

              {/*  PLACE ITEMS  */}

              {places.map((item, index) => (
                <View
                  key={item._id || `${item.name}-${index}`}
                  style={styles.placeRow}
                >
                  {/* ICON */}

                  <View style={[styles.timelineIcon, {backgroundColor:(item.color || "#159B79") + "1A", borderColor:(item.color || "#159B79") + "40",},]}>
                    {renderIcon(item)}
                  </View>

                  {/* CARD */}

                  <View style={ styles.placeCard}>
                    <View style={styles.placeTextContainer}>
                      <Text style={styles.placeName}>
                        {item.name}
                      </Text>

                      {!!item.description && (
                        <Text style={styles.placeDescription} numberOfLines={2}>
                          {item.description}
                        </Text>
                      )}
                    </View>

                    {/* NUMBER */}

                    <View style={styles.numberCircle}>
                      <Text style={styles.numberText}>
                        {index + 1}
                      </Text>
                    </View>
                  </View>
                </View>
              )
            )}


            {/* EMPTY STATE */}

            {places.length === 0 && (

              <View style={styles.emptyContainer}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="location-outline" size={30} color={C.blue}/>
                </View>
                <Text style={styles.emptyTitle}>
                  No places added yet
                </Text>

                <Text style={styles.emptyText}>
                  No places have been added to this package.
                </Text>
              </View>
            )}
            </View>
          </View>
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
                    pathname: "/busStaff/ReceiptList",
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

/* STAT CARD */

function StatCard({icon,value,label,}: {icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];value: string;label: string;}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <MaterialCommunityIcons name={icon} size={18} color={C.blue} />
      </View>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>

      <Text style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

/* STYLES */

const styles = StyleSheet.create({

  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  titleCurrency: { fontSize: 20, fontWeight: "700", color: "rgba(255,255,255,0.85)" },
  scroll: { marginTop: -46 },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: C.blueSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionPill: { backgroundColor: C.blueSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  sectionPillText: { fontSize: 12, fontWeight: "700", color: C.blue },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: C.blueSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  container: {
    flex: 1,
    backgroundColor: "#F3F6FA",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F6FA",
  },

  loadingText: {
    marginTop: 12,
    color: "#5B6B7F",
    fontSize: 14,
  },

  header: {
    paddingTop: 54,
    paddingHorizontal: 24,
    paddingBottom: 70,
    overflow: "hidden",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  decorCircle: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    right: -80,
    top: -60,
  },

  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  brandDot: {
    width: 7,
    height: 7,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    marginRight: 6,
  },

  brandText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700", letterSpacing: 0.3 },

  goldenBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },

  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: 10,
    backgroundColor: "#D8E2A5",
    marginRight: 5,
  },

  goldenText: { fontSize: 12, fontWeight: "800", color: "#FFE58A", letterSpacing: 0.8, textTransform: "uppercase" },

  category: { marginTop: 22, color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "700", letterSpacing: 1.2 },

  title: { color: "#FFFFFF", fontSize: 34, fontWeight: "800", marginTop: 4, letterSpacing: -0.5 },

  description: { color: "rgba(255,255,255,0.88)", fontSize: 14, lineHeight: 20, marginTop: 10, maxWidth: "95%" },

  statsRow: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 10,
    marginHorizontal: 16,
    shadowColor: "#0F1B2D",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  statCard: { flex: 1, alignItems: "center", paddingVertical: 8, paddingHorizontal: 2 },

  statValue: { color: C.ink, fontSize: 14, fontWeight: "800", marginTop: 8 },

  statLabel: { color: C.muted, fontSize: 11, fontWeight: "600", marginTop: 2 },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 22,
    marginHorizontal: 20,
  },

  sectionTitle: { fontSize: 18, fontWeight: "800", color: C.ink },

  addPlaceButton: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#159B79",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  addPlaceButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  scrollContent: { paddingBottom: NAV_SPACE },

  placesSection: { paddingHorizontal: 16, paddingBottom: 40 },

  timelineContainer: {
    position: "relative",
  },

  timelineLine: {
    position: "absolute",
    width: 2,
    backgroundColor: "#DCE3EC",
    left: 19,
    top: 24,
    bottom: 30,
  },

  placeRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },

  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: C.blueSoft,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    zIndex: 2,
    borderWidth: 1,
  },

  placeCard: {
    flex: 1,
    minHeight: 62,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#0F1B2D",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  placeTextContainer: {
    flex: 1,
    paddingRight: 8,
  },

  placeName: { fontSize: 16, fontWeight: "800", color: C.ink },

  placeDescription: { marginTop: 3, fontSize: 13, lineHeight: 18, color: C.muted },

  numberCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: C.blueSoft,
    justifyContent: "center",
    alignItems: "center",
  },

  numberText: { color: C.blue, fontSize: 12, fontWeight: "800" },

  deleteButton: {
    marginLeft: 8,
    padding: 6,
  },

  emptyContainer: {
    paddingVertical: 36,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
  },

  emptyTitle: { marginTop: 12, fontSize: 16, fontWeight: "800", color: C.ink },

  emptyText: { marginTop: 6, fontSize: 13, color: C.muted, textAlign: "center" },

  modalOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 35,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F1B2D",
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F1B2D",
    marginTop: 10,
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#F3F6FA",
    borderWidth: 1,
    borderColor: "#E3E9F1",
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: "#0F1B2D",
  },

  descriptionInput: {
    height: 90,
    paddingTop: 12,
    textAlignVertical: "top",
  },

  modalButtons: {
    flexDirection: "row",
    marginTop: 25,
    gap: 12,
  },

  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DCE3EC",
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
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  submitButton: {
    bottom: 180,
    marginLeft: 20,
    marginRight: 20,
    height: 56,
    overflow: 'hidden',
    borderRadius: 28,
    marginTop: 15,
    shadowColor: "#155B8A",
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

   submitText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
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