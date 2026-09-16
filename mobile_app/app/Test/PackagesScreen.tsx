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
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";

import { 
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Feather ,  
  FontAwesome, 
} from "@expo/vector-icons";

import { LinearGradient } from "expo-linear-gradient";

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
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [description, setDescription] = useState("");
  const [packageType, setPackageType] = useState("");
  const [totalDistance, setTotalDistance] = useState("");
  const [tripDuration, setTripDuration] = useState("");
  const [maxPassengers, setMaxPassengers] = useState("");
  const [maxPrice, setMaxPrice] = useState(""); 
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

  const openEditPackage = (item: PackageItem) => {
    setSelectedPackage(item);
    setDescription(item.description || "");
    setPackageType(item.packageType || "");
    setTotalDistance(item.totalDistance || "");
    setTripDuration(item.tripDuration || "");
    setMaxPassengers(String(item.maxPassengers || ""));
    setMaxPrice(String(item.maxPrice || ""));
    setEditModalVisible(true);};


  const resetForm = () => {
    setDescription("");
    setPackageType("");
    setTotalDistance("");
    setTripDuration("");
    setMaxPassengers("");
    setMaxPrice("");
  };

  const createPackage = async () => {

    // if (!packageName.trim()) {
    //   Alert.alert(
    //     "Required",
    //     "Please enter package name."
    //   );
    //   return;
    // }


    try {
      setSaving(true);
      const response = await fetch(`${API_URL}/packages`,
        {
          method: "POST",
          headers: {"Content-Type":"application/json",},
          body: JSON.stringify({
            description:description.trim(),
            packageType:packageType.trim(),
            totalDistance:totalDistance.trim(),
            tripDuration:tripDuration.trim(),
            maxPassengers:Number(maxPassengers) || 0,
            maxPrice:Number(maxPrice) || 0,
          }),
        }
      );


    const data =
      await response.json();
      if (!response.ok ||!data.success) {
        throw new Error(data.message ||"Failed to create package");
      }

      setPackages(
        (previousPackages) => [
          data.data,
          ...previousPackages,
        ]
      );

      resetForm();
      setModalVisible(false);

      Alert.alert(
        "Success",
        "Package created successfully."
      );


    } 
    
    catch (error: any) {
      console.log(
        "Create Package Error:",
        error
      );

      Alert.alert(
        "Error",
        error.message ||
        "Could not create package"
      );

    }

    finally {
      setSaving(false);
    }

  };

  const deletePackage = (packageId: string) => {
    Alert.alert(
    "Delete Package",
    "Are you sure you want to delete this package? This action cannot be undone.",
    [
      {
        text: "Cancel",
        style: "cancel",
      },

      {
        text: "Delete",
        style: "destructive",

        onPress: async () => {
          try {
            const response = await fetch(`${API_URL}/packages/${packageId}`,
              {
                method:
                "DELETE",
              }
            );

            const data =await response.json();

            if (!response.ok || !data.success) {
              throw new Error(
                data.message ||
                "Failed to delete package"
              );
            }

            /* REMOVE FROM UI */

            setPackages((previousPackages) =>
              previousPackages.filter((item) =>
                item._id !==packageId
              )
            );

            Alert.alert(
              "Success",
              "Package deleted successfully."
            );
          } 
          
          catch (error: any) {
            console.log(
              "Delete Package Error:",
              error
            );

            Alert.alert(
              "Error",
              error.message ||
              "Could not delete package"
            );
          }
        },
      },
    ]);
  };

  const updatePackage = async () => {
    if (!selectedPackage) {
    return;
    }

    try {
    setUpdating(true);
    const response = await fetch(`${API_URL}/packages/${selectedPackage._id}`,{
      method: "PUT",
      headers: {
        "Content-Type":
        "application/json",
      },

      body: JSON.stringify({
      description: description.trim(),
      packageType: packageType.trim(),
      totalDistance: totalDistance.trim(),
      tripDuration: tripDuration.trim(),
      maxPassengers: Number(maxPassengers) || 0,
      maxPrice: Number(maxPrice) || 0,
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to update package");
    }

    /* UPDATE PACKAGE IN LIST */

    setPackages((previousPackages) =>
      previousPackages.map((item) =>
        item._id === selectedPackage._id ? data.data: item
      )
    );

    /* CLOSE MODAL */

    setEditModalVisible(false);
    setSelectedPackage(null);


    Alert.alert(
      "Success",
      "Package updated successfully."
    );

    } 

    catch (error: any) {
    console.log(
      "Update Package Error:",
      error
    );


    Alert.alert(
      "Error",
      error.message ||
      "Could not update package"
    );
    } 
    
    finally {
      setUpdating(false);
    }
  };


  /*PACKAGE CARD */

  const renderPackage = ({item,}: {item: PackageItem;}) => (

    <TouchableOpacity
      style={styles.packageCard}
      activeOpacity={0.8}
      onPress={() => {
          router.push({
            pathname: "/Test/PackageDetails",
            params: {
              packageId: item._id,
            },
          });
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.packageTypeBadge}>
          <Text style={styles.packageTypeText}>
            {item.packageType ||"PACKAGE"}
          </Text>
        </View>
        {/* <MaterialCommunityIcons name="update" size={24} color="black" /> */}
        <TouchableOpacity style={styles.icons} onPress={() => openEditPackage(item) }>
            <MaterialCommunityIcons name="update" size={24} color="#ffb700"/>
        </TouchableOpacity>
        
      </View>

      <Text style={styles.packageName}>
        Rs {item.maxPrice}
      </Text>

      {!!item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Ionicons name="navigate-outline" size={16} color="#12966F"/>
          <Text style={styles.detailText}>
            {item.totalDistance || "No distance"}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color="#12966F" />
          <Text style={styles.detailText}>
            {item.tripDuration || "No duration"}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name="people-outline" size={16} color="#12966F"/>
          <Text style={styles.detailText}>
            {item.maxPassengers || 0}
          </Text>
        </View>
        <TouchableOpacity onPress={() => deletePackage( item._id ) }>
            <MaterialIcons name="delete-forever" size={24} color="#ff0000"/>
        </TouchableOpacity>
      </View>

    </TouchableOpacity>

  );

  if (loading) {

    return (
      <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#12966F"/>
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

      <LinearGradient
        colors={["#173C79","#155B8A","#159B79",]}
        start={{x: 0, y: 0,}}
        end={{x: 1, y: 1,}}
        style={styles.header}
      >
          <View>
            <Text style={styles.headerTitle}>
                Tour Packages
            </Text>
          </View>
      </LinearGradient>
    

      <FlatList
        style={styles.svw}
        data={packages}
        keyExtractor={(item) =>item._id}
        renderItem={renderPackage}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={packages.length === 0 ? styles.emptyList : styles.listContent}
        refreshing={loading}
        onRefresh={getPackages}

        /* EMPTY */

        ListEmptyComponent={
        <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={60} color="#98A2B3"/>
            <Text style={styles.emptyTitle}>
            No packages yet
            </Text>
            <Text style={styles.emptyText}>
            Create your first tour package
            </Text>
        </View>
        }
      />

      {/*CREATE PACKAGE MODAL*/}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
        resetForm();
        setModalVisible(false);
        }}
      >

          <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>

            {/* MODAL HEADER */}

            <View style={styles.modalHeader}>
            <Text style={ styles.modalTitle}>
                Create Package
            </Text>

            <TouchableOpacity
                onPress={() => {
                resetForm();
                setModalVisible(false);
                }}
            >
                <Ionicons name="close" size={26} color="#344054"/>
            </TouchableOpacity>
            </View>

            {/* FORM */}

            <TextInput
            style={[styles.input,styles.descriptionInput,]}
            placeholder="Description"
            placeholderTextColor= "#98A2B3"
            value={description}
            onChangeText={setDescription}
            multiline={true}
            textAlignVertical="top"
            />

            <TextInput
            style={styles.input}
            placeholder="Package Type (GOLDEN PACKAGE)"
            placeholderTextColor= "#98A2B3"
            value={packageType}
            onChangeText={setPackageType}
            />

            <TextInput
            style={styles.input}
            placeholder="Total Distance (Ex: 180 km)"
            placeholderTextColor="#98A2B3"
            value={totalDistance}
            onChangeText={setTotalDistance}
            />

            <TextInput
            style={styles.input}
            placeholder="Trip Duration (Ex: 8h 30m)"
            placeholderTextColor="#98A2B3"
            value={tripDuration}
            onChangeText={setTripDuration}
            />

            <TextInput
            style={styles.input}
            placeholder="Max Passengers"
            placeholderTextColor="#98A2B3"
            value={maxPassengers}
            onChangeText={setMaxPassengers}
            keyboardType="numeric"
            />

            <TextInput
            style={styles.input}
            placeholder="Price"
            placeholderTextColor="#98A2B3"
            value={maxPrice}
            onChangeText={setMaxPrice}
            keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {resetForm(); setModalVisible(false); }}
              >
                <Text style={styles.cancelButtonText}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton} onPress={createPackage} disabled={saving}>
                {saving ? (
                <ActivityIndicator color="#FFFFFF"/>
                ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={19} color="#FFFFFF"/>
                  <Text style={styles.saveButtonText}>
                    Create
                  </Text>
                </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() =>setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>

        {/* HEADER */}

        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            Update Package
          </Text>

          <TouchableOpacity
            onPress={() => {
              setEditModalVisible(false);
              setSelectedPackage(null);
            }}
          >
            <Ionicons name="close" size={26} color="#344054"/>
          </TouchableOpacity>
        </View>

        {/* DESCRIPTION */}

        <TextInput
          style={[styles.input, styles.descriptionInput,]}
          placeholder="Description"
          placeholderTextColor="#98A2B3"
          value={description}
          onChangeText={ setDescription}
          multiline={true}
          textAlignVertical="top"
        />

        {/* PACKAGE TYPE */}

        <TextInput
          style={styles.input}
          placeholder="Package Type"
          placeholderTextColor="#98A2B3"
          value={packageType}
          onChangeText={ setPackageType}
        />

        {/* DISTANCE */}

        <TextInput
          style={styles.input}
          placeholder="Total Distance"
          placeholderTextColor="#98A2B3"
          value={totalDistance}
          onChangeText={setTotalDistance}
        />

        {/* DURATION */}

        <TextInput
          style={styles.input}
          placeholder="Trip Duration"
          placeholderTextColor="#98A2B3"
          value={tripDuration}
          onChangeText={setTripDuration}
        />

        {/* MAX PASSENGERS */}

        <TextInput
          style={styles.input}
          placeholder="Max Passengers"
          placeholderTextColor="#98A2B3"
          value={maxPassengers}
          onChangeText={ setMaxPassengers}
          keyboardType="numeric"
        />

        {/* MAX PRICE */}

        <TextInput
          style={styles.input}
          placeholder="Maximum Price"
          placeholderTextColor="#98A2B3"
          value={maxPrice}
          onChangeText={ setMaxPrice}
          keyboardType="numeric"
        />

        {/* BUTTONS */}

        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={ styles.cancelButton}
            onPress={() => {
              setEditModalVisible(false);
              setSelectedPackage(null);
            }}
          >
            <Text style={ styles.cancelButtonText}>
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={updatePackage}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator color="#FFFFFF"/>
            ) : (
              <>
                <Ionicons name="save-outline" size={19} color="#FFFFFF"/>
                <Text style={styles.saveButtonText}>
                  Update
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
      </View>
      </Modal>

      <TouchableOpacity style={styles.submitButton} onPress={() => setModalVisible(true)}>
        <LinearGradient
          colors={["#173C79","#155B8A","#159B79",]}
          start={{x: 0, y: 0,}}
          end={{x: 1, y: 1,}}
          style={styles.submitGradient}
        >
        <Text style={styles.submitText}>Add package</Text>
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
                        pathname: "/admin/index1",
                        params: {
                          Aid: params.Aid,
                          firstName: params.firstName,
                          lastName: params.lastName,
                          email: params.email,
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

  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "#667085",
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
    borderBottomColor: "#EAECF0",
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
    color: "#667085",
  },

  svw: {
    width: '100%',
    marginBottom:80,
    marginTop: 3, 
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25, 
  },

  listContent: {
    padding: 16,
    paddingBottom: 100,
  },

  packageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  packageTypeBadge: {
    backgroundColor: "#EAF4F2",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  packageTypeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#12966F",
  },

  packageName: {
    marginTop: 12,
    fontSize: 19,
    fontWeight: "800",
    color: "#344054",
  },

  icons: {
    flexDirection: "row",
  },

  category: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "700",
    color: "#667085",
    letterSpacing: 1,
  },

  description: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 18,
    color: "#667085",
  },

  detailsRow: {
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EAECF0",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  detailText: {
    marginLeft: 5,
    fontSize: 10,
    color: "#475467",
  },

  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
  },

  emptyContainer: {
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 15,
    fontSize: 17,
    fontWeight: "700",
    color: "#344054",
  },

  emptyText: {
    marginTop: 6,
    fontSize: 13,
    color: "#98A2B3",
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
    color: "#344054",
  },

  input: {
    height: 48,
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#344054",
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
    borderColor: "#D0D5DD",
    borderRadius: 10,
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