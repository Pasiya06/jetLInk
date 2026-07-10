import React, { useEffect, useRef, useState } from 'react';
import { Image, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import {
  StyleSheet,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
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
import * as Location from "expo-location";





const API_URL = process.env.EXPO_PUBLIC_API_URL;
export default function Index() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const locationInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const sendLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") return;

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    await fetch(`${API_URL}/location/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        busNumber: params.busNo,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        speed: location.coords.speed ?? 0,
        heading: location.coords.heading ?? 0,
      }),
    });
  } catch (error) {
    console.log(error);
  }
};

useEffect(() => {
  sendLocation();

  locationInterval.current = setInterval(() => {
    sendLocation();
  }, 5 * 60 * 1000);

  return () => {
    if (locationInterval.current) {
      clearInterval(locationInterval.current);
    }
  };
}, []);

  const logout = () => {
  Alert.alert(
    "Logout",
    "Are you sure you want to logout?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            if (locationInterval.current) {
              clearInterval(locationInterval.current);
              locationInterval.current = null;
            }

            await fetch(`${API_URL}/location/offline`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                busNumber: params.busNo, // <-- use busNumber, not busNo
              }),
            });

            router.replace("/");
          } catch (error) {
            console.log(error);
            router.replace("/");
          }
        },
      },
    ]
  );
};

  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#0056b3" />
      <SafeAreaView style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity>
            <Ionicons name="menu" size={30} color="#ffffff" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={logout}><Text style={styles.title}>Jetlink</Text></TouchableOpacity>
          
          <TouchableOpacity>
            <Ionicons name="notifications" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
                  <View>
                    <Text style={styles.title1}>Good Morning</Text>                    
                  </View> 

                  <View style={styles.iconContainer1}>
                    <Text style={styles.title2}>GB-0967</Text>
                    <MaterialIcons name="waving-hand" size={30} color={"#FFA500"} />
                  </View>
                  
                  <View>
                    <Text style={styles.subtitle1}>Welcome to Jetlink Bus Panel</Text>
                  </View>
                </View>
        
        
          <View style={styles.listContainer1}>
            <TouchableOpacity style={styles.card0} onPress={() => router.push("/busStaff/index1")} >
              <View style={styles.iconContainer}>
                <Image source ={require("../../assets/images/icons8-bus-94.png")} style={styles.input3dIcon1} />
              </View>
              <Text style={styles.cardText}>Scan Bus Ticket</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
            </TouchableOpacity>
          </View>


        <View style={styles.listContainer}>
          <TouchableOpacity style={styles.card1} onPress={() => router.push("/busStaff/index1")} >
              <View style={styles.iconContainer}>
                <Image source ={require("../../assets/images/icons8-package-94.png")} style={styles.input3dIcon} />
              </View>
              <Text style={styles.cardText}>Parcel</Text>
              {/* <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" /> */}
          </TouchableOpacity>

          <TouchableOpacity style={styles.card2} onPress={() => router.push("/busStaff/index1")} >
              <View style={styles.iconContainer}>
                <Image source ={require("../../assets/images/icons8-beach-94.png")} style={styles.input3dIcon} />
              </View>
              <Text style={styles.cardText}>Tours</Text>
              {/* <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" /> */}
          </TouchableOpacity>

          <TouchableOpacity style={styles.card1} onPress={() => router.push("/busStaff/index1")} >
              <View style={styles.iconContainer}>
                <Image source ={require("../../assets/images/icons8-hospital-94.png")} style={styles.input3dIcon} />
              </View>
              <Text style={styles.cardText}>Emergency</Text>
              {/* <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" /> */}
          </TouchableOpacity>
        

          <TouchableOpacity style={styles.card2} onPress={() => router.push("/busStaff/index1")} >
              <View style={styles.iconContainer}>
                
                <Image source ={require("../../assets/images/icons8-help-94.png")} style={styles.input3dIcon} />
              </View>
              <Text style={styles.cardText}>Help</Text>
              {/* <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" /> */}
          </TouchableOpacity>
        </View>
          
          

        

        {/* Footer */}
        <View style={styles.footerGraphic}>
                 <View style={styles.blueCurve} />
                 <View style={styles.greenCurve} />
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
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 70,   
    backgroundColor: '#0047AB',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,  
  },

  card: {
    width: '90%',
    height: '20%',
    backgroundColor: '#FFF',
    padding: 14,
    borderLeftColor: '#32CD32',
    borderRightColor: '#32CD32',
    borderTopColor: '#32CD32',
    marginTop: -50,   
    alignSelf: 'center',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 2,
    borderRadius: 20,
    elevation: 10,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  iconContainer1: { 
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 15,
  },

  title1: {
    width: '100%',    
    color: '#0047AB',
    fontSize: 16,
    fontWeight: '700',
  },

  title2: {
    color: '#0047AB',
    fontSize: 30,
    fontWeight: '700',
    marginRight: 15,
  },

  subtitle1: {
    color: '#555',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },

  listContainer1: {
    paddingHorizontal: 20,
    marginTop: 20,
  },

  card0: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 2,
    borderLeftColor: '#32CD32',
    borderRightColor: '#32CD32',
    borderTopColor: '#32CD32',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4, },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },


  listContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  card1: {
    backgroundColor: '#ffffff',
    width: '48%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    marginBottom: 15,
    borderLeftWidth: 6,
    borderTopColor: '#32CD32',
    borderTopWidth: 2,
    borderLeftColor: '#32CD32',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  card2: {
    backgroundColor: '#ffffff',
    width: '48%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    marginBottom: 15,
    borderTopColor: '#32CD32',
    borderTopWidth: 2,
    borderRightWidth: 6,
    borderRightColor: '#32CD32',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  input3dIcon: {
    marginRight: 12,
    marginLeft: 19,
    width:35,
    justifyContent: 'center',
    marginTop: 25,
    height:35,
    marginBottom: 15,
  },

   input3dIcon1: {
    marginRight: 12,
    
    width:25,
    justifyContent: 'center',
    height:35,
    marginTop: 1,
  },

  cardText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#0047AB',
  },
  
  footerGraphic: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 60,
    overflow: 'hidden',
    marginTop: 22,
  },
  blueCurve: {
    backgroundColor: '#ffffff',
    height: 90,
    width: '120%',
    borderRadius: 100,
    position: 'absolute',
    
   
  },
  greenCurve: {
    backgroundColor: '#0052cc',
    height: 120,
    width: '100%',
    borderRadius: 30,
    position: 'absolute',
    
    
  },
});