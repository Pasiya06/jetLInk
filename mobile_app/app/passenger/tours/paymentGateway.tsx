import React, { useState, useCallback } from 'react';
import { Stack, useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";

import { 
  StyleSheet, 
  View, 
  Text,  
  TouchableOpacity, 
  SafeAreaView, 
  TextInput,
  ScrollView,
} from 'react-native';
import SearchPanel from "../../../components/SearchPanel";
import { Alert } from "../../../components/JetAlert";
import { 
  Ionicons, 
  Feather, 
  MaterialCommunityIcons,  
  FontAwesome
} from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';


import FieldError from "../../../components/FieldError";
import { useFieldErrors } from "../../../utils/validation";
import { ScreenHeader, GradientButton, C, ui } from "../../../components/JetUI";
import AlertBadge from "../../../components/AlertBadge";
const JetLinkInterface: React.FC = () => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const params = useLocalSearchParams();
  const router = useRouter();
  const { validate: validateFields, errorFor: fieldError } = useFieldErrors();
  const [activeTab, setActiveTab] = useState('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab1, setActiveTab1] = useState<'card' | 'qr'>('card');
  const card:string = "card"
  const [nameOnCard, setNameOnCard] = useState('Visa');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const handleCardNumberChange = (text: string) => {
    // Remove non-digits
    let formatted = text.replace(/\D/g, "");

    // Limit to 16 digits
    formatted = formatted.substring(0, 16);

    // Add a space every 4 digits
    formatted = formatted.replace(/(.{4})/g, "$1 ").trim();

    setCardNumber(formatted);
  };

  const handleExpiryChange = (text: string) => {
    // Keep only numbers
    let formatted = text.replace(/\D/g, "");

    // Limit to 4 digits (MMYY)
    if (formatted.length > 4) {
      formatted = formatted.substring(0, 4);
    }

    // Add "/" after month
    if (formatted.length > 2) {
      formatted = `${formatted.substring(0, 2)}/${formatted.substring(2)}`;
    }

    setExpiry(formatted);
  };
  
    const cardBrands = [
      { name: 'VISA', icon: 'credit-card' },
      { name: 'MC', icon: 'credit-card-outline' },
      { name: 'AMEX', icon: 'credit-card-check-outline' },
      { name: 'DINERS', icon: 'credit-card-multiple-outline' },
      { name: 'DISC', icon: 'credit-card-scan-outline' },
      { name: 'UPAY', icon: 'credit-card-wireless-outline' },
    ];

    const handleSearch = () => {
        router.push({
            pathname: "/passenger/parcel/otpVerify",
            params:{ 
              Sid: params.Sid,
              scheduleId: params.scheduleId,
              bNumber: params.bNumber,

              Pid: params.Pid,
              Pid1: params.Pid1,
              pfirstName: params.pfirstName,
              plastName:params.plastName,
              pphoneNumber: params.pphoneNumber,
              pemail: params.pemail,
              sendername:params.sendername,
              smobilenumber:params.smobilenumber,
              semail:params.semail,
              receivername:params.receivername,
              rmobilenumber:params.rmobilenumber,
              remail:params.remail,
              weight:params.weight,
              pickup:params.pickup,
              drop:params.drop,
              date:params.date,
              time:params.depaturetime,
              totalFare:params.totalFare,
            } 
            
        });
      };

    const processPayment = async () => {
      try {
        const response = await fetch(`${API_URL}/payment/pay`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cardNumber,
            expiry,
            cvc,
          }),
        });

        const data = await response.json();

       if (data.success) {
            router.push({
              pathname: "/passenger/tours/otpVerify",
              params:{ 
                busNumber: params.busNumber,
                driverNIC: params.driverNIC,
                conductorNIC: params.conductorNIC,
                driverD: params.driverD,
                conductorD: params.conductorD,
                isOnline: params.isOnline,
                date: params.date,
                pickup: params.pickup,
                pickupLat: params.pickupLat,
                pickupLng: params.pickupLng,
                pickupAddress: params.pickupAddress,
                time: params.time,
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
              } 
          });
            return;
        }

        switch (data.message) {
            case "Invalid card number":
                Alert.alert("Invalid Card Number");
                break;

            case "Card expired":
                Alert.alert("Card Expired");
                break;

            case "CVC validation failed":
                Alert.alert("Invalid CVC");
                break;

            default:
                Alert.alert("Payment Failed", data.message);
        }
      } catch (error) {
        console.log(error);
        Alert.alert("Error", "Unable to connect to the server.");
      }
    };

    // Make sure the bus wasn't booked by someone else while this passenger was paying
    const handlePayment = async () => {
      if (!validateFields([
        { key: "nameOnCard", label: "Name on card", value: nameOnCard },
        { key: "cardNumber", label: "Card number", value: cardNumber, type: "card" },
        { key: "expiry", label: "Expiry date", value: expiry, type: "expiry" },
        { key: "cvc", label: "CVC", value: cvc, type: "cvc" },
      ])) return;

      try {
        const res = await fetch(
          `${API_URL}/receipts/check-bus?busNumber=${encodeURIComponent(String(params.busNumber ?? ""))}` +
            `&date=${encodeURIComponent(String(params.date ?? ""))}` +
            `&tripDuration=${encodeURIComponent(String(params.tripDuration ?? ""))}`
        );
        const check = await res.json();
        if (!res.ok || !check.available) {
          Alert.alert(
            "Bus not available",
            check.message || "This bus can no longer be booked for these dates. Please choose another bus.",
            [
              {
                text: "Choose another bus",
                onPress: () =>
                  router.push({
                    pathname: "/passenger/tours/selectBus",
                    params: {
                      date: params.date,
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
                      plastName: params.plastName,
                      pphoneNumber: params.pphoneNumber,
                      pemail: params.pemail,
                    },
                  }),
              },
            ]
          );
          return;
        }
      } catch (e) {
        Alert.alert("Error", "Unable to check bus availability. Please try again.");
        return;
      }

      Alert.alert(
        "Confirm Payment",
        "Are you sure you want to proceed with this payment?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Pay Now",
            onPress: processPayment,
          },
        ],
        { cancelable: true }
      );
    };
 
    return (
  
      <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <ScreenHeader eyebrow="Secure payment" title="Pay for tour" /> 
             
        <ScrollView style={ui.body} contentContainerStyle={ui.bodyContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Amount */}
        <LinearGradient
          colors={["#173C79", "#155B8A", "#159B79"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.amountCard}
        >
          <Text style={styles.amountLabel}>Amount to pay</Text>
          <Text style={styles.amountValue}>Rs. {params.maxPrice}</Text>
          <View style={styles.amountMeta}>
            <Ionicons name="map-outline" size={15} color="rgba(255,255,255,0.9)" />
            <Text style={styles.amountMetaText} numberOfLines={1}>
              {params.pickup} → {params.drop} · {params.date}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.card}>
         {/* Tabs */}
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.tabItem, activeTab1 === 'card' && styles.tabItemActive]}
                onPress={() => setActiveTab1('card')}
              >
                <Ionicons
                  name="card-outline"
                  size={16}
                  color={activeTab1 === 'card' ? '#FFFFFF' : C.blue}
                />
                <Text style={[styles.tabText, activeTab1 === 'card' && styles.tabTextActive]}>
                  Card Payment
                </Text>
                
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabItem, activeTab1 === 'qr' && styles.tabItemActive]}
                onPress={() => setActiveTab1('qr')}
              >
                <MaterialCommunityIcons
                  name="qrcode"
                  size={16}
                  color={activeTab1 === 'qr' ? '#FFFFFF' : C.blue}
                />
                <Text style={[styles.tabText, activeTab1 === 'qr' && styles.tabTextActive]}>
                  QR Payment
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab1 === 'card' ? (
              <>
                {/* Card brand row */}
                <View style={styles.brandRow}>
                  {cardBrands.map((brand, index) => (
                    <View key={index} style={styles.brandChip}>
                      <MaterialCommunityIcons name={brand.icon as any} size={22} color={C.muted} />
                    </View>
                  ))}
                </View>

                {/* Name on card */}
                <Text style={styles.inputLabel}>Name on card</Text>
                <View style={styles.inputWrapper}>
                    <Ionicons name="person-outline" size={18} color={C.muted} style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.textInput}
                    value={nameOnCard}
                    onChangeText={setNameOnCard}
                    placeholder="Name on card"
                    placeholderTextColor="#B0B0B0"
                  />
                </View>
                <FieldError message={fieldError("nameOnCard", nameOnCard)} />

                {/* Card number */}
                <Text style={styles.inputLabel}>Card number</Text>
                <View style={styles.inputWrapper}>
                    <Ionicons name="card-outline" size={18} color={C.muted} style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.textInput}
                    value={cardNumber}
                    onChangeText={handleCardNumberChange}
                    placeholder="•••• •••• •••• 4831"
                    placeholderTextColor="#B0B0B0"
                    keyboardType="number-pad"
                    maxLength={19} 
                  />
                </View>
                <FieldError message={fieldError("cardNumber", cardNumber)} />

                {/* Expiry / CVC row */}
                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>Expiry</Text>
                    <View style={styles.inputWrapper}>
                    <Ionicons name="calendar-outline" size={18} color={C.muted} style={{ marginRight: 8 }} />
                      <TextInput
                        style={styles.textInput}
                        value={expiry}
                        onChangeText={handleExpiryChange}
                        placeholder="MM / YY"
                        placeholderTextColor="#B0B0B0"
                        keyboardType="number-pad"
                        maxLength={5}
                      />
                    </View>
                    <FieldError message={fieldError("expiry", expiry)} />
                  </View>

                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>CVC</Text>
                    <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={18} color={C.muted} style={{ marginRight: 8 }} />
                      <TextInput
                        style={styles.textInput}
                        value={cvc}
                        onChangeText={setCvc}
                        placeholder="•••"
                        placeholderTextColor="#B0B0B0"
                        keyboardType="number-pad"
                        secureTextEntry
                        maxLength={3}
                      />
                    </View>
                    <FieldError message={fieldError("cvc", cvc)} />
                  </View>
                </View>

                

                <Text style={styles.secureText}>
                  Securely processed and powered by{' '}
                  <Text style={styles.secureBold}>BANCSTAC</Text>
                </Text>
              </>
            ) : (
              <View style={styles.qrPlaceholder}>
                <MaterialCommunityIcons name="qrcode-scan" size={110} color="#C9D4E2" />
                <Text style={styles.qrText}>Scan to pay with your banking app</Text>
              </View>
            )}
        </View>

        <GradientButton label={`Pay Rs. ${params.maxPrice ?? ""}`} icon="lock-closed-outline" onPress={handlePayment} />
        </ScrollView>

      <SearchPanel
          visible={isSearching}
          query={searchQuery}
          onChangeQuery={setSearchQuery}
          onClose={() => { setIsSearching(false); setSearchQuery(""); }}
          role={"passenger"}
          params={params}
        />
          
        
            <View style={styles.bottomNav}>
        
              
              <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("home"); if (isSearching) {
                      setIsSearching(false); setSearchQuery(""); 
                    }
        
                    else {
                      router.push({
                        pathname: "/passenger/tours/tourSummary",
                        params: {
                          busNumber: params.busNumber,
                          driverNIC: params.driverNIC,
                          conductorNIC: params.conductorNIC,
                          driverD: params.driverD,
                          conductorD: params.conductorD,
                          isOnline: params.isOnline,
                          date: params.date,
                          pickup: params.pickup,
                          pickupLat: params.pickupLat,
                          pickupLng: params.pickupLng,
                          pickupAddress: params.pickupAddress,
                          time: params.time,
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
                <View><Ionicons name="notifications-outline" size={24} color={activeTab === "alerts" ? "#0057D9" : "#8A8A8A"}/><AlertBadge role="passenger" /></View>
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
      
    </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  tabItemActive: { backgroundColor: C.blue },
  amountMetaText: { flex: 1, fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },
  amountMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  amountValue: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', marginTop: 4 },
  amountLabel: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },
  amountCard: { borderRadius: 24, padding: 20 },
  container: { flex: 1, backgroundColor: C.bg },

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
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    elevation: 4,
    shadowColor: '#0F1B2D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },

  svw: {
    width: '100%',
    marginBottom:80,
    marginTop: 3, 
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25, 
  },

  tabRow: { flexDirection: 'row', backgroundColor: C.bg, borderRadius: 16, padding: 5, gap: 6, marginBottom: 16 },

  tabItem: { flex: 1, height: 44, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },

  tabText: { fontSize: 14, fontWeight: '700', color: C.blue },

  tabTextActive: { color: '#FFFFFF' },

  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#1E6091',
    borderRadius: 2,
  },

  brandRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },

  brandChip: { width: 48, height: 34, borderRadius: 10, borderWidth: 1.5, borderColor: '#E3E9F1', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },

  inputLabel: { fontSize: 13, fontWeight: '700', color: C.muted, marginBottom: 6, marginTop: 4 },

  inputWrapper: { flexDirection: 'row', alignItems: 'center', height: 52, borderRadius: 14, borderWidth: 1.5, borderColor: '#E3E9F1', backgroundColor: '#F7F9FC', paddingHorizontal: 14 },

  textInput: { flex: 1, fontSize: 15, fontWeight: '600', color: C.ink },

  row: { flexDirection: 'row', gap: 12 },

  halfInput: { flex: 1 },

  submitButton: {
    
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


  secureText: { fontSize: 12, color: C.muted, textAlign: 'center', marginTop: 14 },

  secureBold: { fontWeight: '800', color: C.ink },

  qrPlaceholder: { alignItems: 'center', paddingVertical: 28, gap: 12 },

  qrText: { fontSize: 14, fontWeight: '600', color: C.muted },

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

export default JetLinkInterface;