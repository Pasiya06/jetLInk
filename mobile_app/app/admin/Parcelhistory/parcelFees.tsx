import React from 'react';
import  { useState,useEffect } from 'react';
import { Stack,useRouter,useLocalSearchParams} from "expo-router";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
} from 'react-native';
import { FormSection, FormField } from "../../../components/JetForm";
import { ScreenHeader, GradientButton, C, ui } from "../../../components/JetUI";
import SearchPanel from "../../../components/SearchPanel";
import { Alert } from "../../../components/JetAlert";
import { 
  Ionicons,  
  FontAwesome, 
  Feather 
} from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; 
import AlertBadge from "../../../components/AlertBadge";

import FieldError from "../../../components/FieldError";
import { useFieldErrors } from "../../../utils/validation";
const ParcelService = () => {
    const API_URL = process.env.EXPO_PUBLIC_API_URL;
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const params = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState('');
    const router = useRouter();
    const { validate: validateFields, errorFor: fieldError } = useFieldErrors();

    const [busFare, setBusFare] = useState("");
    const [weighFare, setWeighFare] = useState("");
    const [serviceTax, setServiceTax] = useState("");

    const [loading, setLoading] = useState(false);
    
    const getParcelFee = async () => {
    try {

      const response = await fetch(`${API_URL}/parcelfee`);

      const result = await response.json();


      if (result.success) {

        setBusFare(result.data.busFare.toString());
        setWeighFare(result.data.weighFare.toString());
        setServiceTax(result.data.serviceTax.toString());

      } else {

        Alert.alert("Error", result.message);

      }

    } catch (error) {

      console.log(error);
      Alert.alert("Error", "Failed to load parcel fee");

    }
  };



  // Update Parcel Fee
  const updateParcelFee = async () => {
    if (!validateFields([
      { key: "busFare", label: "Bus fare", value: busFare, type: "number" },
      { key: "weighFare", label: "Weight fare", value: weighFare, type: "number" },
      { key: "serviceTax", label: "Service tax", value: serviceTax, type: "number" },
    ])) return;


    try {

      setLoading(true);


      const response = await fetch(`${API_URL}/parcelfee`, {

        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({

          busFare: Number(busFare),

          weighFare: Number(weighFare),

          serviceTax: Number(serviceTax),

        }),

      });


      const result = await response.json();


      if (result.success) {

        Alert.alert(
          "Success",
          "Parcel fee updated successfully"
        );

        getParcelFee();

      } else {

        Alert.alert(
          "Failed",
          result.message
        );

      }


    } catch (error) {

      console.log(error);

      Alert.alert(
        "Error",
        "Server connection failed"
      );

    } finally {

      setLoading(false);

    }

  };



  useEffect(() => {

    getParcelFee();

  }, []);

  
  const total = (
    Number(busFare || 0) +
    Number(weighFare || 0) +
    Number(serviceTax || 0)
  ).toFixed(2);

  const rows = [
    {
      label: 'Bus Fare',
      value: busFare,
      icon: 'bus-outline',
      color: '#4A90E2',
    },
    {
      label: 'Weight Fee (1kg)',
      value: weighFare,
      icon: 'cube-outline',
      color: '#F5A623',
    },
    {
      label: 'Service Tax',
      value: serviceTax,
      icon: 'receipt-outline',
      color: '#7ED321',
    },
  ];
    
  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
        <ScreenHeader eyebrow="Parcel service" title="Parcel fares" />

        <ScrollView
          style={ui.body}
          contentContainerStyle={ui.bodyContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[ui.card, styles.fareCard]}>
            <Text style={styles.fareHeading}>How a parcel price is made</Text>
            <View style={styles.fareTiles}>
              <View style={[styles.fareTile, { backgroundColor: C.blueSoft }]}>
                <Ionicons name="bus-outline" size={20} color={C.blue} />
                <Text style={styles.fareTileLabel}>Bus fare</Text>
                <Text style={[styles.fareTileValue, { color: C.blue }]}>Rs. {busFare || "0"}</Text>
              </View>
              <View style={[styles.fareTile, { backgroundColor: C.amberSoft }]}>
                <Ionicons name="barbell-outline" size={20} color={C.amber} />
                <Text style={styles.fareTileLabel}>Per kg</Text>
                <Text style={[styles.fareTileValue, { color: C.amber }]}>Rs. {weighFare || "0"}</Text>
              </View>
              <View style={[styles.fareTile, { backgroundColor: C.greenSoft }]}>
                <Ionicons name="receipt-outline" size={20} color={C.green} />
                <Text style={styles.fareTileLabel}>Service tax</Text>
                <Text style={[styles.fareTileValue, { color: C.green }]}>Rs. {serviceTax || "0"}</Text>
              </View>
            </View>
            <View style={styles.exampleRow}>
              <Ionicons name="information-circle-outline" size={16} color={C.muted} />
              <Text style={styles.exampleText}>
                Example 1 kg parcel: Rs. {total}
              </Text>
            </View>
          </View>

          <FormSection title="Change fares" subtitle="New bookings use these prices" icon="create-outline">
            <FormField
              label="Bus fare"
              icon="bus-outline"
              value={busFare}
              onChangeText={(t) => setBusFare(t.replace(/[^0-9.]/g, ""))}
              keyboardType="decimal-pad"
              placeholder="200"
              suffix="LKR"
              error={fieldError("busFare", busFare)}
            />
            <FormField
              label="Weight fee for 1 kg"
              icon="barbell-outline"
              value={weighFare}
              onChangeText={(t) => setWeighFare(t.replace(/[^0-9.]/g, ""))}
              keyboardType="decimal-pad"
              placeholder="50"
              suffix="LKR"
              error={fieldError("weighFare", weighFare)}
            />
            <FormField
              label="Service tax"
              icon="receipt-outline"
              value={serviceTax}
              onChangeText={(t) => setServiceTax(t.replace(/[^0-9.]/g, ""))}
              keyboardType="decimal-pad"
              placeholder="25"
              suffix="LKR"
              error={fieldError("serviceTax", serviceTax)}
            />
          </FormSection>

          <GradientButton
            label={loading ? "Saving…" : "Save fares"}
            icon="checkmark-circle-outline"
            onPress={updateParcelFee}
            disabled={loading}
          />
        </ScrollView>


      <SearchPanel
          visible={isSearching}
          query={searchQuery}
          onChangeQuery={setSearchQuery}
          onClose={() => { setIsSearching(false); setSearchQuery(""); }}
          role={"admin"}
          params={params}
        />
      
      <View style={styles.bottomNav}>

          

          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("home"); if (isSearching) {
                  setIsSearching(false); setSearchQuery(""); 
                }

                else {
                  router.push({
                    pathname: "/admin/Parcelhistory/parcelDetails",
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
            
    </SafeAreaView></>
    
  );
};

const styles = StyleSheet.create({
  fareCard: { padding: 18 },
  fareHeading: { fontSize: 17, fontWeight: "800", color: "#0F1B2D", marginBottom: 12 },
  fareTiles: { flexDirection: "row", gap: 8 },
  fareTile: { flex: 1, borderRadius: 16, padding: 12, gap: 4 },
  fareTileLabel: { fontSize: 12, fontWeight: "700", color: "#5B6B7F", marginTop: 4 },
  fareTileValue: { fontSize: 16, fontWeight: "800" },
  exampleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#EDF1F6" },
  exampleText: { fontSize: 13, color: "#5B6B7F", fontWeight: "600" },
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
    marginLeft: 20,
    marginRight: 20,
    flex: 1,
    maxHeight: '22%',
    backgroundColor: '#FFF',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: -50,   
    alignSelf: 'center',
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  card1: {
    marginLeft: 20,
    marginRight: 20,
    flex: 1,
    maxHeight: '35%',
    backgroundColor: '#FFF',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 20,   
    alignSelf: 'center',
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  
  cardTitle: {
    marginLeft: 20,
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  row: {
    marginLeft: 20,
    marginRight: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  label: {
    fontSize: 14,
    color: '#4A4A4A',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4A90E2',
  },

  svw: {
    width: '100%',
      
  },

  
  inputWrapper: {
    marginLeft: 20,
    marginRight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFC',
    borderWidth: 2,
    borderColor: '#ECEEF2',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 45,
    marginBottom: 15,
  },

  input3dIcon: {
    marginRight: 12,
    width: 25,
    height: 25
  },
  
  inputInnerWrapper: {
    flex: 1,
  },
  inputLabel: {
    marginLeft: 20,
    marginRight: 20,
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
    marginBottom: 10,
  },
  textInput: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
    padding: 0, 
  },

  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
    alignItems: 'center',
  },

  mmr:{
    marginRight: 10,
    marginLeft: 20,
  },

  cardText: {
    paddingHorizontal: 10,
    flex: 1,
    fontSize: 24,
    color: '#0047AB',
    fontWeight: '600',
  },

  searchButton: {
    
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

  searchButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
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

export default ParcelService;