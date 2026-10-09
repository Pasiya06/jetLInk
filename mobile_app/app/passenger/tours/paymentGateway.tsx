import React, { useState, useCallback } from 'react';
import { Stack, useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";

import { 
  StyleSheet, 
  View, 
  Text,  
  TouchableOpacity, 
  SafeAreaView, 
  TextInput,
  Alert 
} from 'react-native';
import { 
  Ionicons, 
  Feather, 
  MaterialCommunityIcons,  
  FontAwesome
} from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';


const JetLinkInterface: React.FC = () => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const params = useLocalSearchParams();
  const router = useRouter();
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

    const handlePayment = () => {
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
        <LinearGradient
                colors={["#173C79","#155B8A","#159B79",]}
          start={{x: 0, y: 0,}}
          end={{x: 1, y: 1,}}
                style={styles.submitGradient1}
            >
        <View style={styles.header}>
            
        
          <TouchableOpacity >
            <Text style={styles.title}>JetLink</Text>
          </TouchableOpacity>
                 
        </View>
        </LinearGradient> 
             
        <View style={styles.card}>
         {/* Tabs */}
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={styles.tabItem}
                onPress={() => setActiveTab1('card')}
              >
                <Ionicons
                  name="card-outline"
                  size={16}
                  color={activeTab1 === 'card' ? '#1E6091' : '#A3A3A3'}
                />
                <Text style={[styles.tabText, activeTab1 === 'card' && styles.tabTextActive]}>
                  Card Payment
                </Text>
                {activeTab1 === 'card' && <View style={styles.tabUnderline} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tabItem}
                onPress={() => setActiveTab1('qr')}
              >
                <MaterialCommunityIcons
                  name="qrcode"
                  size={16}
                  color={activeTab === 'qr' ? '#1E6091' : '#A3A3A3'}
                />
                <Text style={[styles.tabText, activeTab === 'qr' && styles.tabTextActive]}>
                  QR Payment
                </Text>
                {activeTab === 'qr' && <View style={styles.tabUnderline} />}
              </TouchableOpacity>
            </View>

            {activeTab1 === 'card' ? (
              <>
                {/* Card brand row */}
                <View style={styles.brandRow}>
                  {cardBrands.map((brand, index) => (
                    <View key={index} style={styles.brandChip}>
                      <MaterialCommunityIcons name={brand.icon as any} size={16} color="#5A5A5A" />
                    </View>
                  ))}
                </View>

                {/* Name on card */}
                <Text style={styles.inputLabel}>Name on card</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    value={nameOnCard}
                    onChangeText={setNameOnCard}
                    placeholder="Name on card"
                    placeholderTextColor="#B0B0B0"
                  />
                </View>

                {/* Card number */}
                <Text style={styles.inputLabel}>Card number</Text>
                <View style={styles.inputWrapper}>
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

                {/* Expiry / CVC row */}
                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>Expiry</Text>
                    <View style={styles.inputWrapper}>
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
                  </View>

                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>CVC</Text>
                    <View style={styles.inputWrapper}>
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
                  </View>
                </View>

                

                <Text style={styles.secureText}>
                  Securely processed and powered by{' '}
                  <Text style={styles.secureBold}>BANCSTAC</Text>
                </Text>
              </>
            ) : (
              <View style={styles.qrPlaceholder}>
                <MaterialCommunityIcons name="qrcode-scan" size={120} color="#D0D0D0" />
                <Text style={styles.qrText}>Scan to pay with your banking app</Text>
              </View>
            )}
          </View>
        <TouchableOpacity style={styles.submitButton} onPress={handlePayment}>
            <LinearGradient
                colors={["#173C79","#155B8A","#159B79",]}
          start={{x: 0, y: 0,}}
          end={{x: 1, y: 1,}}
                style={styles.submitGradient}
            >
            <Text style={styles.submitText}>Pay</Text>
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
      
    </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
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

  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  brandChip: {
    width: 40,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#F5F6FA',
    justifyContent: 'center',
    alignItems: 'center',
  },

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


  secureText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#A3A3A3',
    marginTop: 14,
  },

  secureBold: {
    fontWeight: '700',
    color: '#5A5A5A',
  },

  qrPlaceholder: {
    alignItems: 'center',
    paddingVertical: 40,
  },

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