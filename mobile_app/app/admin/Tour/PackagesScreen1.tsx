import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import SearchPanel from "../../../components/SearchPanel";
import { Alert } from "../../../components/JetAlert";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
  FontAwesome,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AlertBadge from "../../../components/AlertBadge";
import TourPackageCard, { TourPackage } from "../../../components/TourPackageCard";
import PickupTownPicker from "../../../components/PickupTownPicker";

import FieldError from "../../../components/FieldError";
import { useFieldErrors } from "../../../utils/validation";
const BUS_TYPES = ["Standard bus", "Semi-luxury", "Luxury", "A/C bus"];

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type PackageItem = TourPackage;

type PackageTier = "Silver" | "Gold" | "Diamond";

const tierColors: Record<
  PackageTier,
  { main: string; pale: string; border: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }
> = {
  Silver: {
    main: "#64748B",
    pale: "#F1F5F9",
    border: "#CBD5E1",
    icon: "leaf",
  },
  Gold: {
    main: "#D97706",
    pale: "#FFFBEB",
    border: "#F59E0B",
    icon: "crown-outline",
  },
  Diamond: {
    main: "#0284C7",
    pale: "#F0F9FF",
    border: "#38BDF8",
    icon: "diamond-stone",
  },
};

const getTier = (value: string): PackageTier => {
  const normalized = value.toLowerCase();
  if (normalized.includes("gold")) return "Gold";
  if (normalized.includes("diamond")) return "Diamond";
  return "Silver";
};

const getDurationLabel = (duration: string) => duration || "Duration not set";

