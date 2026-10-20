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
  Alert,
  ActivityIndicator,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

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

  const tourinterface = () => {
    router.push({
      pathname: "/passenger/tours/selectBus",
      params: {
        packageId: params.packageId,
        description: params.description,
        packageType: params.packageType,
        totalDistance: params.totalDistance,
        tripDuration: params.tripDuration,
        maxPassengers: params.maxPassengers,
        maxPrice: params.maxPrice,
        Pid: params.Pid,
        Pid1: params.Pid1,
        pfirstName: params.pfirstName,
        plastName:params.plastName,
        pphoneNumber: params.pphoneNumber,
        pemail: params.pemail,
      },
    });
  };


  /*  LOADING SCREEN */

  if (loading) {
    return (
      <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#12966F"/>
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
          colors={["#173C79","#155B8A","#159B79",]}
          start={{x: 0, y: 0,}}
          end={{x: 1, y: 1,}}
          style={styles.header}
        >
          {/* <View style={styles.decorCircle}/> */}

          {/* BRAND */}

          <View style={styles.brandContainer}>
            <View style={styles.brandDot}/>
            <Text style={styles.brandText}>
              JetLink
            </Text>
          </View>

          <Text style={styles.title}>
           Rs {packageData?.maxPrice}
          </Text>

          {/* PACKAGE TYPE */}

          <View style={styles.goldenBadge}>
            <View style={styles.badgeDot}/>
            <Text style={styles.goldenText}>
              {packageData?.packageType || "PACKAGE"}
            </Text>
          </View>

          {/* DESCRIPTION */}

          <Text style={styles.description}>
            {packageData?.description}
          </Text>

          {/*  STATS  */}

          <View style={styles.statsRow}>
            <StatCard
              value={places.length.toString()}
              label="PLACES INCLUDED"
            />

            <StatCard
              value={packageData?.totalDistance || "0 km"}
              label="TOTAL DISTANCE"
            />

            <StatCard
              value={ packageData?.tripDuration || "0h"}
              label="TRIP DURATION"
            />

            <StatCard
              value={packageData?.maxPassengers ?.toString() || "0"}
              label="MAX PASSENGERS"
            />
          </View>
        </LinearGradient>


        {/*  SECTION HEADER  */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Places Included
          </Text>
        </View>

        {/*  PLACES  */}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >

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

                  <View style={[styles.timelineIcon, {borderColor:(item.color || "#12966F") + "30",},]}>
                    {renderIcon(item)}
                  </View>

                  {/* CARD */}

                  <TouchableOpacity style={ styles.placeCard}>
                    <View style={styles.placeTextContainer}>
                      <Text style={styles.placeName}>
                        {item.name}
                      </Text>

                      <Text style={styles.placeDescription} numberOfLines={2}>
                        {item.description}
                      </Text>
                    </View>

                    {/* NUMBER */}

                    <View style={styles.numberCircle}>
                      <Text style={styles.numberText}>
                        {index + 1}
                      </Text>
                    </View>
                  </TouchableOpacity>


                  {/* DELETE */}

                  
                </View>
              )
            )}


            {/* EMPTY STATE */}

            {places.length === 0 && (

              <View style={styles.emptyContainer}>
                <Ionicons name="location-outline" size={45} color="#98A2B3"/>
                <Text style={styles.emptyTitle}>
                  No places added yet
                </Text>

                <Text style={styles.emptyText}>
                  Tap Add Place to add your
                  first destination.
                </Text>
              </View>
            )}
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.submitButton} onPress={tourinterface} >
          <LinearGradient
            colors={["#173C79","#155B8A","#159B79",]}
            start={{x: 0, y: 0,}}
            end={{x: 1, y: 1,}}
            style={styles.submitGradient}
          >
          <Text style={styles.submitText}>Select Bus</Text>
          </LinearGradient>
        </TouchableOpacity>

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
                    pathname: "/passenger/tours/PackagesScreen1",
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
    
          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("routes"); setIsSearching(!isSearching); }}>
            <FontAwesome name={isSearching ? "close" : "search"} size={24} color={activeTab  === "routes" ? "#0057D9" : "#8A8A8A"}/>
            <Text style={[ styles.label1,activeTab === "routes" && styles.activeLabel,]}>
              Routes
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

function StatCard({value,label,}: {value: string;label: string;}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>
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

  container: {
    flex: 1,
    backgroundColor: "#F3F5F8",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F5F8",
  },

  loadingText: {
    marginTop: 12,
    color: "#667085",
    fontSize: 14,
  },

  header: {
    minHeight: 220,
    paddingTop: 55,
    paddingHorizontal: 24,
    paddingBottom: 25,
    overflow: "hidden",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  decorCircle: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    right: -70,
    top: -40,
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

  brandText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  goldenBadge: {
    position: "absolute",
    right: 25,
    top: 55,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor:
      "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.15)",
  },

  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: 10,
    backgroundColor: "#D8E2A5",
    marginRight: 5,
  },

  goldenText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#f3e763",
    letterSpacing: 0.5,
  },

  category: {
    marginTop: 32,
    color: "#B7C8D8",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 2,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 8,
  },

  description: {
    color: "#D5E1EA",
    fontSize: 10,
    lineHeight: 16,
    marginTop: 12,
    maxWidth: "90%",
  },

  statsRow: {
    flexDirection: "row",
    marginTop: 18,
    gap: 8,
  },

  statCard: {
    flex: 1,
    minHeight: 45,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  statValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  statLabel: {
    color: "#C7D6DF",
    fontSize: 6,
    fontWeight: "700",
    marginTop: 5,
    letterSpacing: 0.4,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    marginBottom: 10,
    marginTop: 20,
    marginHorizontal: 24,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#344054",
  },

  addPlaceButton: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#12966F",
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

  scrollContent: {
    paddingBottom: 100,
  },

  placesSection: {
    backgroundColor: "#F4F6F8",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 70,
  },

  timelineContainer: {
    position: "relative",
  },

  timelineLine: {
    position: "absolute",
    width: 2,
    backgroundColor: "#D7DEE5",
    left: 14,
    top: 15,
    bottom: 20,
  },

  placeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  timelineIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#EAF0F4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    zIndex: 2,
    borderWidth: 1,
  },

  placeCard: {
    flex: 1,
    minHeight: 57,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  placeTextContainer: {
    flex: 1,
    paddingRight: 8,
  },

  placeName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#344054",
  },

  placeDescription: {
    marginTop: 4,
    fontSize: 10,
    color: "#8A96A3",
  },

  numberCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#23384A",
    justifyContent: "center",
    alignItems: "center",
  },

  numberText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "800",
  },

  deleteButton: {
    marginLeft: 8,
    padding: 6,
  },

  emptyContainer: {
    paddingVertical: 70,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "700",
    color: "#344054",
  },

  emptyText: {
    marginTop: 6,
    fontSize: 12,
    color: "#98A2B3",
    textAlign: "center",
  },

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
    color: "#344054",
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#344054",
    marginTop: 10,
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: "#344054",
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
    borderColor: "#D0D5DD",
    justifyContent: "center",
    alignItems: "center",
  },

  cancelButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#667085",
  },

  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#12966F",
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