import React, { useEffect, useRef, useState } from 'react';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, StatusBar, Alert, BackHandler    } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather as Icon, AntDesign, Fontisto, Ionicons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export const FlatmateLogin: React.FC = () => {
  const router = useRouter();
  const [showLogin, setShowOtp] = useState(false);
  const params = useLocalSearchParams();
  const [email, setEmail] = useState(String(params.email || ""));
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  

  useEffect(() => {
    const backAction = () => {
      router.replace("/passenger/index2"); // Navigate to a specific path
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
 

const verify = async () => {
  try {
    setShowOtp(true);
    sendOTP();
  } 
  
  catch (error) {
    console.log(error);
    alert("Server connection failed");
  }

};

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
        setError("Invalid or expired code. Try again.");
        setDigits(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
        return;
      }

      router.push({
        pathname: "/passenger/resetPassword",
        params: {
          email:email,
          
        },
      });

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
      <StatusBar barStyle="light-content" backgroundColor="#7db300" />
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#4B6CF5', '#32CD32']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.submitGradient1}
        >
          <View style={styles.header}>
          
            <TouchableOpacity >
              <Text style={styles.title}>JetLink</Text>
            </TouchableOpacity>
                  
          </View>
        </LinearGradient>
        
        
                
              
                {!showLogin ? (


              <>
              <View style={styles.card}>
                <Text style={styles.inputLabel}>Email Address</Text>
                    <View style={styles.inputWrapper}>
                    <View style={[styles.iconWrap, { backgroundColor: "#4B6CF51A"  }]}>
                        <Fontisto name="email" size={18} color="#4B6CF5" />
                    </View>
                    <View style={styles.inputInnerWrapper}>
                        <TextInput
                        style={styles.textInput}
                        value={email}
                        placeholder="ABC@gmail.com"
                        placeholderTextColor="#A3A3A3"
                        keyboardType="email-address"
                        onChangeText={(text) => setEmail(text.replace(/\s/g, "").toLowerCase())} 
                        autoCapitalize="none"
                        autoCorrect={false}
                        />
                    </View>
                    </View>
                  
            
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={showLogin ? handleVerify : verify}
                  >
                    <LinearGradient
                        colors={['#4B6CF5', '#32CD32']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.submitGradient}
                    >
                    <Text style={styles.primaryButtonText}>
                     Get OTP
                    </Text>
                    </LinearGradient>
                  </TouchableOpacity>
           
                                
              </View>
            
                  

                </>
                ) : (
                <>
                <View style={styles.card}>
                <Text style={styles.inputLabel}>Email Address</Text>
                    <View style={styles.inputWrapper}>
                    <View style={[styles.iconWrap, { backgroundColor: "#4B6CF51A"  }]}>
                        <Fontisto name="email" size={18} color="#4B6CF5" />
                    </View>
                    <View style={styles.inputInnerWrapper}>
                        <TextInput
                        style={styles.textInput}
                        value={email}
                        placeholder="ABC@gmail.com"
                        placeholderTextColor="#A3A3A3"
                        keyboardType="email-address"
                        onChangeText={(text) => setEmail(text.replace(/\s/g, "").toLowerCase())} 
                        autoCapitalize="none"
                        autoCorrect={false}
                        />
                    </View>
                    </View>
                  
            
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={showLogin ? handleVerify : verify}
                  >
                    <LinearGradient
                        colors={['#4B6CF5', '#32CD32']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.submitGradient}
                    >
                    <Text style={styles.primaryButtonText}>
                     Get OTP
                    </Text>
                    </LinearGradient>
                  </TouchableOpacity>
           
                                
              </View>

                  <View style={styles.otpcard}>
                    
                    <Text style={styles.otplabel}>Enter verification code</Text>

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
                      onPress={showLogin ? handleVerify : verify}
                      disabled={verifying || otp.length !== OTP_LENGTH}
                      activeOpacity={0.85}
                    >
                      {verifying ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.verifyButtonText}>Login</Text>
                      )}
                    </TouchableOpacity>

                    <View style={styles.resendRow}>
                      <Text style={styles.resendText}>Didn't get the code? </Text>
                      <TouchableOpacity onPress={handleResend} disabled={timer > 0 || resending}>
                        <Text style={[styles.resendLink, timer > 0 && styles.resendLinkDisabled]}>
                          {resending ? "Sending..." : timer > 0 ? `Resend in ${timer}s` : "Resend"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
                )}
              
              

         

  

        <View style={styles.footerGraphic}>
          <LinearGradient
            colors={['#4B6CF5', '#32CD32']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
          </LinearGradient>
        </View>
        <View style={styles.footerGraphic1}>
          <LinearGradient
            colors={['#4B6CF5', '#32CD32']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
          </LinearGradient>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',  
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
    height: '30%',
    backgroundColor: '#FFF',
    paddingTop: 24,
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

  inputWrapper: {
    height: '22%',
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

  

  primaryButton: {
    justifyContent: "space-around",
    marginLeft: 15,
    marginRight: 15,  
    height: 55,
    overflow: 'hidden',
    borderRadius: 25,
    marginTop: 30,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    elevation: 10,
  },

  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },

  otpcard: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  otplabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
    
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  otpBox: {
    width: 46,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E2E6F0",
    backgroundColor: "#F8F9FC",
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
  },
  otpBoxFilled: {
    borderColor: "#4C6FFF",
    backgroundColor: "#EEF1FF",
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
    backgroundColor: "#32CD32",
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#32CD32",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  verifyButtonDisabled: {
    backgroundColor: "#32CD321A",
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  resendText: {
    color: "#6B7280",
    fontSize: 13,
  },
  resendLink: {
    color: "#3454E8",
    fontSize: 13,
    fontWeight: "700",
  },
  resendLinkDisabled: {
    color: "#A5AEC7",
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
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25, 
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