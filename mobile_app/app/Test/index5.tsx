// import React, { useState } from "react";
// import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";

// const API_URL = process.env.EXPO_PUBLIC_API_URL; // adjust for your backend

// export default function OtpTestScreen() {
//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState("");
//   const [status, setStatus] = useState("");

//   const sendOtp = async () => {
//     setStatus("Sending OTP...");
//     try {
//       const res = await fetch(`${API_URL}/otp/send`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email }),
//       });
//       const data = await res.json();
//       setStatus(`Send response (${res.status}): ${JSON.stringify(data)}`);
//     } catch (err: any) {
//       setStatus(`Send failed: ${err.message}`);
//     }
//   };

//   const verifyOtp = async () => {
//     setStatus("Verifying OTP...");
//     try {
//       const res = await fetch(`${API_URL}/otp/verify`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, otp }),
//       });
//       const data = await res.json();
//       setStatus(`Verify response (${res.status}): ${JSON.stringify(data)}`);
//       if (res.ok) Alert.alert("Success", "OTP verified!");
//     } catch (err: any) {
//       setStatus(`Verify failed: ${err.message}`);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.label}>Email</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Enter email"
//         keyboardType="email-address"
//         autoCapitalize="none"
//         value={email}
//         onChangeText={setEmail}
//       />
//       <Button title="Send OTP" onPress={sendOtp} />

//       <Text style={[styles.label, { marginTop: 20 }]}>OTP</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Enter OTP"
//         keyboardType="number-pad"
//         maxLength={6}
//         value={otp}
//         onChangeText={setOtp}
//       />
//       <Button title="Verify OTP" onPress={verifyOtp} />

//       <Text style={styles.status}>{status}</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, justifyContent: "center" },
//   label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 10,
//   },
//   status: { marginTop: 20, fontSize: 13, color: "#333" },
// });


import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL; // swap for your API_URL constant
const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function OtpVerification() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = (Array.isArray(params.email) ? params.email[0] : params.email) ?? "";

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(RESEND_SECONDS);

  const inputRefs = useRef<Array<TextInput | null>>([]);

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

      if (!res.ok || data?.status === "failed") {
        setError(data?.message || "Invalid or expired code. Try again.");
        setDigits(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
        return;
      }

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
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F4F6FB" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Gradient header */}
      {/* <LinearGradient
        colors={["#4C6FFF", "#3454E8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerIconWrap}>
          <Ionicons name="mail-open-outline" size={30} color="#3454E8" />
        </View>

        <Text style={styles.headerTitle}>Verify your email</Text>
        <Text style={styles.headerSubtitle}>
          We sent a 6-digit code to{"\n"}
          <Text style={styles.headerEmail}>{email || "your email"}</Text>
        </Text>
      </LinearGradient> */}

      {/* Elevated card */}
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
          onPress={handleVerify}
          disabled={verifying || otp.length !== OTP_LENGTH}
          activeOpacity={0.85}
        >
          {verifying ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify Code</Text>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 56,
    left: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    lineHeight: 20,
  },
  headerEmail: {
    fontWeight: "600",
    color: "#FFFFFF",
  },
  otpcard: {
    marginTop: -28,
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
    textAlign: "center",
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
    backgroundColor: "#3454E8",
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3454E8",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  verifyButtonDisabled: {
    backgroundColor: "#B7C1F5",
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
});
