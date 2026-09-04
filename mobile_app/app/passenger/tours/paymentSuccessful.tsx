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
  const amount = params.totalFare as string;
  const bNumber = params.bNumber as string;
  const [qrToken, setQrToken] = useState("");
  const [error, setError] = useState<string | null>(null);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadQr = async () => {
  try {
    setError(null);

    const res = await fetch(`${API_URL}/tickets/generate-qr`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        
        pemail:params.pemail,
        
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error);
    }

    setQrToken(data.qrToken);
  } catch (error) {
    console.log(error);
    setError("Could not generate QR");
  }
};

  useEffect(() => {
          
    loadQr();

  }, []);

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
      colors={['#fff8f8', '#3DDC84']}
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
            <Ionicons name="checkmark" size={64} color="#fff" />
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
                <QRCode value={String(qrToken)} size={220} />
                </View>
            )}
            
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
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(134, 133, 133, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#3DDC84',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E3C72',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#1E3C72',
    marginBottom: 18,
    textAlign: 'center',
  },
  amount: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1E3C72',
    marginBottom: 24,
  },
  card: {
    width: width - 48,
    backgroundColor: '#fff',
    borderRadius: 18,
    
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },

   svw: {
    width: '100%',
    padding: 50,   
  },

  qrWrapper: {
    marginBottom:40,
    marginLeft:10
  },

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
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: width - 48,
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E3C72',
  },
  secondaryButton: {
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
});