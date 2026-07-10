import React, { useRef, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function VerifyOTP() {
  const router = useRouter();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const handleChange = (text: string, index: number) => {
    if (!/^[0-9]?$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleBackspace = (key: string, index: number) => {
    if (key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const verifyOTP = () => {
    const code = otp.join("");
    console.log(code);

    if (code.length === 6) {
      alert("OTP Verified");
    } else {
      alert("Enter OTP");
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color="#000" />
        <Text style={styles.backText}>BACK</Text>
      </TouchableOpacity>

      <View style={styles.iconContainer}>
        <Ionicons name="mail-open-outline" size={60} color="#fff"/>
      </View>

      <Text style={styles.title}>Verification Code</Text>

      <Text style={styles.subtitle}>
        Please enter verification code{"\n"}
        sent to your mobile
      </Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={inputRefs[index]}
            value={digit}
            style={styles.otpBox}
            keyboardType="number-pad"
            maxLength={1}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={({ nativeEvent }) =>
            handleBackspace(nativeEvent.key, index)
            }
          />
        ))}
      </View>

      <TouchableOpacity>
        <Text style={styles.resend}>RESEND OTP</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={verifyOTP}
      >
        <Text style={styles.buttonText}>VERIFY</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    
  },

  backRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 50,
  },

  backText: {
    fontSize: 18,
    marginLeft: 5,
  },

  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#3548C7",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 35,
  },

  title: {
    fontSize: 34,
    fontWeight: "700",
    textAlign: "center",
    color: "#222",
  },

  subtitle: {
    marginTop: 10,
    textAlign: "center",
    color: "#999",
    fontSize: 17,
    lineHeight: 26,
  },

  otpContainer: {
    width: '100%',
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 50,
    marginBottom: 40,
    paddingHorizontal: 25,
    paddingTop: 40,
  },

  otpBox: {
    width: 45,
    height: 55,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    textAlign: "center",
    fontSize: 28,
    fontWeight: "700",
    elevation: 3,
  },

  resend: {
    alignSelf: "flex-end",
    color: "#3548C7",
    fontWeight: "700",
    marginBottom: 45,
  },

  button: {
    backgroundColor: "#3548C7",
    height: 58,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});