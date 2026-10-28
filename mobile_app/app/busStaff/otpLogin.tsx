import React, { useEffect, useRef, useState } from 'react';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, StatusBar, BackHandler    } from 'react-native';
import { Alert } from "../../components/JetAlert";
import { LinearGradient } from 'expo-linear-gradient';
import { Feather as Icon, AntDesign, Fontisto, Ionicons } from '@expo/vector-icons';
import { ScreenHeader, IconBox, GRADIENT, C } from "../../components/JetUI";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export const FlatmateLogin: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = (Array.isArray(params.cemail) ? params.cemail[0] : params.cemail) ?? "";
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  

  useEffect(() => {
    const backAction = () => {
      router.replace("/busStaff/loginindex"); // Navigate to a specific path
      return true; // Prevent default back behavior
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => subscription.remove();
  }, []);

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

    const id = setInterval(() => {
        setTimer((prev) => prev - 1);
    }, 1000);

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
        setError("Invalid or expired code. Try again.");
        setDigits(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
        return;
      }

      router.push({
        pathname: "/busStaff/index1",
        params: {
          conductorNIC:params.conductorNIC,
          cfirstName:params.cfirstName,
          clastName:params.clastName,
          cphoneNumber:params.cphoneNumber,
          cemail:params.cemail,
          driverId:params.driverId,
          dfirstName:params.dfirstName,
          dlastName:params.dlastName,
          dphoneNumber:params.dphoneNumber,
          busNo:params.busNo,
        },
      });

      //router.replace("/index6"); // swap for your post-verification route
    } catch (err) {
      setError("Something went wrong. Check your connection.");
    } finally {
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
      <StatusBar barStyle="light-content" backgroundColor="#173C79" />
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.replace("/busStaff/loginindex")}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.heroBadge}>
            <Ionicons name="lock-closed" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.brand}>JetLink</Text>
          <Text style={styles.heroTitle}>Bus crew sign in</Text>
          <Text style={styles.heroSub}>One last step to start the trip</Text>
        </LinearGradient>
        
        
                
              
               

                  <View style={styles.otpcard}>
                    <View style={styles.stepRow}>
                      <View style={[styles.step, styles.stepActive]}>
                        <Ionicons name="checkmark" size={15} color="#FFFFFF" />
                      </View>
                      <Text style={styles.stepLabelActive}>Crew details</Text>
                      <View style={[styles.stepLine, { backgroundColor: C.blue }]} />
                      <View style={[styles.step, styles.stepActive]}>
                        <Text style={styles.stepNumActive}>2</Text>
                      </View>
                      <Text style={styles.stepLabelActive}>Code</Text>
                    </View>
                    <View style={styles.otpHead}>
                      <IconBox bg={C.greenSoft} size={64} radius={32}>
                        <Ionicons name="shield-checkmark-outline" size={30} color={C.green} />
                      </IconBox>
                      <Text style={styles.otplabel}>Enter verification code</Text>
                      <Text style={styles.otpHint}>{email ? `Type the 6-digit code we sent to ${email}` : "Type the 6-digit code we sent to the conductor."}</Text>
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

                    {!error && otp.length > 0 && otp.length < OTP_LENGTH ? (
                      <Text style={styles.otpHint}>
                        {OTP_LENGTH - otp.length} more digit{OTP_LENGTH - otp.length === 1 ? "" : "s"} to go
                      </Text>
                    ) : null}

                    {error ? (
                      <View style={styles.errorRow}>
                        <Ionicons name="alert-circle" size={16} color="#E4453A" />
                        <Text style={styles.errorText}>{error}</Text>
                      </View>
                    ) : null}

                    <TouchableOpacity
                      style={[styles.verifyButton, otp.length !== OTP_LENGTH && styles.verifyButtonDisabled]}
                      onPress={handleVerify}
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
                        <Text style={styles.verifyButtonText}>Login</Text>
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
  hero: { paddingTop: 48, paddingBottom: 92, paddingHorizontal: 24, alignItems: "center", borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  backBtn: { position: "absolute", top: 44, left: 18, width: 42, height: 42, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  heroBadge: { width: 72, height: 72, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.18)", borderWidth: 1, borderColor: "rgba(255,255,255,0.35)", alignItems: "center", justifyContent: "center", marginTop: 8 },
  brand: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "800", letterSpacing: 2, marginTop: 14, textTransform: "uppercase" },
  heroTitle: { color: "#FFFFFF", fontSize: 26, fontWeight: "800", marginTop: 4 },
  heroSub: { color: "rgba(255,255,255,0.85)", fontSize: 14, marginTop: 6, textAlign: "center" },
  stepRow: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  step: { width: 26, height: 26, borderRadius: 13, backgroundColor: "#EEF2F7", alignItems: "center", justifyContent: "center" },
  stepActive: { backgroundColor: C.blue },
  stepNumActive: { fontSize: 13, fontWeight: "800", color: "#FFFFFF" },
  stepLabelActive: { fontSize: 13, fontWeight: "800", color: C.ink, marginLeft: 8 },
  stepLine: { flex: 1, height: 2, backgroundColor: "#E3E9F1", marginHorizontal: 10, borderRadius: 1 },
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
    width: '90%',
    height: '50%',
    backgroundColor: '#FFF',
    //padding: 24,
    //alignItems: 'center',

    marginTop: -50,   
    alignSelf: 'center',

    borderRadius: 20,
    elevation: 10,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  card1: {
    width: '90%',
    height: '25%',
    backgroundColor: '#FFF',
    //padding: 24,
    //alignItems: 'center',

    marginTop: -50,   
    alignSelf: 'center',

    borderRadius: 20,
    elevation: 10,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  
  eyeIcon: {
    padding: 4,
  },
 
  
  
  

  formContainer: {
    
    marginTop: 34,
    //marginBottom:70,
    //width: '90%',  
  },


  inputWrapper1: {
    height: '13%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F4F5',
    marginRight: 15,
    marginLeft: 15,
    marginBottom: 25,
    borderLeftWidth: 1,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  inputWrapper: {
    height: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F4F5',
    marginRight: 15,
    marginLeft: 15,
    
    borderLeftWidth: 1,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  input3dIcon: {
    marginRight: 12,
    width:25,
    height:25
  },

  inputInnerWrapper: {
    flex: 1,
  },

  inputLabel: {
    marginRight: 15,
    marginLeft: 15,
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
    marginBottom: 10,
  },

  textInput: {
    
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
    padding: 0, 
    marginTop: 2,
  },

  footerContainer: {
    
    marginTop: 'auto', 
    paddingBottom: 10,
    //marginBottom: 10,
    marginRight: 15,
    marginLeft: 15,
  },

  primaryButton: {
    //marginBottom: 60,
    width: '100%',
    
    backgroundColor: '#32CD32',
    padding: 14,
    alignItems: 'center',   
    alignSelf: 'center',
    marginBottom: 2,
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  primaryButton1: {
    
    width: '100%',
    marginBottom: 10,
    backgroundColor: '#32CD32',
    padding: 14,
    alignItems: 'center',   
    alignSelf: 'center',
    //marginTop: 10,
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },

  otpcard: {
    marginTop: -64,
    marginHorizontal: 18,
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