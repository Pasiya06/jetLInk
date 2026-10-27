import React, { useEffect, useRef, useState } from 'react';

import { Stack, useRouter } from "expo-router";
import {
  Image,
  StyleSheet,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  BackHandler,
} from "react-native";

// Icons
import { 
  Ionicons, 
  MaterialCommunityIcons, 
  Fontisto, 
  FontAwesome6, 
  MaterialIcons, 
  FontAwesome5 
} from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FeatureCard, C } from "../../components/JetUI";





export default function Index() {
  const router = useRouter();
  useEffect(() => {
        const backAction = () => {
          router.replace("/passenger/selectScreen"); // Navigate to a specific path
          return true; // Prevent default back behavior
        };
    
        const subscription = BackHandler.addEventListener(
          "hardwareBackPress",
          backAction
        );
    
        return () => subscription.remove();
      }, []);
  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#173C79" />
      <SafeAreaView style={styles.container}>
      <LinearGradient
          colors={["#173C79","#155B8A","#159B79",]}
          start={{x: 0, y: 0,}}
          end={{x: 1, y: 1,}}
          style={styles.hero}
        >
        <View style={styles.logo}>
          <Ionicons name="bus" size={30} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>JetLink</Text>
        <Text style={styles.heroSub}>Smart bus tickets, parcels and tours</Text>
      </LinearGradient>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.question}>How would you like to continue?</Text>

        <FeatureCard
          icon={<Ionicons name="person-circle-outline" size={32} color="#FFFFFF" />}
          iconBg={C.blue}
          title="I'm a passenger"
          subtitle="Book bus tickets, send parcels and plan tours"
          cta="Continue as passenger"
          onPress={() => router.push("/passenger/index2")}
        />

        <FeatureCard
          icon={<Fontisto name="bus" size={24} color={C.amber} />}
          iconBg={C.amberSoft}
          title="I'm bus staff"
          subtitle="Manage parcels and trips, and scan tickets"
          cta="Continue as staff"
          onPress={() => router.push("/busStaff/loginindex")}
        />

            {/* <TouchableOpacity style={styles.card} onPress={() => router.push("/passenger/tours/paymentSuccessful")} >
              <View style={styles.iconContainer}>
                <MaterialIcons name={"tour"}  size={22} color={"#FF0000" } />
              </View>
              <Text style={styles.cardText}>Admin</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
          </TouchableOpacity> */}

          {/* <TouchableOpacity style={styles.card} onPress={() => router.push("/busStaff/EmergencyButton")} >
              <View style={styles.iconContainer}>
                <MaterialIcons name={"tour"}  size={22} color={"#FF0000" } />
              </View>
              <Text style={styles.cardText}>Admin</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
          </TouchableOpacity> */}

          {/* <TouchableOpacity style={styles.card} onPress={() => router.push("/Test/EmergencyBuses")} >
              <View style={styles.iconContainer}>
                <MaterialIcons name={"tour"}  size={22} color={"#FF0000" } />
              </View>
              <Text style={styles.cardText}>Admin</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
          </TouchableOpacity> */}

        

      </ScrollView>

        {/* Footer */}
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
}

const styles = StyleSheet.create({
  question: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginBottom: 2 },
  bodyContent: { paddingHorizontal: 16, paddingBottom: 120, gap: 14 },
  body: { flex: 1, marginTop: -64 },
  heroSub: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.88)', marginTop: 6 },
  logo: { width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  hero: { borderBottomLeftRadius: 32, borderBottomRightRadius: 32, paddingTop: 70, paddingBottom: 96, alignItems: 'center' },
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 70,   
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  submitGradient1: {
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  title: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
  listContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  card: {
    marginLeft: 20,
    marginRight: 20,
    flex: 1,
    maxHeight: '15%',
    backgroundColor: '#FFF',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: -50,   
    alignSelf: 'center',
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  card1: {
    marginLeft: 20,
    marginRight: 20,
    flex: 1,
    maxHeight: '15%',
    backgroundColor: '#FFF',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 30,   
    alignSelf: 'center',
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginLeft: 20,
  },

  cardText: {
    paddingHorizontal: 10,
    flex: 1,
    fontSize: 24,
    color: '#0047AB',
    fontWeight: '600',
  },

  text1:{
    fontSize: 24,
    color: '#000000',
    fontWeight: '600',
  
  },

  text2:{
    fontSize: 14,
    color: '#7b7b7b',
    fontWeight: '600',
  
  },
  title1: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  
  ScrollContainer:{
    paddingBottom: 70,
    
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