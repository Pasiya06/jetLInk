import React, { useEffect, useRef, useState } from 'react';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, StatusBar, BackHandler    } from 'react-native';
import { Alert } from "../../components/JetAlert";
import { LinearGradient } from 'expo-linear-gradient';
import { Feather as Icon, EvilIcons, Fontisto, Ionicons } from '@expo/vector-icons';
import axios from "axios";

import FieldError from "../../components/FieldError";
import { useFieldErrors } from "../../utils/validation";
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const FlatmateLogin: React.FC = () => {
  const router = useRouter();
  const { validate: validateFields, errorFor: fieldError } = useFieldErrors();
  const params = useLocalSearchParams();
  const email = Array.isArray(params.email) ? params.email[0] : params.email;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!password || !confirmPassword) {
      setError("Please fill in both fields");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    setError("");
    return true;
  };

  const handleUpdate = async () => {
    if (!validateFields([
      { key: "password", label: "New password", value: password, type: "password" },
      { key: "confirmPassword", label: "Confirm password", value: confirmPassword, equals: { value: password, message: "Passwords do not match" } },
    ])) return;

    if (!validate()) return;
    if (!email) {
      setError("Missing email — please try again");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.put(
        `${API_URL}/passengers/password/${encodeURIComponent(email)}`,
        { password }
      );

      if (res.data.success) {
        Alert.alert("Success", "Your password has been updated.", [
          { text: "OK", onPress: () => router.push({pathname: "/passenger/index2",params:{ email:params.email,}}) },
        ]);
      } else {
        setError(res.data.message || "Something went wrong");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Server error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#7db300" />
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
        <Text style={styles.cardTitle}>New Password</Text>

        {/* Password Input */}
        <View style={styles.inputRow}>
            <View style={[styles.iconWrap, { backgroundColor: "#FF9F1C1A" }]}>
            <EvilIcons name="lock" size={28} color="#FF9F1C"/>
            </View>
            <TextInput
            style={styles.input}
            placeholder="New password"
            placeholderTextColor="#A0A4AE"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword((s) => !s)}>
            <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#A0A4AE"
            />
            </TouchableOpacity>
        </View>
        <FieldError message={fieldError("password", password)} />

        <Text style={styles.cardTitle}>Confirm Password</Text>

        {/* Confirm Password Input */}
        <View style={styles.inputRow}>
            <View style={[styles.iconWrap, { backgroundColor: "#EEF9F0" }]}>
            <Ionicons
                name="checkmark-done-outline"
                size={18}
                color="#37B24D"
            />
            </View>
            <TextInput
            style={styles.input}
            placeholder="Confirm password"
            placeholderTextColor="#A0A4AE"
            secureTextEntry={!showConfirm}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirm((s) => !s)}>
            <Ionicons
                name={showConfirm ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#A0A4AE"
            />
            </TouchableOpacity>
        </View>
        <FieldError message={fieldError("confirmPassword", confirmPassword)} />

        {/* Error Pill */}
        {error ? (
            <View style={styles.errorPill}>
            <Ionicons name="alert-circle" size={16} color="#E03131" />
            <Text style={styles.errorText}>{error}</Text>
            </View>
        ) : null}

        <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleUpdate}
        disabled={loading}
        style={{ marginTop: 24 }}
        >
        <LinearGradient
            colors={["#173C79","#155B8A","#159B79",]}
          start={{x: 0, y: 0,}}
          end={{x: 1, y: 1,}}
            style={styles.submitButton}
        >
            {loading ? (
            <ActivityIndicator color="#fff" />
            ) : (
            <>
                <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color="#fff"
                style={{ marginRight: 8 }}
                />
                <Text style={styles.submitText}>Update Password</Text>
            </>
            )}
        </LinearGradient>
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

  content: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginTop: -50,
    marginLeft:20,
    marginRight:20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1D29",
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FB",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEF0F4",
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1A1D29",
    paddingVertical: 10,
  },
  errorPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0F0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 4,
  },
  errorText: {
    color: "#E03131",
    fontSize: 12,
    marginLeft: 6,
    fontWeight: "500",
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  hintText: {
    fontSize: 12,
    color: "#A0A4AE",
    marginLeft: 4,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#4C6EF5",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 4,
  },
  submitText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
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

export default FlatmateLogin;