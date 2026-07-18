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
import { Ionicons, Feather, FontAwesome } from '@expo/vector-icons';

const ToursScreen: React.FC = () => {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('');

  const InfoRow = ({ icon, label, value }: { icon: any; label: string; value?: string }) => (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={18} color="#4A6FA5" />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value || '—'}</Text>
      </View>
    </View>
  );

  const firstInitial = String(params.pfirstName ?? '').charAt(0).toUpperCase();
  const lastInitial = String(params.plastName ?? '').charAt(0).toUpperCase();

  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <SafeAreaView style={styles.container}>

        <View style={styles.header}>
          <Text style={styles.title}>Jetlink</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.header1}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {firstInitial}{lastInitial}
              </Text>
            </View>
            <Text style={styles.fullName}>
              {params.pfirstName} {params.plastName}
            </Text>
            <View style={styles.badge}>
              <Ionicons name="checkmark-circle" size={13} color="#2F9E44" />
              <Text style={styles.badgeText}>Registered Passenger</Text>
            </View>
          </View>

          <View style={styles.svw}>
            <InfoRow icon="call-outline" label="Phone" value={params.phoneNumber as string} />
            <InfoRow icon="location-outline" label="Address" value={params.address as string} />
            <InfoRow icon="card-outline" label="NIC" value={params.NIC as string} />
            <InfoRow icon="mail-outline" label="Email" value={params.pemail as string} />
          </View>
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
          <TouchableOpacity
            style={styles.item}
            onPress={() => {
              setActiveTab("home");
              if (isSearching) {
                setIsSearching(false);
              } else {
                router.push({
                  pathname: "/admin/regpassengers/index1",
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

          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("routes"); setIsSearching(!isSearching); }}>
            <FontAwesome name={isSearching ? "close" : "search"} size={22} color={activeTab === "routes" ? "#0057D9" : "#8A8A8A"} />
            <Text style={[styles.label1, activeTab === "routes" && styles.activeLabel]}>Routes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.centerButton} onPress={() => {setActiveTab("tickets"); router.push({
                    pathname: "/admin/index1",
                    params: {
                      Pid: params.Pid,
                      Pid1: params.Pid1,
                      pfirstName: params.pfirstName,
                      plastName:params.plastName,
                      pphoneNumber: params.pphoneNumber,
                      pemail: params.pemail,
                    },                    
                  });}} > 
            <Ionicons name="home-outline" size={28} color="#fff" />             
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("alerts"); router.push("/admin/index1"); }}>
            <Ionicons name="notifications-outline" size={24} color={activeTab === "alerts" ? "#0057D9" : "#8A8A8A"} />
            <Text style={[styles.label1, activeTab === "alerts" && styles.activeLabel]}>Alerts</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("profile"); router.push("/admin/index1"); }}>
            <Feather name="user" size={22} color={activeTab === "profile" ? "#0057D9" : "#8A8A8A"} />
            <Text style={[styles.label1, activeTab === "profile" && styles.activeLabel]}>Profile</Text>
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
    backgroundColor: "#fff" },

  header: {
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
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 20,
    backgroundColor: '#F4F7FC',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  avatar: {
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

  fullName: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#1E293B' 
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF7EC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    gap: 4,
  },

  badgeText: { 
    fontSize: 11, 
    color: '#2F9E44', 
    fontWeight: '600', 
    marginLeft: 4 
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

export default ToursScreen;