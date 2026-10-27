import React, { useEffect, useRef, useState } from 'react';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, StatusBar, Alert, BackHandler    } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather as Icon, AntDesign, Fontisto, Ionicons } from '@expo/vector-icons';
import { ScreenHeader, IconBox, GRADIENT, C } from "../../../components/JetUI";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const OTP_LENGTH = 6;

// "700km", "700 km", "1,200 KM" -> 700 / 1200 (0 if no number)
const parseDistanceKm = (value: unknown): number => {
  const match = String(value ?? "").replace(/,/g, "").match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
};
const RESEND_SECONDS = 30;

export const FlatmateLogin: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const email = params.pemail as string;
    const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const [verifying, setVerifying] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState("");
    const [timer, setTimer] = useState(RESEND_SECONDS);
    const inputRefs = useRef<Array<TextInput | null>>([]);

    const sendOTP = async () => {
        try {
            const response = await fetch(`${API_URL}/otp/send`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({email}),
            });

            const data = await response.json();

            if (response.ok && data.success) {
            
            setTimer(60); // Start 60-second countdown
            } else {
            Alert.alert("Error", data.error || data.message);
            }
        } catch (error) {
            Alert.alert("Error", "Unable to connect to server.");
            console.log(error);
        }
    };

    useEffect(() => {
    sendOTP();
    }, []);
 


    useEffect(() => {
        if (timer <= 0) return;
        const id = setInterval(() => setTimer((t) => t - 1), 1000);
        return () => clearInterval(id);
    }, [timer]);

    const otp = digits.join("");

    const handleChange = (text: string, index: number) => {
        setError("");
        // handle paste of full code
        if (text.length > 1) {
        const pasted = text.replace(/\D/g, "").slice(0, OTP_LENGTH).split("");
        const next = Array(OTP_LENGTH).fill("");
        pasted.forEach((d, i) => (next[i] = d));
        setDigits(next);
        const lastIndex = Math.min(pasted.length, OTP_LENGTH) - 1;
        inputRefs.current[lastIndex >= 0 ? lastIndex : 0]?.focus();
        return;
        }

        const clean = text.replace(/\D/g, "");
        const next = [...digits];
        next[index] = clean;
        setDigits(next);

        if (clean && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === "Backspace" && !digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const next = [...digits];
        next[index - 1] = "";
        setDigits(next);
        }
    };

    const handleVerify = async () => {
        if (otp.length !== OTP_LENGTH) {
        setError("Enter the full 6-digit code");
        return;
        }
        setError("");
        setVerifying(true);
        try {
            const res = await fetch(`${API_URL}/otp/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });
            const data = await res.json();

            if (!data.success) {
              router.push({
                pathname: "/passenger/tours/paymentFail",
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
            }
            
            else{
              try {
              
              const API_URL = process.env.EXPO_PUBLIC_API_URL;
        
              if (!API_URL) {
                throw new Error(
                  "EXPO_PUBLIC_API_URL is not configured."
                );
              }
        
              // ------------------------------------------------------
              // Prepare receipt data
              // ------------------------------------------------------
        
              const receiptData = {
                busNumber: params.busNumber,
                driverNIC: params.driverNIC,
                conductorNIC: params.conductorNIC,
                driverD: params.driverD,
                conductorD: params.conductorD,      
                isOnline: params.isOnline === "true",
                date: params.date,
                pickup: params.pickup,
                pickupLat: params.pickupLat ? Number(params.pickupLat) : null,
                pickupLng: params.pickupLng ? Number(params.pickupLng) : null,
                pickupAddress: params.pickupAddress || "",
                time: params.time,
                packageId: params.packageId,        
                description: params.description,        
                packageType: params.packageType,        
                // Package distance is text like "700km" -> save the number 700
                totalDistance: parseDistanceKm(params.totalDistance),
                tripDuration: params.tripDuration,    
                maxPassengers: Number(params.maxPassengers) || 0,     
                maxPrice: Number(params.maxPrice) || 0,      
                Pid: params.Pid,     
                Pid1: params.Pid1 || "",       
                pfirstName: params.pfirstName,       
                plastName: params.plastName,       
                pphoneNumber: params.pphoneNumber,        
                pemail: params.pemail,
              };
        
              console.log(
                "================================"
              );
        
              console.log(
                "CREATING RECEIPT"
              );
        
              console.log(
                "Receipt Data:",
                receiptData
              );
        
              console.log(
                "================================"
              );
        
              // ------------------------------------------------------
              // Validate required fields
              // ------------------------------------------------------
        
              const requiredFields = [
                "busNumber",
                "driverNIC",
                "conductorNIC",
                "driverD",
                "conductorD",
                "date",
                "pickup",
                "time",
                "packageId",
                "description",
                "packageType",
                "tripDuration",
                "Pid",
                "pfirstName",
                "plastName",
                "pphoneNumber",
                "pemail",
              ];
        
              const missingFields =
                requiredFields.filter(
                  (field) =>
                    !receiptData[
                      field as keyof typeof receiptData
                    ]
                );
        
              if (missingFields.length > 0) {
                console.log(
                  "Missing fields:",
                  missingFields
                );
        
                Alert.alert(
                  "Missing Information",
                  `Please provide:\n\n${missingFields.join(
                    "\n"
                  )}`
                );
        
                return;
              }
        
              // ------------------------------------------------------
              // SEND TO BACKEND
              // ------------------------------------------------------
        
              const response = await fetch(
                `${API_URL}/receipts`,
                {
                  method: "POST",
        
                  headers: {
                    "Content-Type": "application/json",
                  },
        
                  body: JSON.stringify(
                    receiptData
                  ),
                }
              );
        
              // ------------------------------------------------------
              // READ RESPONSE
              // ------------------------------------------------------
        
              const data = await response.json();
        
              console.log(
                "Backend response:",
                data
              );
        
              // ------------------------------------------------------
              // ERROR
              // ------------------------------------------------------
        
              if (!response.ok) {
                throw new Error(
                  data.message ||
                    "Failed to create receipt."
                );
              }
        
              // ------------------------------------------------------
              // CHECK RECEIPT
              // ------------------------------------------------------
        
              if (
                !data.receipt ||
                !data.receipt.receiptId
              ) {
                throw new Error(
                  "Receipt was created but receipt ID was not returned."
                );
              }
        
              const receiptId =
                data.receipt.receiptId;
        
              console.log(
                "Receipt created successfully:"
              );
        
              console.log(
                "Receipt ID:",
                receiptId
              );
        
              // ------------------------------------------------------
              // OPEN RECEIPT SCREEN
              // ------------------------------------------------------
        
              router.push({
                pathname: "/passenger/tours/paymentSuccessful",
                params: {
                  receiptId: receiptId,
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
            } 
            
            catch (error: any) {
              console.error(
                "Create receipt error:",
                error
              );
        
              Alert.alert(
                "Receipt Error",
                error.message ||
                  "Unable to create receipt."
              );
            } 
              

            // if (data.success) {
            //   router.push({
            //     pathname: "/passenger/tours/ConfirmPackageBooking",
            //     params: {
            //       busNumber: params.busNumber,
            //       driverNIC: params.driverNIC,
            //       conductorNIC: params.conductorNIC,
            //       driverD: params.driverD,
            //       conductorD: params.conductorD,
            //       isOnline: params.isOnline,
            //       date: params.date,
            //       pickup: params.pickup,
            //       time: params.time,
            //       packageId: params.packageId,
            //       description: params.description,
            //       packageType: params.packageType,
            //       totalDistance: params.totalDistance,
            //       tripDuration: params.tripDuration,
            //       maxPassengers: params.maxPassengers,
            //       maxPrice: params.maxPrice,
            //       Pid: params.Pid,
            //       Pid1: params.Pid1,
            //       pfirstName: params.pfirstName,
            //       plastName:params.plastName,
            //       pphoneNumber: params.pphoneNumber,
            //       pemail: params.pemail,
            //     },
            //   });
            // }

            // else {
            //   router.push({
            //     pathname: "/passenger/tours/paymentFail",
            //     params: {
            //       busNumber: params.busNumber,
            //       driverNIC: params.driverNIC,
            //       conductorNIC: params.conductorNIC,
            //       driverD: params.driverD,
            //       conductorD: params.conductorD,
            //       isOnline: params.isOnline,
            //       date: params.date,
            //       pickup: params.pickup,
            //       time: params.time,
            //       packageId: params.packageId,
            //       description: params.description,
            //       packageType: params.packageType,
            //       totalDistance: params.totalDistance,
            //       tripDuration: params.tripDuration,
            //       maxPassengers: params.maxPassengers,
            //       maxPrice: params.maxPrice,
            //       Pid: params.Pid,
            //       Pid1: params.Pid1,
            //       pfirstName: params.pfirstName,
            //       plastName:params.plastName,
            //       pphoneNumber: params.pphoneNumber,
            //       pemail: params.pemail,
            //     },    
            //   });
            // }

        } 
      }
        catch (err) {
        setError("Something went wrong. Check your connection.");
        } 
        finally {
        setVerifying(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0 || resending) return;
        setResending(true);
        setError("");
        try {
        await fetch(`${API_URL}/otp/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        setTimer(RESEND_SECONDS);
        setDigits(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
        Alert.alert("Code sent", `A new code was sent to ${email}`);
        } catch (err) {
        setError("Couldn't resend the code. Try again.");
        } finally {
        setResending(false);
        }
    };


  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#7db300" />
      <SafeAreaView style={styles.container}>
        <ScreenHeader center eyebrow="Verify it's you" title="JetLink" />

        <View style={styles.otpcard}>
                    
            <View style={styles.otpHead}>
              <IconBox bg={C.greenSoft} size={64} radius={32}>
                <Ionicons name="shield-checkmark-outline" size={30} color={C.green} />
              </IconBox>
              <Text style={styles.otplabel}>Enter verification code</Text>
              <Text style={styles.otpHint}>Type the 6-digit code we sent you.</Text>
            </View>

            <View style={styles.otpRow}>
                {digits.map((digit, index) => (
                <TextInput
                    key={index}
                    ref={(ref: TextInput | null) => {inputRefs.current[index] = ref;}}
                    style={[
                    styles.otpBox,
                    digit ? styles.otpBoxFilled : null,
                    error ? styles.otpBoxError : null,
                    ]}
                    keyboardType="number-pad"
                    maxLength={OTP_LENGTH} // allows paste-detection on first box
                    value={digit}
                    onChangeText={(text) => handleChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    selectTextOnFocus
                />
                ))}
            </View>

            {error ? (
                <View style={styles.errorRow}>
                <Ionicons name="alert-circle" size={16} color="#E4453A" />
                <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}

            <TouchableOpacity
                style={[styles.verifyButton, otp.length !== OTP_LENGTH && styles.verifyButtonDisabled]}
                onPress={handleVerify }
                disabled={verifying || otp.length !== OTP_LENGTH}
                activeOpacity={0.85}
            >
              <LinearGradient
                colors={GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
                {verifying ? (
                <ActivityIndicator color="#FFFFFF" />
                ) : (
                <Text style={styles.verifyButtonText}>Next</Text>
                )}
            </TouchableOpacity>

            <View style={styles.resendRow}>
                <Text style={styles.resendText}>Didn&apos;t get the code? </Text>
                <TouchableOpacity onPress={handleResend} disabled={timer > 0 || resending}>
                <Text style={[styles.resendLink, timer > 0 && styles.resendLinkDisabled]}>
                    {resending ? "Sending..." : timer > 0 ? `Resend in ${timer}s` : "Resend"}
                </Text>
                </TouchableOpacity>
            </View>
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
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
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

  otpcard: {
    marginTop: -64,
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 24,
    shadowColor: "#0F1B2D",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },

  otplabel: {
    fontSize: 22,
    fontWeight: "800",
    color: C.ink,
    marginTop: 14,
    textAlign: "center",
  },
  otpHead: { alignItems: "center", marginBottom: 20 },
  otpHint: { fontSize: 14, color: C.muted, marginTop: 6, textAlign: "center" },

  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
    marginBottom: 8,
  },

  otpBox: {
    flex: 1,
    maxWidth: 48,
    height: 56,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#DCE3EC",
    backgroundColor: "#FFFFFF",
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    color: C.ink,
  },

  otpBoxFilled: {
    borderColor: "#BFD3EA",
    backgroundColor: "#F2F7FD",
  },

  otpBoxError: {
    borderColor: "#E4453A",
    backgroundColor: "#FDEEEE",
  },

  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    gap: 6,
  },

  errorText: {
    color: "#E4453A",
    fontSize: 13,
    fontWeight: "500",
  },

  verifyButton: {
    marginTop: 24,
    height: 54,
    borderRadius: 27,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#155B8A",
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  verifyButtonDisabled: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },

  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },

  resendText: { color: C.muted, fontSize: 14 },

  resendLink: { color: C.blue, fontSize: 14, fontWeight: "700" },

  resendLinkDisabled: { color: "#8A97A8" },
  
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

export default FlatmateLogin;