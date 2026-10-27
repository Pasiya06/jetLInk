// PaymentSuccessScreen.tsx
import React, { useEffect, useRef } from 'react';
import  { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack,useRouter, useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';

const { width } = Dimensions.get('window');

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const amount = params.maxPrice as string;
  const bNumber = params.bNumber as string;
  const [qrToken, setQrToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  // The receipt that was just created (sent from otpVerify)
  const receiptId = String(params.receiptId ?? "").trim();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const fetchParcelQR = async () => {
      if (!receiptId) {
        setError("Receipt ID missing. Open the booking from My Receipts to see the QR.");
        return;
      }

      try {
        setError(null);
        const url = `${API_URL}/receipts/receiptId/${encodeURIComponent(receiptId)}/qr`;
        console.log("Request URL:", url);
        const response = await fetch(url);
        console.log("Status:", response.status);
        const data = await response.json();
        console.log("Backend Data:", data);
  
        if (!response.ok) {
          throw new Error(data.error);
        }
        setQrToken(data.qrToken);
  
      } 
      catch (error: any) {
  
        console.log("QR Error:", error);
        setError(error.message || "Could not generate QR");
      }
    };
  
    useEffect(() => {
      fetchParcelQR();
    }, [receiptId]);

//   const loadQr = async () => {
//   try {
//     setError(null);

//     const res = await fetch(`${API_URL}/tickets/generate-qr`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
        
//         pemail:params.pemail,
        
//       }),
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       throw new Error(data.error);
//     }

//     setQrToken(data.qrToken);
//   } catch (error) {
//     console.log(error);
//     setError("Could not generate QR");
//   }
// };

//   useEffect(() => {
          
//     loadQr();

//   }, []);

  const handleTour = async () => {
    router.push({
      pathname: "/passenger/tours/index1",
      params: {
        
        Pid: params.Pid,
        Pid1: params.Pid1,
        pfirstName: params.pfirstName,
        plastName:params.plastName,
        pphoneNumber: params.pphoneNumber,
        pemail: params.pemail,
        
      },
    })
  };

  const handleSearch = async () => {
    router.push({
      pathname: "/passenger/index1",
      params: {
        
        Pid: params.Pid,
        Pid1: params.Pid1,
        pfirstName: params.pfirstName,
        plastName:params.plastName,
        pphoneNumber: params.pphoneNumber,
        pemail: params.pemail,
        
      },
    })
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
      <LinearGradient
        colors={['#173C79', '#155B8A', '#159B79']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Success Icon */}
        <Animated.View
          style={[
            styles.iconWrapper,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.iconCircleOuter}>
            <View style={styles.iconCircleInner}>
              <Ionicons name="checkmark" size={60} color="#159B79" />
            </View>
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, width: '100%', alignItems: 'center' }}>
          <Text style={styles.title}>Payment Successful</Text>
          <Text style={styles.subtitle}>
            Your ticket has been issued successfully
          </Text>

          {/* Amount */}
          <Text style={styles.amount}>LKR {amount}</Text>

          {/* QR code */}
          <View style={styles.card}>
              <View style={styles.svw}> 
              {error && (
                  <Text style={styles.errorText}>{error}</Text>
              )}
              
              
              {qrToken && (
                <View style={styles.qrWrapper}>
                <QRCode value={String(qrToken)} size={200} />
                </View>
            )}
            {qrToken ? (
                <View style={styles.qrCaption}>
                  <Ionicons name="scan-outline" size={16} color="#5B6B7F" />
                  <Text style={styles.qrCaptionText}>Show this code to the driver when you board</Text>
                </View>
            ) : null}
              
            </View>     
            
          </View>

          {/* Actions */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleTour}
            activeOpacity={0.85}
          >
            
            <Text style={styles.primaryButtonText}>Book Another</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleSearch}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </>
  );
}



const styles = StyleSheet.create({
  qrCaptionText: { fontSize: 13, fontWeight: '600', color: '#5B6B7F' },
  qrCaption: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  svw: { width: '100%', paddingVertical: 24, paddingHorizontal: 20, alignItems: 'center' },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconWrapper: {
    marginBottom: 24,
  },
  iconCircleOuter: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleInner: { width: 94, height: 94, borderRadius: 47, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 6 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.88)', marginBottom: 18, textAlign: 'center', lineHeight: 20 },
  amount: { fontSize: 34, fontWeight: '800', color: '#FFFFFF', marginBottom: 20 },
  card: {
    width: width - 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: '#0F1B2D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 8,
  },


  qrWrapper: { padding: 12, borderRadius: 16, borderWidth: 1.5, borderColor: '#E3E9F1' },

  errorText: {
    fontSize: 14,
    color: '#c0392b',
    textAlign: 'center',
    marginBottom: 16,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    marginLeft: 8,
    fontSize: 13,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3C72',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    height: 54,
    paddingHorizontal: 32,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    width: width - 48,
    marginBottom: 12,
    shadowColor: '#0F1B2D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
  },
  primaryButtonText: { fontSize: 16, fontWeight: '800', color: '#173C79' },
  secondaryButton: { paddingVertical: 12, paddingHorizontal: 20 },
  secondaryButtonText: { fontSize: 15, color: '#FFFFFF', fontWeight: '700' },
});