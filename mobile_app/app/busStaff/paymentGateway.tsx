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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { FormField, FieldRow } from "../../components/JetForm";
import { ScreenHeader, GradientButton, GRADIENT, C, ui } from "../../components/JetUI";
import SearchPanel from "../../components/SearchPanel";
import { Alert } from "../../components/JetAlert";
import { 
  Ionicons, 
  Feather, 
  MaterialCommunityIcons,  
  FontAwesome
} from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AlertBadge from "../../components/AlertBadge";


import FieldError from "../../components/FieldError";
import { useFieldErrors } from "../../utils/validation";
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
            pathname: "/busStaff/paymentSuccessful",
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
              time:params.time,
              totalFare:params.totalFare,
              
            },
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
                router.push({
                        pathname: "/busStaff/paymentFail",
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
                          time:params.time,
                          totalFare:params.totalFare,
                          
                        },                    
                      });
                break;

            default:
                Alert.alert("Payment Failed", data.message);
        }
      } catch (error) {
        console.log(error);
        Alert.alert("Error", "Unable to connect to the server.");
      }
    };

    const handlePayment = () => {
      if (!validateFields([
        { key: "nameOnCard", label: "Name on card", value: nameOnCard },
        { key: "cardNumber", label: "Card number", value: cardNumber, type: "card" },
        { key: "expiry", label: "Expiry date", value: expiry, type: "expiry" },
        { key: "cvc", label: "CVC", value: cvc, type: "cvc" },
      ])) return;

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
      <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
        <ScreenHeader eyebrow="Book a parcel · Step 3" title="Payment" />

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView style={ui.body} contentContainerStyle={ui.bodyContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.amountCard}>
              <Text style={styles.amountLabel}>Amount to pay</Text>
              <Text style={styles.amountValue}>Rs. {params.totalFare ?? "0"}</Text>
              <View style={styles.amountRow}>
                <Ionicons name="shield-checkmark-outline" size={15} color="rgba(255,255,255,0.9)" />
                <Text style={styles.amountNote}>Secure payment</Text>
              </View>
            </LinearGradient>

            <View style={[ui.card, styles.payCard]}>
              <View style={styles.segment}>
                <TouchableOpacity
                  style={[styles.segBtn, activeTab1 === "card" && styles.segBtnActive]}
                  onPress={() => setActiveTab1("card")}
                >
                  <Ionicons name="card-outline" size={17} color={activeTab1 === "card" ? C.blue : C.muted} />
                  <Text style={[styles.segText, activeTab1 === "card" && styles.segTextActive]}>Card</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segBtn, activeTab1 === "qr" && styles.segBtnActive]}
                  onPress={() => setActiveTab1("qr")}
                >
                  <MaterialCommunityIcons name="qrcode" size={17} color={activeTab1 === "qr" ? C.blue : C.muted} />
                  <Text style={[styles.segText, activeTab1 === "qr" && styles.segTextActive]}>QR</Text>
                </TouchableOpacity>
              </View>

              {activeTab1 === "card" ? (
                <>
                  <View style={styles.brandRow}>
                    {cardBrands.map((brand, index) => (
                      <View key={index} style={styles.brandChip}>
                        <MaterialCommunityIcons name={brand.icon as any} size={18} color="#5A5A5A" />
                      </View>
                    ))}
                  </View>

                  <FormField
                    label="Name on card"
                    icon="person-outline"
                    value={nameOnCard}
                    onChangeText={setNameOnCard}
                    placeholder="Name on card"
                    error={fieldError("nameOnCard", nameOnCard)}
                  />
                  <FormField
                    label="Card number"
                    icon="card-outline"
                    value={cardNumber}
                    onChangeText={handleCardNumberChange}
                    placeholder="•••• •••• •••• ••••"
                    keyboardType="number-pad"
                    maxLength={19}
                    error={fieldError("cardNumber", cardNumber)}
                  />
                  <FieldRow>
                    <FormField
                      label="Expiry"
                      icon="calendar-outline"
                      value={expiry}
                      onChangeText={handleExpiryChange}
                      placeholder="MM/YY"
                      keyboardType="number-pad"
                      maxLength={5}
                      error={fieldError("expiry", expiry)}
                    />
                    <FormField
                      label="CVC"
                      icon="lock-closed-outline"
                      value={cvc}
                      onChangeText={setCvc}
                      placeholder="•••"
                      keyboardType="number-pad"
                      secureTextEntry
                      maxLength={3}
                      error={fieldError("cvc", cvc)}
                    />
                  </FieldRow>

                  <Text style={styles.secureText}>
                    Securely processed and powered by <Text style={styles.secureBold}>BANCSTAC</Text>
                  </Text>
                </>
              ) : (
                <View style={styles.qrPlaceholder}>
                  <MaterialCommunityIcons name="qrcode-scan" size={110} color={C.chevron} />
                  <Text style={styles.qrText}>Scan to pay with your banking app</Text>
                </View>
              )}
            </View>

            <GradientButton
              label={`Pay Rs. ${params.totalFare ?? ""}`.trim()}
              icon="lock-closed-outline"
              onPress={handlePayment}
            />
          </ScrollView>
        </KeyboardAvoidingView>


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
                        pathname: "/busStaff/parceldetails",
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
                          time:params.time
                                      
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
      
    </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  amountCard: { borderRadius: 24, padding: 20 },
  amountLabel: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase" },
  amountValue: { color: "#FFFFFF", fontSize: 32, fontWeight: "800", marginTop: 4 },
  amountRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  amountNote: { color: "rgba(255,255,255,0.9)", fontSize: 12.5, fontWeight: "600" },
  payCard: { padding: 18 },
  segment: { flexDirection: "row", backgroundColor: "#EEF2F7", borderRadius: 14, padding: 4 },
  segBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 11 },
  segBtnActive: { backgroundColor: "#FFFFFF", elevation: 2, shadowColor: "#0F1B2D", shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  segText: { fontSize: 14, fontWeight: "700", color: "#5B6B7F" },
  segTextActive: { color: "#155B8A" },
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
    width: '90%',
    flex: 1,
    maxHeight: '50%',
    backgroundColor: '#FFF',
    padding: 20,
    marginTop: -50,   
    alignSelf: 'center',
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  svw: {
    width: '100%',
    marginBottom:80,
    marginTop: 3, 
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25, 
  },

  tabRow: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 12,
    marginRight: 24,
  },

  tabText: {
    fontSize: 14,
    color: '#A3A3A3',
    fontWeight: '500',
    marginLeft: 6,
  },

  tabTextActive: {
    color: '#1E6091',
    fontWeight: '700',
  },

  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#1E6091',
    borderRadius: 2,
  },

  brandRow: { flexDirection: "row", gap: 8, marginTop: 16 },

  brandChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: "#E3E9F1", backgroundColor: "#FFFFFF" },

  inputLabel: {
    fontSize: 13,
    color: '#5A5A5A',
    fontWeight: '600',
    marginBottom: 8,
  },

  inputWrapper: {
    backgroundColor: '#F5F6FA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },

  textInput: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
    padding: 0,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  halfInput: {
    width: '48%',
  },

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


  secureText: { fontSize: 12.5, color: "#5B6B7F", textAlign: "center", marginTop: 16 },

  secureBold: {
    fontWeight: '700',
    color: '#5A5A5A',
  },

  qrPlaceholder: { alignItems: "center", justifyContent: "center", paddingVertical: 30 },

  qrText: {
    fontSize: 13,
    color: '#A3A3A3',
    marginTop: 12,
    textAlign: 'center',
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

export default JetLinkInterface;