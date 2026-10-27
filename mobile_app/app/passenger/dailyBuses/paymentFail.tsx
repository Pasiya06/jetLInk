// PaymentSuccessScreen.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Entypo } from '@expo/vector-icons';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const handleSearch1 = () => {
    router.push({
      pathname: "/passenger/dailyBuses/paymentGateway",
      params:{ 
        Pid: params.Pid,
        Pid1: params.Pid1,
        pfirstName: params.pfirstName,
        plastName:params.plastName,
        pphoneNumber: params.pphoneNumber,
        pemail: params.pemail,
        NIC: params.NIC,
        pickup:params.pickup,
        drop:params.drop,
        date:params.date,
        time:params.time,
        bNumber:params.bNumber,
        busType:params.busType,
        seatNumbers:params.seatNumbers,
        noOfTicket:params.noOfTicket,
        totalFare:params.totalFare,
      } 
            
    });
  };

  const handleSearch = () => {
    router.push({
      pathname: "/passenger/index1",
      params:{ 
        

        Pid: params.Pid,
        Pid1: params.Pid1,
        pfirstName: params.pfirstName,
        plastName:params.plastName,
        pphoneNumber: params.pphoneNumber,
        pemail: params.pemail,
        NIC: params.NIC,
        
      } 
        
    });
  };
  

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
      {/* Failed Icon */}
      <Animated.View
        style={[
          styles.iconWrapper,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.iconCircleOuter}>
          <View style={styles.iconCircleInner}>
            <Entypo name="cross" size={58} color="#FFFFFF" />
          </View>
        </View>
      </Animated.View>

      <Animated.View style={{ opacity: fadeAnim, width: '100%', alignItems: 'center' }}>
        <Text style={styles.title}>Payment Failed</Text>
        <Text style={styles.subtitle}>
          Your account balance is insufficient to complete this payment.
        </Text>

        {/* Amount */}
        

        {/* Actions */}
        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85} onPress={handleSearch1}>
          <Text style={styles.primaryButtonText}>Try again with another card</Text>
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
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleInner: { width: 94, height: 94, borderRadius: 47, backgroundColor: '#E5484D', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 6 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.88)', marginBottom: 18, textAlign: 'center', lineHeight: 20 },
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
    padding: 20,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
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