import React, { useState } from 'react';
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import SearchPanel from "../../../components/SearchPanel";
import { Ionicons, Feather, FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AlertBadge from "../../../components/AlertBadge";

const ToursScreen: React.FC = () => {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('');
  const firstInitial = String(params.dfirstName ?? '').charAt(0).toUpperCase();
  const lastInitial = String(params.dlastName ?? '').charAt(0).toUpperCase();

  const handleSearch = () => {
    router.push({
      pathname: "/admin/Staff/index4",
      params: {
        Did: params.Did,
        driverId: params.driverId,
        dfirstName: params.dfirstName,
        dlastName: params.dlastName,
        phoneNumber: params.phoneNumber,
        address: params.address,
        NIC: params.NIC,
        drivingLicense: params.drivingLicense,
        Birthday: params.Birthday,
        demail: params.demail,
        password: params.password,
        

        Aid: params.Aid,
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
      } 
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={["#173C79","#155B8A","#159B79",]}
          start={{x: 0, y: 0,}}
          end={{x: 1, y: 1,}}
          style={styles.submitGradient1}
        >

          <View style={styles.header}>
            <Text style={styles.title}>Jetlink</Text>
          </View>
        </LinearGradient>

        <View style={styles.card}>
          <View style={styles.header1}>
            <View style={styles.searchButton}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {firstInitial}{lastInitial}
                </Text>
              </View>
              <View style={styles.avatar1}>
                <Text style={styles.fullName}>
                  {params.dfirstName} {params.dlastName}
                </Text>
                <View style={styles.badge}>
                  
                  <Text style={styles.badgeText}>Driver</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity activeOpacity={0.85} onPress={handleSearch}>
              <Ionicons name="create-outline" size={28} color="#8A8A8A" style={{ marginRight: 8 }} />
              <Text style={styles.searchButtonText}>Edit</Text> 
            </TouchableOpacity>
          </View>

          <View style={styles.svw}>
            
            <View style={styles.row}>
                <View style={styles.iconWrap}>
                    <Ionicons name="call-outline" size={18} color="#4A6FA5" />
                </View>
                <View style={styles.rowText}>
                    <Text style={styles.label}>Phone</Text>
                    <Text style={styles.value}>{params.phoneNumber}</Text>
                </View>
            </View>

            <View style={styles.row}>
                <View style={styles.iconWrap}>
                    <Ionicons name="location-outline" size={18} color="#4A6FA5" />
                </View>
                <View style={styles.rowText}>
                    <Text style={styles.label}>Address</Text>
                    <Text style={styles.value}>{params.address}</Text>
                </View>
            </View>

            <View style={styles.row}>
                <View style={styles.iconWrap}>
                    <Ionicons name="card-outline" size={18} color="#4A6FA5" />
                </View>
                <View style={styles.rowText}>
                    <Text style={styles.label}>NIC</Text>
                    <Text style={styles.value}>{params.NIC || '—'}</Text>
                </View>
            </View>

            <View style={styles.row}>
                <View style={styles.iconWrap}>
                    <FontAwesome name="drivers-license-o" size={18} color="#4A6FA5" />
                </View>
                <View style={styles.rowText}>
                    <Text style={styles.label}>Driving License</Text>
                    <Text style={styles.value}>{params.drivingLicense || '—'}</Text>
                </View>
            </View>

            <View style={styles.row}>
                <View style={styles.iconWrap}>
                    <FontAwesome5 name="birthday-cake" size={18} color="#4A6FA5" />
                </View>
                <View style={styles.rowText}>
                    <Text style={styles.label}>Birth Day</Text>
                    <Text style={styles.value}>{params.Birthday || '—'}</Text>
                </View>
            </View>

            <View style={styles.row}>
                <View style={styles.iconWrap}>
                    <Ionicons name="mail-outline" size={18} color="#4A6FA5" />
                </View>
                <View style={styles.rowText}>
                    <Text style={styles.label}>Gmail</Text>
                    <Text style={styles.value}>{params.demail}</Text>
                </View>
            </View>


          </View>

        


        </View>

        <SearchPanel
          visible={isSearching}
          query={searchQuery}
          onChangeQuery={setSearchQuery}
          onClose={() => { setIsSearching(false); setSearchQuery(""); }}
          role={"admin"}
          params={params}
        />

        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.item}
            onPress={() => {
              setActiveTab("home");
              if (isSearching) {
                setIsSearching(false); setSearchQuery("");
              } else {
                router.push({
                  pathname: "/admin/Staff/index2",
                  params: {
                    Aid: params.Aid,
                    firstName: params.firstName,
                    lastName: params.lastName,
                    email: params.email,
                  },
                });
              }
            }}
          >
            <Ionicons name={isSearching ? "arrow-back" : "arrow-back-outline"} size={24} color={activeTab === "home" ? "#0057D9" : "#8A8A8A"} />
            <Text style={[styles.label1, activeTab === "home" && styles.activeLabel]}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("routes"); if (isSearching) setSearchQuery(""); setIsSearching(!isSearching); }}>
            <FontAwesome name={isSearching ? "close" : "search"} size={22} color={activeTab === "routes" ? "#0057D9" : "#8A8A8A"} />
            <Text style={[styles.label1, activeTab === "routes" && styles.activeLabel]}>Search</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.centerButton} onPress={() => {setActiveTab("tickets"); router.push({
                    pathname: "/admin/index1",
                    params: {
                      Aid: params.Aid,
                      firstName: params.firstName,
                      lastName: params.lastName,
                      email: params.email,
                    },                    
                  });}} > 
            <Ionicons name="home-outline" size={28} color="#fff" />             
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("alerts"); router.push({ pathname: "/notifications", params: { role: "admin" } }); }}>
            <View><Ionicons name="notifications-outline" size={24} color={activeTab === "alerts" ? "#0057D9" : "#8A8A8A"} /><AlertBadge role="admin" /></View>
            <Text style={[styles.label1, activeTab === "alerts" && styles.activeLabel]}>Alerts</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => {setActiveTab("profile"); router.push({
                      pathname: "/admin/Profile/adminProfile",
                      params: {
                        Aid: params.Aid,
                        firstName: params.firstName,
                        lastName: params.lastName,
                        email: params.email,
                      },
                    });}}>
                    <Feather name="user" size={24} color={activeTab === "profile" ? "#0057D9" : "#8A8A8A"}/>
                    <Text style={[styles.label1, activeTab === "profile" && styles.activeLabel,]}>
                      Profile
                    </Text>
                  </TouchableOpacity>
        </View>

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
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" },

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
    letterSpacing: 0.5 },

  card: {
    width: '90%',
    flex: 1,
    maxHeight: '68%',
    backgroundColor: '#FFF',
    marginTop: -50,
    alignSelf: 'center',
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
  },

  header1: {
    justifyContent: "space-between",
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 20,
    backgroundColor: '#F4F7FC',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  avatar: {
    marginLeft: 10,
    width: 64, 
    height: 64, 
    borderRadius: 32,
    backgroundColor: '#4A6FA5',
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: { 
    color: '#FFF', 
    fontSize: 22, 
    fontWeight: '700' 
  },

  avatar1: {
    marginTop:7,
    marginLeft: 10,
  },

  fullName: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#1E293B' 
  },

  badge: {
    //flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF7EC',
    //paddingHorizontal: 1,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    gap: 4,
  },

  badgeText: { 
    fontSize: 11, 
    color: '#2F9E44', 
    fontWeight: '600', 
    //marginLeft: 4 
  },

  svw: { 
    width: '100%', 
    marginBottom: 80, 
    marginTop: 10, 
    paddingHorizontal: 20 
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  iconWrap: {
    width: 36, 
    height: 36, 
    borderRadius: 18,
    backgroundColor: '#EAF0FB',
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 14,
  },

  rowText: { 
    flex: 1 
  },

  label: { 
    fontSize: 12, 
    color: '#94A3B8', 
    marginBottom: 2, 
    textTransform: 'uppercase', 
    letterSpacing: 0.5 
  },

  value: { 
    fontSize: 15, 
    color: '#1E293B', 
    fontWeight: '500' 
  },

  searchButton: {
   
    flexDirection: 'row',
 
  },

  searchButtonText: {
    
    color: '#8A8A8A',
    fontSize: 13,
    fontWeight: 'bold',
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
    bottom: 15, left: 10, right: 10,
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-around",
    height: 75,
    marginBottom: 60,
    backgroundColor: "#fff",
    borderRadius: 25,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 10,
  },

  item: { 
    alignItems: "center", 
    justifyContent: "center", 
    flex: 1 
  },

  label1: { 
    marginTop: 4, 
    fontSize: 13, 
    color: "#8A8A8A" 
  },

  activeLabel: { 
    color: "#0057D9", 
    fontWeight: "600" 
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

export default ToursScreen;