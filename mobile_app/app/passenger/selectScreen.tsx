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
      <StatusBar barStyle="light-content" backgroundColor="#0056b3" />
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

          <TouchableOpacity style={styles.card} onPress={() => router.push("/passenger/index2")} >
              <View style={[styles.iconWrap, { backgroundColor: "#F59E0B18" }]}>
                  <Ionicons name="person-circle-outline" size={50} color="#F59E0B" />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.text1}>Passenger</Text>
                <Text style={styles.text2}>Book bus tickets, parcels, tours</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.card1} onPress={() => router.push("/busStaff/loginindex")} >
              <View style={[styles.iconWrap, { backgroundColor: "#8B5CF618" }]}>
                  <Fontisto name="bus" size={40} color="#8B5CF6" />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.text1}>Bus</Text>
                <Text style={styles.text2}>Manage parcels, trips, scan tickets</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
          </TouchableOpacity>

            {/* <TouchableOpacity style={styles.card} onPress={() => router.push("/passenger/dailyBuses/selectSeat")} >
              <View style={styles.iconContainer}>
                <MaterialIcons name={"tour"}  size={22} color={"#FF0000" } />
              </View>
              <Text style={styles.cardText}>Admin</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
          </TouchableOpacity> */}

          {/* <TouchableOpacity style={styles.card} onPress={() => router.push("/Test/SeatSelectionScreen")} >
              <View style={styles.iconContainer}>
                <MaterialIcons name={"tour"}  size={22} color={"#FF0000" } />
              </View>
              <Text style={styles.cardText}>Admin</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
          </TouchableOpacity> */}

          {/* <TouchableOpacity style={styles.card} onPress={() => router.push("/Test/VerifyTicketScreen")} >
              <View style={styles.iconContainer}>
                <MaterialIcons name={"tour"}  size={22} color={"#FF0000" } />
              </View>
              <Text style={styles.cardText}>Admin</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
          </TouchableOpacity> */}

        

        {/* Footer */}
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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