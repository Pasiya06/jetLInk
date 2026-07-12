import React from 'react';

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





export default function Index() {
  const router = useRouter();
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
          
          <TouchableOpacity><Text style={styles.title}>Jetlink</Text></TouchableOpacity>
          
          <TouchableOpacity>
            <Ionicons name="notifications" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        
       
        
        {/* List Section */}
        <ScrollView contentContainerStyle={styles.ScrollContainer}>
        <View style={styles.listContainer}>
          
          <TouchableOpacity style={styles.card} onPress={() => router.push("/passenger/index2")} >
              <View style={styles.iconContainer}>
                <Fontisto name={"bus"}  size={22} color={"#32CD32" } />
              </View>
              <Text style={styles.cardText}>Passenger and Admin</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => router.push("/busStaff/loginindex")} >
              <View style={styles.iconContainer}>
                <FontAwesome6 name={"gift"}  size={22} color={"#FFA500" } />
              </View>
              <Text style={styles.cardText}>Bus Staff</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
          </TouchableOpacity>

           <TouchableOpacity style={styles.card} onPress={() => router.push("/admin/index21")} >
              <View style={styles.iconContainer}>
                <MaterialIcons name={"tour"}  size={22} color={"#FF0000" } />
              </View>
              <Text style={styles.cardText}>Admin</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => router.push("/passenger/parcel/paymentGateway")} >
              <View style={styles.iconContainer}>
                <MaterialIcons name={"tour"}  size={22} color={"#FF0000" } />
              </View>
              <Text style={styles.cardText}>Admin</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
          </TouchableOpacity>

          
        </View>

        </ScrollView>

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
    paddingBottom: 20,
    backgroundColor: '#0047AB',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4, },
    shadowOpacity: 0.25,
    shadowRadius: 6,
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