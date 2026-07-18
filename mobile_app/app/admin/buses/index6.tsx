import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";

import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, FontAwesome, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type FieldKey =
  | 'busNumber'
  | 'chassisNo'
  | 'engineNo'
  | 'colour'
  | 'serviceDate'
  | 'licenseDate'
  | 'emissionDate';

type FieldConfig = {
  key: FieldKey;
  label: string;
  icon: string;
  iconSet: 'material' | 'ion';
  color: string;
};

const FIELD_CONFIG: FieldConfig[] = [
  { key: 'busNumber', label: 'Bus Number', icon: 'bus', iconSet: 'material', color: '#4361EE' },
  { key: 'chassisNo', label: 'Chassis Number', icon: 'car-side', iconSet: 'material', color: '#F72585' },
  { key: 'engineNo', label: 'Engine Number', icon: 'engine', iconSet: 'material', color: '#FF9F1C' },
  { key: 'colour', label: 'Colour', icon: 'palette', iconSet: 'material', color: '#2EC4B6' },
  { key: 'serviceDate', label: 'Service Date', icon: 'calendar-check', iconSet: 'ion', color: '#7209B7' },
  { key: 'licenseDate', label: 'License Date', icon: 'calendar-clear', iconSet: 'ion', color: '#3A86FF' },
  { key: 'emissionDate', label: 'Emission Date', icon: 'leaf', iconSet: 'ion', color: '#38B000' },
];

const InputField = ({ config, value, onChangeText }: {
  config: FieldConfig;
  value: string;
  onChangeText: (text: string) => void;
}) => {
  const IconComponent = config.iconSet === 'material' ? MaterialCommunityIcons : Ionicons;

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{config.label}</Text>
      <View style={styles.inputWrapper}>
        <View style={[styles.iconWrap, { backgroundColor: `${config.color}1A` }]}>
          <IconComponent name={config.icon as any} size={18} color={config.color} />
        </View>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={`Enter ${config.label.toLowerCase()}`}
          placeholderTextColor="#A0A5B1"
        />
      </View>
    </View>
  );
};

const AddBus = () => {
  const [busNumber, setBusNumber] = useState("");
  const [chassisNo, setChassisNo] = useState("");
  const [engineNo, setEngineNo] = useState("");
  const [colour, setColour] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [licenseDate, setLicenseDate] = useState("");
  const [emissionDate, setEmissionDate] = useState("");
  const busType: string = "NormalWay";
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState('');
  const params = useLocalSearchParams();
  const router = useRouter();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const values: Record<FieldKey, string> = {
    busNumber, chassisNo, engineNo, colour,
    serviceDate, licenseDate, emissionDate,
  };
  const setters: Record<FieldKey, (text: string) => void> = {
    busNumber: setBusNumber,
    chassisNo: setChassisNo,
    engineNo: setEngineNo,
    colour: setColour,
    serviceDate: setServiceDate,
    licenseDate: setLicenseDate,
    emissionDate: setEmissionDate,
  };

  const handleAddBus = async () => {
    if (!busNumber || !chassisNo || !engineNo) {
      alert("Please fill required fields");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/buses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          busNumber,
          chassisNo,
          engineNo,
          colour,
          serviceDate,
          licenseDate,
          emissionDate,
          busType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Bus Added Successfully");

        router.push({
          pathname: "/admin/buses/index2",
          params: {
            Aid: params.Aid,
            firstName: params.firstName,
            lastName: params.lastName,
            email: params.email,
          },
        });
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Server Connection Failed");
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <SafeAreaView style={styles.container}>

        <LinearGradient
          colors={['#4B6CF5', '#32CD32']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity>
            <View style={styles.headerContent}>
              
              <Text style={styles.title}>Normal Way Bus</Text>
              
            </View>
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.card}>
          <ScrollView style={styles.svw} showsVerticalScrollIndicator={false}>
            {FIELD_CONFIG.map((config) => (
              <InputField
                key={config.key}
                config={config}
                value={values[config.key]}
                onChangeText={setters[config.key]}
              />
            ))}
          </ScrollView>

          <TouchableOpacity activeOpacity={0.85} style={styles.searchButton} onPress={handleAddBus}>
            <LinearGradient
              colors={['#4B6CF5', '#32CD32']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              <Text style={styles.searchButtonText}>Add Bus</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

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

          <TouchableOpacity style={styles.item} onPress={() => {
            setActiveTab("home");
            if (isSearching) {
              setIsSearching(false);
            } else {
              router.push({
                pathname: "/admin/buses/index2",
                params: {
                  Aid: params.Aid,
                  firstName: params.firstName,
                  lastName: params.lastName,
                  email: params.email,
                },
              });
            }
          }}>
            <Ionicons name={isSearching ? "arrow-back" : "arrow-back-outline"} size={24} color={activeTab === "home" ? "#0057D9" : "#8A8A8A"} />
            <Text style={[styles.label1, activeTab === "home" && styles.activeLabel]}>
              Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("routes"); setIsSearching(!isSearching); }}>
            <FontAwesome name={isSearching ? "close" : "search"} size={24} color={activeTab === "routes" ? "#0057D9" : "#8A8A8A"} />
            <Text style={[styles.label1, activeTab === "routes" && styles.activeLabel]}>
              Routes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.centerButton} onPress={() => { setActiveTab("tickets"); router.push("/admin/index1"); }}>
            <Ionicons name="home-outline" size={28} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("routes"); router.push("/admin/index1"); }}>
            <Ionicons name="notifications-outline" size={24} color={activeTab === "alerts" ? "#0057D9" : "#8A8A8A"} />
            <Text style={[styles.label1, activeTab === "alerts" && styles.activeLabel]}>
              Alerts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("profile"); router.push("/admin/index1"); }}>
            <Feather name="user" size={24} color={activeTab === "profile" ? "#0057D9" : "#8A8A8A"} />
            <Text style={[styles.label1, activeTab === "profile" && styles.activeLabel]}>
              Profile
            </Text>
          </TouchableOpacity>
        </View>

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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },

  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 70,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  headerContent: {
    alignItems: 'center',
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
    marginTop: 8,
  },

  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  card: {
    width: '90%',
    flex: 1,
    maxHeight: '68%',
    backgroundColor: '#FFF',
    padding: 20,
    marginTop: -50,
    alignSelf: 'center',
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },

  svw: {
    width: '100%',
    marginBottom: 70,
  },

  fieldContainer: {
    marginBottom: 16,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A4F5C',
    marginBottom: 8,
    marginLeft: 2,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    paddingHorizontal: 12,
    height: 52,
  },

  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: '#1A1D26',
  },

  searchButton: {
    position: "absolute",
    bottom: 15,
    left: 10,
    right: 10,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 10,
  },

  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 55,
    gap: 8,
  },

  searchButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
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
    shadowOffset: { width: 0, height: -2 },
    elevation: 10,
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
    shadowOffset: { width: 0, height: 4 },
    elevation: 12,
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
    bottom: 5,
    width: '100%',
    overflow: 'hidden',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25, 
  },
});

export default AddBus;