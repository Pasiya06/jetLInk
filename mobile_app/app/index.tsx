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

import {FontAwesome6} from '@expo/vector-icons';

import { LinearGradient } from 'expo-linear-gradient';





export default function Index() {
  const router = useRouter();
  const handleSearch = () => {
        router.push({
            pathname: "/passenger/selectScreen",
            
            
        });
      };
  
  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#0056b3" />
      <SafeAreaView style={styles.container}>
        <View style={styles.iconContainer}>
          <Image source ={require("../assets/images/JetLink.png")} style={styles.imageSize} />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSearch}>
            <LinearGradient
                colors={['#4B6CF5', '#32CD32']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGradient}
            >
            <Text style={styles.submitText}>Get Start</Text>
            <FontAwesome6 name="arrow-right-long" size={24} color="#ffffff" />
            </LinearGradient>
        </TouchableOpacity>

        
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    
    paddingTop:"100%",
  },
  imageSize:{
    marginLeft:"700%",
    width:500,
    height:500,

  },
  
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  
  submitButton: {
    marginLeft: 20,
    marginRight: 20,
    justifyContent: "space-around",
      
    height: 55,
    overflow: 'hidden',
    borderRadius: 25,
    marginTop: 200,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    elevation: 10,
  },

  submitGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

   submitText: {
    marginRight: 20,
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});