import React, { useEffect, useRef } from 'react';
import  { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { GradientButton } from "../../components/JetUI";
import { Alert } from "../../components/JetAlert";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack,useRouter, useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';

const { width } = Dimensions.get('window');

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const amount = params.totalFare as string;
  const status : string = "PickedUp";
  const pickupVerified : boolean = true;
  const [qrToken, setQrToken] = useState("");
  const [error, setError] = useState<string | null>(null);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const createParcel = async (parcelData: any) => {
    try {
        const response = await fetch(`${API_URL}/parcel`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(parcelData),
        });

        const data = await response.json();

        return data;
    } catch (error) {
        console.log(error);
        return {
        success: false,
        message: "Server connection failed",
        };
    }
    };


  const loadQr = async () =>{
    const response = await fetch(`${API_URL}/parcel/generateQR`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            sendername: params.sendername,
            receivername: params.receivername,
            pickup: params.pickup,
            drop: params.drop,
            weight: params.weight,
            totalFare: params.totalFare,
        }),
        });

    const data = await response.json();

        if (data.success) {
            setQrToken(data.qrToken);
        console.log(data.qrToken);
        }
  }

  useEffect(() => {
          
    loadQr();

  }, []);

  const handleSaveParcel = async () => {
      const parcelData = {
        sendername:params.sendername,
        Smobilenumber:params.smobilenumber,
        Semail:params.semail,
        receivername:params.receivername,
        Rmobilenumber:params.rmobilenumber,
        Remail:params.remail,
        weight:params.weight,
        pickup:params.pickup,
        drop:params.drop,
        date:params.date,
        time:params.time,
        Bnumber:params.busNo,
        totalFare:params.totalFare,
        status:status,
        pickupVerified:pickupVerified,
      };
  
      const result = await createParcel(parcelData);
  
      if (result.success) {
        router.push({
              pathname: "/busStaff/busBookedParcel",
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
            })
        
  
  
      } else {
        Alert.alert("Error", result.message);
      }
    };

    const handleSearch = async () => {
        const parcelData = {
        sendername:params.sendername,
        Smobilenumber:params.smobilenumber,
        Semail:params.semail,
        receivername:params.receivername,
        Rmobilenumber:params.rmobilenumber,
        Remail:params.remail,
        weight:params.weight,
        pickup:params.pickup,
        drop:params.drop,
        date:params.date,
        time:params.time,
        Bnumber:params.busNo,
        totalFare:params.totalFare,
        status:status,
        pickupVerified:pickupVerified,
      };
  
      const result = await createParcel(parcelData);
  
      if (result.success) {
        router.push({
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
            })
        
  
  
      } else {
        Alert.alert("Error", result.message);
      }
    };
  

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <LinearGradient colors={["#0B6B53", "#159B79", "#3DDC84"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
            <Animated.View style={[styles.iconWrapper, { transform: [{ scale: scaleAnim }] }]}>
              <View style={styles.iconCircleOuter}>
                <View style={styles.iconCircleInner}>
                  <Ionicons name="checkmark" size={56} color="#159B79" />
                </View>
              </View>
            </Animated.View>
            <Text style={styles.title}>Payment successful</Text>
            <Text style={styles.subtitle}>The parcel is booked. Give the sender this QR code.</Text>
          </LinearGradient>

          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.card}>
              <Text style={styles.amountLabel}>Amount paid</Text>
              <Text style={styles.amount}>Rs. {amount}</Text>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              {qrToken ? (
                <>
                  <View style={styles.qrWrapper}>
                    <QRCode value={String(qrToken)} size={200} />
                  </View>
                  <Text style={styles.qrHint}>The receiver shows this code when collecting the parcel</Text>
                </>
              ) : null}
            </View>

            <View style={styles.actions}>
              <GradientButton label="Book another parcel" icon="add-circle-outline" onPress={handleSaveParcel} />
              <TouchableOpacity style={styles.secondaryButton} onPress={handleSearch} activeOpacity={0.85}>
                <Ionicons name="home-outline" size={19} color="#155B8A" />
                <Text style={styles.secondaryButtonText}>Back to home</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </>
  );
}



const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7FB" },
  scroll: { paddingBottom: 40 },
  hero: { paddingTop: 70, paddingBottom: 110, alignItems: "center", borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  iconWrapper: { alignItems: "center", justifyContent: "center" },
  iconCircleOuter: { width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  iconCircleInner: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" },
  title: { color: "#FFFFFF", fontSize: 26, fontWeight: "800", marginTop: 18 },
  subtitle: { color: "rgba(255,255,255,0.9)", fontSize: 14, marginTop: 6, textAlign: "center", paddingHorizontal: 32 },
  card: { marginTop: -76, marginHorizontal: 18, backgroundColor: "#FFFFFF", borderRadius: 24, padding: 20, alignItems: "center", elevation: 5, shadowColor: "#0F1B2D", shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
  amountLabel: { fontSize: 12.5, fontWeight: "700", color: "#5B6B7F", letterSpacing: 0.5, textTransform: "uppercase" },
  amount: { fontSize: 30, fontWeight: "800", color: "#0F1B2D", marginTop: 4 },
  qrWrapper: { marginTop: 18, padding: 14, borderRadius: 20, borderWidth: 2, borderStyle: "dashed", borderColor: "#E3E9F1" },
  qrHint: { fontSize: 12.5, color: "#5B6B7F", marginTop: 10, textAlign: "center" },
  errorText: { color: "#C62828", fontWeight: "600", marginTop: 12, textAlign: "center" },
  reasonRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FDE2E2", borderRadius: 14, padding: 14, alignSelf: "stretch" },
  reasonText: { flex: 1, color: "#9F1D1D", fontSize: 13.5, fontWeight: "600" },
  actions: { marginHorizontal: 18, marginTop: 18, gap: 12 },
  secondaryButton: { height: 54, borderRadius: 16, borderWidth: 1.5, borderColor: "#155B8A", backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  secondaryButtonText: { color: "#155B8A", fontSize: 16, fontWeight: "800" },
});
