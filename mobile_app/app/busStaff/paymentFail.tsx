import React, { useEffect, useRef } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Entypo } from '@expo/vector-icons';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const handleSearch1 = () => {
        router.push({
            pathname: "/busStaff/paymentGateway",
            params:{ 
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
              sendername:params.sendername,
              smobilenumber:params.smobilenumber,
              semail:params.semail,
              receivername:params.receivername,
              rmobilenumber:params.rmobilenumber,
              remail:params.remail,
              weight:params.weight,
              pickup:params.pickup,
              drop:params.drop,
              date:params.date,
              time:params.time,
              totalFare:params.totalFare,
            } 
            
        });
      };

  const handleSearch = () => {
        router.push({
            pathname: "/busStaff/index1",
            params:{ 
              

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
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <LinearGradient colors={["#8E1B1B", "#C62828", "#EF5350"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
            <Animated.View style={[styles.iconWrapper, { transform: [{ scale: scaleAnim }] }]}>
              <View style={styles.iconCircleOuter}>
                <View style={styles.iconCircleInner}>
                  <Entypo name="cross" size={56} color="#C62828" />
                </View>
              </View>
            </Animated.View>
            <Text style={styles.title}>Payment failed</Text>
            <Text style={styles.subtitle}>The payment didn't go through. Nothing was charged.</Text>
          </LinearGradient>

          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.card}>
              <View style={styles.reasonRow}>
                <Entypo name="credit-card" size={20} color="#C62828" />
                <Text style={styles.reasonText}>The card balance is too low to pay for this parcel.</Text>
              </View>
            </View>

            <View style={styles.actions}>
              <GradientButton label="Try another card" icon="card-outline" onPress={handleSearch1} />
              <TouchableOpacity style={styles.secondaryButton} onPress={handleSearch} activeOpacity={0.85}>
                <Entypo name="home" size={18} color="#155B8A" />
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
