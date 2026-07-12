import React, { useState } from 'react';
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons, FontAwesome, Feather } from '@expo/vector-icons';

const ParcelDetails = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('');

  // Guard against params possibly being arrays (repeated query keys)
  const getParam = (key: string) => {
    const val = params[key];
    return Array.isArray(val) ? val[0] : val;
  };

  const details = [
    { label: 'Weight', value: `${getParam('weight')} kg`, icon: 'cube-outline', color: '#F5A623' },
    { label: 'Pickup Location', value: getParam('pickup'), icon: 'location-outline', color: '#4A90E2' },
    { label: 'Drop Location', value: getParam('drop'), icon: 'flag-outline', color: '#7ED321' },
    { label: 'Date', value: getParam('date'), icon: 'calendar-outline', color: '#9B59B6' },
    { label: 'Time', value: getParam('time'), icon: 'time-outline', color: '#E74C3C' },
  ] as const;

  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <SafeAreaView style={styles.container}>

        <View style={styles.header}>
          <Text style={styles.title}>Parcel Details</Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          <View style={styles.detailsCard}>
            <Text style={styles.cardTitle}>Shipment Summary</Text>

            {details.map((item, index) => (
              <View key={index} style={styles.detailRow}>
                <View style={[styles.iconWrap, { backgroundColor: `${item.color}20` }]}>
                  <Ionicons name={item.icon} size={18} color={item.color} />
                </View>
                <View style={styles.detailTextWrap}>
                  <Text style={styles.detailLabel}>{item.label}</Text>
                  <Text style={styles.detailValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {isSearching ? (
          <TextInput
            style={styles.searchBarInput}
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
          />
        ) : null}

        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.item}
            onPress={() => {
              setActiveTab("home");
              if (isSearching) {
                setIsSearching(false);
              } else {
                router.back();
              }
            }}
          >
            <Ionicons
              name={isSearching ? "arrow-back" : "arrow-back-outline"}
              size={24}
              color={activeTab === "home" ? "#0057D9" : "#8A8A8A"}
            />
            <Text style={[styles.label1, activeTab === "home" && styles.activeLabel]}>
              Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => {
              setActiveTab("routes");
              setIsSearching(!isSearching);
            }}
          >
            <FontAwesome
              name={isSearching ? "close" : "search"}
              size={24}
              color={activeTab === "routes" ? "#0057D9" : "#8A8A8A"}
            />
            <Text style={[styles.label1, activeTab === "routes" && styles.activeLabel]}>
              Routes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.centerButton}
            onPress={() => {
              setActiveTab("tickets");
              router.push("/admin/index1");
            }}
          >
            <Ionicons name="home-outline" size={28} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => {
              setActiveTab("alerts");
              router.push("/admin/index1");
            }}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={activeTab === "alerts" ? "#0057D9" : "#8A8A8A"}
            />
            <Text style={[styles.label1, activeTab === "alerts" && styles.activeLabel]}>
              Alerts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => {
              setActiveTab("profile");
              router.push("/admin/index1");
            }}
          >
            <Feather
              name="user"
              size={24}
              color={activeTab === "profile" ? "#0057D9" : "#8A8A8A"}
            />
            <Text style={[styles.label1, activeTab === "profile" && styles.activeLabel]}>
              Profile
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerGraphic}>
          <View style={styles.blueCurve} />
          <View style={styles.greenCurve} />
        </View>

      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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

  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  detailTextWrap: {
    marginLeft: 12,
    flex: 1,
  },

  detailLabel: {
    fontSize: 12,
    color: '#8A8A8A',
    fontWeight: '500',
    marginBottom: 2,
  },

  detailValue: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '600',
  },

  searchBarInput: {
    position: "absolute",
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginLeft: 15,
    marginTop: 45,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    width: '90%',
  },

  bottomNav: {
    position: "absolute",
    bottom: 15,
    left: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 60,
    height: 75,
    backgroundColor: "#fff",
    borderRadius: 25,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    elevation: 10,
  },

  item: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  label1: {
    marginTop: 4,
    fontSize: 13,
    color: "#8A8A8A",
  },

  activeLabel: {
    color: "#0057D9",
    fontWeight: "600",
  },

  centerButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#2F80ED",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -28,
    shadowColor: "#2F80ED",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 12,
  },

  footerGraphic: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 60,
    overflow: 'hidden',
  },

  blueCurve: {
    backgroundColor: '#ffffff',
    height: 90,
    width: '100%',
    borderRadius: 50,
    position: 'absolute',
  },

  greenCurve: {
    backgroundColor: '#0052cc',
    height: 100,
    width: '100%',
    borderRadius: 25,
    position: 'absolute',
  },
});

export default ParcelDetails;