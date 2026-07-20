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

        
       
        
        {/* List Section */}
        <ScrollView contentContainerStyle={styles.ScrollContainer}>
        <View style={styles.listContainer}>
          
          <TouchableOpacity style={styles.card} onPress={() => router.push("/passenger/index2")} >
              <View style={styles.iconContainer}>
                <MaterialIcons name="people"  size={22} color={"#32CD32" } />
              </View>
              <Text style={styles.cardText}>Passenger</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => router.push("/busStaff/loginindex")} >
              <View style={styles.iconContainer}>
                <Fontisto name="bus" size={22} color={"#FFA500" } />
              </View>
              <Text style={styles.cardText}>Bus</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
          </TouchableOpacity>

            {/* <TouchableOpacity style={styles.card} onPress={() => router.push("/busStaff/scanParcel")} >
              <View style={styles.iconContainer}>
                <MaterialIcons name={"tour"}  size={22} color={"#FF0000" } />
              </View>
              <Text style={styles.cardText}>Admin</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
          </TouchableOpacity> */}

          {/* <TouchableOpacity style={styles.card} onPress={() => router.push("/admin/buses/busProfile")} >
              <View style={styles.iconContainer}>
                <MaterialIcons name={"tour"}  size={22} color={"#FF0000" } />
              </View>
              <Text style={styles.cardText}>Admin</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
          </TouchableOpacity> */}

          {/*<TouchableOpacity style={styles.card} onPress={() => router.push("/admin/CreateTicketScreen")} >
              <View style={styles.iconContainer}>
                <MaterialIcons name={"tour"}  size={22} color={"#FF0000" } />
              </View>
              <Text style={styles.cardText}>Admin</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
          </TouchableOpacity> */}

          
        </View>

        </ScrollView>

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
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: '#32CD32',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4, },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  card1: {
    
    backgroundColor: '#0047AB',
    flexDirection: 'row',
    
    paddingLeft:10,
    paddingBottom:80,
    borderRadius: 16,
    
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 20,
    marginTop: 22,
    borderWidth: 0.5,
    borderColor: '#0047AB',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4, },
    shadowOpacity: 0.2,
    shadowRadius: 6,
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
  cardText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#0047AB',
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