export default function PackagesScreen() {
  const router = useRouter();
  const { validate: validateFields, errorFor: fieldError } = useFieldErrors();
  const params = useLocalSearchParams();

  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [packageType, setPackageType] = useState<PackageTier>("Silver");
  const [description, setDescription] = useState("");
  const [totalDistance, setTotalDistance] = useState("");
  const [tripDuration, setTripDuration] = useState("");
  const [maxPassengers, setMaxPassengers] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [extraKmPrice, setExtraKmPrice] = useState("");
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  // const [pickupMinKm, setPickupMinKm] = useState("");
  // const [pickupMaxKm, setPickupMaxKm] = useState("");
  const [busType, setBusType] = useState("Standard bus");
  const [destPickerOpen, setDestPickerOpen] = useState(false);

  const resetForm = () => {
    setPackageType("Silver");
    setDescription("");
    setTotalDistance("");
    setTripDuration("");
    setMaxPassengers("");
    setMaxPrice("");
    setExtraKmPrice("");
    setTitle("");
    setDestination("");
    
    setBusType("Standard bus");
  };

  const getPackages = useCallback(async () => {
    try {
      setLoading(true);
      if (!API_URL) throw new Error("EXPO_PUBLIC_API_URL is not configured.");

      const response = await fetch(`${API_URL}/packages`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load packages");
      }
      setPackages(Array.isArray(data.data) ? data.data : []);
    } catch (error: any) {
      console.log("Get Packages Error:", error);
      Alert.alert("Error", error.message || "Could not load packages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getPackages();
  }, [getPackages]);

  const openEditPackage = (item: PackageItem) => {
    setSelectedPackage(item);
    setPackageType(getTier(item.packageType || ""));
    setDescription(item.description || "");
    setTotalDistance(item.totalDistance || "");
    setTripDuration(item.tripDuration || "");
    setMaxPassengers(String(item.maxPassengers ?? ""));
    setMaxPrice(String(item.maxPrice ?? ""));
    setExtraKmPrice(String(item.extraKmPrice ?? 0));
    setTitle(item.title || "");
    setDestination(item.destination || "");
    
    setBusType(item.busType || "Standard bus");
    setEditModalVisible(true);
  };

  

  const createPackage = async () => {
    if (!validateFields([
      { key: "destination", label: "Destination", value: destination },
      { key: "title", label: "Package title", value: title },
      { key: "description", label: "Description", value: description },
      { key: "maxPrice", label: "Price", value: maxPrice, type: "number", min: 1 },
      { key: "extraKmPrice", label: "Extra km price", value: extraKmPrice, type: "number" },
      { key: "tripDuration", label: "Duration", value: tripDuration },
      { key: "totalDistance", label: "Distance", value: totalDistance },
      { key: "maxPassengers", label: "Maximum passengers", value: maxPassengers, type: "int" },
    ])) return;

    
    if (!description.trim()) {
      Alert.alert("Required", "Please enter a package description.");
      return;
    }
    if (!maxPrice.trim() || Number(maxPrice) <= 0) {
      Alert.alert("Required", "Please enter a valid package price.");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`${API_URL}/packages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          packageType,
          totalDistance: totalDistance.trim(),
          tripDuration: tripDuration.trim(),
          maxPassengers: Number(maxPassengers) || 0,
          maxPrice: Number(maxPrice) || 0,
          extraKmPrice: Number(extraKmPrice) || 0,
          title: title.trim(),
          destination: destination.trim(),
          
          busType: busType.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create package");
      }

      setPackages((previous) => [data.data, ...previous]);
      setModalVisible(false);
      resetForm();
      Alert.alert("Success", "Package created successfully.");
    } catch (error: any) {
      console.log("Create Package Error:", error);
      Alert.alert("Error", error.message || "Could not create package");
    } finally {
      setSaving(false);
    }
  };

  const updatePackage = async () => {
    if (!validateFields([
      { key: "destination", label: "Destination", value: destination },
      { key: "title", label: "Package title", value: title },
      
      { key: "description", label: "Description", value: description },
      { key: "maxPrice", label: "Price", value: maxPrice, type: "number", min: 1 },
      { key: "extraKmPrice", label: "Extra km price", value: extraKmPrice, type: "number" },
      { key: "tripDuration", label: "Duration", value: tripDuration },
      { key: "totalDistance", label: "Distance", value: totalDistance },
      { key: "maxPassengers", label: "Maximum passengers", value: maxPassengers, type: "int" },
    ])) return;

    if (!selectedPackage) return;
    

    try {
      setUpdating(true);
      const response = await fetch(`${API_URL}/packages/${selectedPackage._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          packageType,
          totalDistance: totalDistance.trim(),
          tripDuration: tripDuration.trim(),
          maxPassengers: Number(maxPassengers) || 0,
          maxPrice: Number(maxPrice) || 0,
          extraKmPrice: Number(extraKmPrice) || 0,
          title: title.trim(),
          destination: destination.trim(),
          
          busType: busType.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update package");
      }

      setPackages((previous) =>
        previous.map((item) =>
          item._id === selectedPackage._id ? data.data : item
        )
      );
      setEditModalVisible(false);
      setSelectedPackage(null);
      Alert.alert("Success", "Package updated successfully.");
    } catch (error: any) {
      console.log("Update Package Error:", error);
      Alert.alert("Error", error.message || "Could not update package");
    } finally {
      setUpdating(false);
    }
  };

  const deletePackage = (packageId: string) => {
    Alert.alert(
      "Delete package",
      "Are you sure you want to delete this package?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/packages/${packageId}`, {
                method: "DELETE",
              });
              const data = await response.json();
              if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to delete package");
              }
              setPackages((previous) =>
                previous.filter((item) => item._id !== packageId)
              );
              Alert.alert("Success", "Package deleted successfully.");
            } catch (error: any) {
              console.log("Delete Package Error:", error);
              Alert.alert("Error", error.message || "Could not delete package");
            }
          },
        },
      ]
    );
  };

  const openCreateModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const goToPackageDetails = (item: PackageItem) => {
    router.push({
      pathname: "/admin/Tour/PackageDetails",
      params: {
        packageId: item._id,
        Aid: params.Aid,
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
      },
    });
  };

  const filteredPackages = packages.filter((item) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      item.packageType?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.totalDistance?.toLowerCase().includes(query) ||
      item.title?.toLowerCase().includes(query) ||
      item.destination?.toLowerCase().includes(query)
    );
  });

  const renderPackage = ({ item }: { item: PackageItem }) => (
    <TourPackageCard
      pkg={item}
      onPress={() => goToPackageDetails(item)}
      onEdit={() => openEditPackage(item)}
      onDelete={() => deletePackage(item._id)}
    />
  );

  const renderForm = (isEdit: boolean) => (
      <Modal
        visible={isEdit ? editModalVisible : modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (isEdit) setEditModalVisible(false);
          else setModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEdit ? "Update tour package" : "New tour package"}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  if (isEdit) setEditModalVisible(false);
                  else {
                    setModalVisible(false);
                    resetForm();
                  }
                }}
              >
                <Ionicons name="close" size={23} color="#64748B" />
              </TouchableOpacity>
            </View>
  
            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={styles.formContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.fieldLabel}>Package type</Text>
              <View style={styles.tierOptions}>
                {(["Silver", "Gold", "Diamond"] as PackageTier[]).map((tier) => {
                  const colors = tierColors[tier];
                  const selected = packageType === tier;
                  return (
                    <TouchableOpacity
                      key={tier}
                      style={[
                        styles.tierOption,
                        selected && {
                          backgroundColor: colors.pale,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => setPackageType(tier)}
                    >
                      <MaterialCommunityIcons
                        name={colors.icon}
                        size={23}
                        color={selected ? colors.main : "#64748B"}
                      />
                      <Text
                        style={[
                          styles.tierOptionText,
                          selected && { color: colors.main },
                        ]}
                      >
                        {tier}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
  
              <Text style={styles.fieldLabel}>Destination</Text>
              <TouchableOpacity style={styles.selectInput} onPress={() => setDestPickerOpen(true)}>
                <Ionicons name="location-outline" size={18} color="#12966F" />
                <Text style={[styles.selectText, !destination && { color: "#94A3B8" }]}>
                  {destination || "Choose destination town"}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#64748B" />
              </TouchableOpacity>
              <FieldError message={fieldError("destination", destination)} />

              <Text style={styles.fieldLabel}>Package title</Text>
              <TextInput
                style={styles.input}
                placeholder={destination ? `e.g. ${destination} ${packageType} Tour` : "e.g. Jaffna Silver Tour"}
                placeholderTextColor="#94A3B8"
                value={title}
                onChangeText={setTitle}
              />
              <FieldError message={fieldError("title", title)} />

              {/* <Text style={styles.fieldLabel}>Pickup towns distance from destination (km)</Text>
              <View style={styles.twoColumnRow}>
                <View style={styles.halfField}>
                  <TextInput
                    style={styles.input}
                    placeholder="From e.g. 200"
                    placeholderTextColor="#94A3B8"
                    value={pickupMinKm}
                    onChangeText={setPickupMinKm}
                    keyboardType="numeric"
                  />
                  <FieldError message={fieldError("pickupMinKm", pickupMinKm)} />
                </View>
                <View style={styles.halfField}>
                  <TextInput
                    style={styles.input}
                    placeholder="To e.g. 300"
                    placeholderTextColor="#94A3B8"
                    value={pickupMaxKm}
                    onChangeText={setPickupMaxKm}
                    keyboardType="numeric"
                  />
                  <FieldError message={fieldError("pickupMaxKm", pickupMaxKm)} />
                </View>
              </View>
              <Text style={styles.hint}>Enter 0 and 0 to allow pickup from any town.</Text> */}

              <Text style={styles.fieldLabel}>Bus type</Text>
              <View style={styles.chipRow}>
                {BUS_TYPES.map((t) => {
                  const on = busType === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setBusType(t)}
                      style={[styles.chip, on && styles.chipOn]}
                    >
                      <Text style={[styles.chipText, on && styles.chipTextOn]}>{t}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
  
              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Describe the experience passengers can expect..."
                placeholderTextColor="#94A3B8"
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
              />
              <FieldError message={fieldError("description", description)} />
  
              <Text style={styles.fieldLabel}>Price per vehicle (LKR)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 55000"
                placeholderTextColor="#94A3B8"
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="numeric"
              />
              <FieldError message={fieldError("maxPrice", maxPrice)} />

              <Text style={styles.fieldLabel}>Extra km price (LKR per km)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 150"
                placeholderTextColor="#94A3B8"
                value={extraKmPrice}
                onChangeText={setExtraKmPrice}
                keyboardType="numeric"
              />
              <FieldError message={fieldError("extraKmPrice", extraKmPrice)} />
              <Text style={styles.hint}>Passengers pay this for each extra km they add. Enter 0 to turn extra km off.</Text>
  
              <View style={styles.twoColumnRow}>
                <View style={styles.halfField}>
                  <Text style={styles.fieldLabel}>Duration</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 2D / 1N"
                    placeholderTextColor="#94A3B8"
                    value={tripDuration}
                    onChangeText={setTripDuration}
                  />
                  <FieldError message={fieldError("tripDuration", tripDuration)} />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.fieldLabel}>Distance (km)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 700km"
                    placeholderTextColor="#94A3B8"
                    value={totalDistance}
                    onChangeText={setTotalDistance}
                  />
                  <FieldError message={fieldError("totalDistance", totalDistance)} />
                </View>
              </View>
  
              <Text style={styles.fieldLabel}>Maximum passengers</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter passenger capacity"
                placeholderTextColor="#94A3B8"
                value={maxPassengers}
                onChangeText={setMaxPassengers}
                keyboardType="numeric"
              />
              <FieldError message={fieldError("maxPassengers", maxPassengers)} />
              <Text style={styles.formNote}>
                If the title is empty, it is shown as "Destination + Tier + Tour".
                The places line on the card comes from the places added on the package details page.
              </Text>
            </ScrollView>

            <PickupTownPicker
              visible={destPickerOpen}
              title="Choose destination"
              selected={destination}
              onSelect={(town) => {
                setDestination(town ?? "");
                setDestPickerOpen(false);
              }}
              onClose={() => setDestPickerOpen(false)}
            />
  
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  if (isEdit) setEditModalVisible(false);
                  else {
                    setModalVisible(false);
                    resetForm();
                  }
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                disabled={isEdit ? updating : saving}
                onPress={isEdit ? updatePackage : createPackage}
              >
                {(isEdit ? updating : saving) ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {isEdit ? "Save changes" : "Save package"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );

  
  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: "", headerShown: false }} />
        <View style={styles.loadingContainer}>
          <StatusBar barStyle="light-content" />
          <ActivityIndicator size="large" color="#12966F" />
          <Text style={styles.loadingText}>Loading packages...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#173C79" />

        <LinearGradient
          colors={["#173C79","#155B8A","#159B79",]}
            start={{x: 0, y: 0,}}
            end={{x: 1, y: 1,}}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Tour Packages</Text>
        </LinearGradient>

        <FlatList
          data={filteredPackages}
          keyExtractor={(item) => item._id}
          renderItem={renderPackage}
          style={styles.packageList}
          contentContainerStyle={[
            styles.listContent,
            filteredPackages.length === 0 && styles.emptyListContent,
          ]}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={getPackages}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={54} color="#98A2B3" />
              <Text style={styles.emptyTitle}>
                {searchQuery ? "No matching packages" : "No packages yet"}
              </Text>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? "Try another search term."
                  : "Create your first tour package to get started."}
              </Text>
            </View>
          }
        />

        
          <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
            <LinearGradient
              colors={["#1D477F", "#117F83", "#109B7D"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.addGradient}
            >
              <Ionicons name="add" size={25} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add package</Text>
            </LinearGradient>
          </TouchableOpacity>
        

          <SearchPanel
          visible={isSearching}
          query={searchQuery}
          onChangeQuery={setSearchQuery}
          onClose={() => { setIsSearching(false); setSearchQuery(""); }}
          role={"admin"}
          params={params}
          listLabel="packages"
        />

          <View style={styles.bottomNav}>
    
          
          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("home"); if (isSearching) {
                  setIsSearching(false); setSearchQuery(""); 
                }
    
                else {
                  router.push({
                    pathname: "/admin/Tour/Tour",
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
    
          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("routes"); if (isSearching) setSearchQuery(""); setIsSearching(!isSearching); }}>
            <FontAwesome name={isSearching ? "close" : "search"} size={24} color={activeTab  === "routes" ? "#0057D9" : "#8A8A8A"}/>
            <Text style={[ styles.label1,activeTab === "routes" && styles.activeLabel,]}>
              Search
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
        
        {renderForm(false)}
        {renderForm(true)}            
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F5F8",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F2F5F8",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#667085",
    fontSize: 14,
  },
  header: {
    paddingTop: 58,
    paddingBottom: 39,
    paddingHorizontal: 24,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    marginTop: 9,
    fontSize: 13,
    fontWeight: "500",
    color: "#EAF6F5",
  },
  settingsBubble: {
    position: "absolute",
    zIndex: 3,
    top: 195,
    right: 23,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  packageList: {
    flex: 1,
    marginTop: -8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 245,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  packageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E6EBF1",
    elevation: 3,
    shadowColor: "#1E293B",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },
  tierBadge: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 18,
  },
  tierBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  tierIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#182B45",
  },
  packageDescription: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 15,
  },
  currency: {
    color: "#475569",
    fontSize: 13,
    marginRight: 6,
    fontWeight: "500",
  },
  price: {
    color: "#1E293B",
    fontSize: 27,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  viewDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 7,
  },
  startingPrice: {
    color: "#64748B",
    fontSize: 11,
    flexShrink: 1,
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 4,
    paddingLeft: 8,
  },
  detailsButtonText: {
    color: "#12966F",
    fontWeight: "700",
    fontSize: 12,
  },
  expandedDetails: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  expandedDescription: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 19,
  },
  expandedLink: {
    marginTop: 9,
    fontSize: 15,
    color: "#0F8F76",
    fontWeight: "700",
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#EEF2F6",
    marginTop: 20,
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
  },
  detailText: {
    color: "#475569",
    fontSize: 12,
    flexShrink: 1,
  },
  actions: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconButton: {
    padding: 3,
  },
  bottomActions: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: "rgba(242,245,248,0.97)",
  },
  addButton: {
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
  addGradient: {
    minHeight: 59,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
 
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  navLabel: {
    fontSize: 11,
    color: "#64748B",
  },
  
  searchContainer: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 45,
    color: "#334155",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: "800",
    color: "#344054",
  },
  emptyText: {
    marginTop: 6,
    fontSize: 13,
    color: "#98A2B3",
    textAlign: "center",
    lineHeight: 19,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.48)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    height: "91%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 10,
    overflow: "hidden",
  },
  modalHandle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 4,
    backgroundColor: "#E2E8F0",
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#182B45",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  formScroll: {
    flex: 1,
  },
  formContent: {
    paddingHorizontal: 22,
    paddingTop: 6,
    paddingBottom: 22,
  },
  fieldLabel: {
    color: "#344054",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 9,
    marginTop: 12,
  },
  tierOptions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 6,
  },
  tierOption: {
    flex: 1,
    height: 72,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5EDF5",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  tierOptionText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
  },
  selectInput: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E2EAF3",
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
  },
  selectText: { flex: 1, fontSize: 14, color: "#334155" },
  hint: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2EAF3",
    backgroundColor: "#fff",
  },
  chipOn: { backgroundColor: "#E8F7F2", borderColor: "#12966F" },
  chipText: { fontSize: 12.5, color: "#475569", fontWeight: "600" },
  chipTextOn: { color: "#12966F" },
  readOnlyName: {
    height: 48,
    justifyContent: "center",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E2EAF3",
    paddingHorizontal: 14,
    backgroundColor: "#F8FAFC",
  },
  readOnlyNameText: {
    fontSize: 14,
    color: "#475569",
  },
  input: {
    minHeight: 48,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E2EAF3",
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#334155",
    backgroundColor: "#FFFFFF",
    marginBottom: 3,
  },
  multilineInput: {
    height: 112,
    paddingTop: 13,
    textAlignVertical: "top",
  },
  twoColumnRow: {
    flexDirection: "row",
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  formNote: {
    marginTop: 15,
    fontSize: 11,
    lineHeight: 17,
    color: "#94A3B8",
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 22,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    backgroundColor: "#FFFFFF",
  },
  cancelButton: {
    width: "32%",
    minHeight: 52,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#E2EAF3",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  cancelButtonText: {
    color: "#182B45",
    fontSize: 14,
    fontWeight: "700",
  },
  saveButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 28,
    backgroundColor: "#147F7D",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
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
