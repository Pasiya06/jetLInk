import React, { useEffect } from 'react';
import { Stack, useRouter } from "expo-router";
import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { FontAwesome6 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Ensure splash screen is hidden once this screen is ready
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  const handleStart = () => {
    router.push("/passenger/selectScreen");
  };

  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <SafeAreaView style={styles.container}>
        <View style={styles.contentWrap}>
          {/* Logo and Branding */}
          <View style={styles.logoSection}>
            <Image
              source={require("../assets/images/JetLink.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.appTitle}>JetLink</Text>
            <Text style={styles.appSubtitle}>Smart Transit & Logistics</Text>
          </View>

          {/* Action Button */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.submitButton}
              activeOpacity={0.85}
              onPress={handleStart}
            >
              <LinearGradient
                colors={['#173C79', '#155B8A', '#159B79']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGradient}
              >
                <Text style={styles.submitText}>Get Started</Text>
                <FontAwesome6 name="arrow-right-long" size={20} color="#ffffff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentWrap: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 48,
  },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  logoImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#173C79',
    letterSpacing: 1,
  },
  appSubtitle: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 6,
    fontWeight: '500',
  },
  actionSection: {
    width: '100%',
  },
  submitButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: "#173C79",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 8,
  },
  submitGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    marginRight: 12,
  },
});
