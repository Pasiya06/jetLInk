import React, { useState } from 'react';
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import SearchPanel from "../../../components/SearchPanel";
import { Ionicons, Feather, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AlertBadge from "../../../components/AlertBadge";
import { ScreenHeader, SectionLabel, Avatar, C, ui } from "../../../components/JetUI";

const ToursScreen: React.FC = () => {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('');

  const InfoRow = ({ icon, label, value }: { icon: any; label: string; value?: string }) => (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={19} color={C.blue} />
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
        <ScreenHeader eyebrow="Passenger profile" title="Passenger" />

        <ScrollView style={ui.body} contentContainerStyle={ui.bodyContent} showsVerticalScrollIndicator={false}>
          <View style={[ui.card, styles.profileCard]}>
            <Avatar name={`${params.pfirstName ?? ""} ${params.plastName ?? ""}`} size={84} />
            <Text style={styles.fullName}>
              {params.pfirstName} {params.plastName}
            </Text>
            <View style={styles.badge}>
              <Ionicons name="checkmark-circle" size={14} color={C.green} />
              <Text style={styles.badgeText}>Registered passenger</Text>
            </View>
          </View>

          <SectionLabel>Contact details</SectionLabel>
          <View style={[ui.card, styles.infoCard]}>
            <InfoRow icon="call-outline" label="Phone" value={params.phoneNumber as string} />
            <InfoRow icon="mail-outline" label="Email" value={params.pemail as string} />
            <InfoRow icon="location-outline" label="Address" value={params.address as string} />
          </View>

          <SectionLabel>Identity</SectionLabel>
          <View style={[ui.card, styles.infoCard]}>
            <InfoRow icon="card-outline" label="NIC" value={params.NIC as string} />
          </View>
        </ScrollView>

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
  infoCard: { paddingHorizontal: 16, paddingVertical: 4 },
  profileCard: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16, borderRadius: 24 },
  container: { flex: 1, backgroundColor: C.bg },

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

  fullName: { fontSize: 22, fontWeight: '800', color: C.navy, marginTop: 12, textAlign: 'center' },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.greenSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 10,
    gap: 6,
  },

  badgeText: { fontSize: 12, color: C.green, fontWeight: '700' },

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
    borderBottomColor: C.line,
  },

  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.blueSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  rowText: { 
    flex: 1 
  },

  label: { fontSize: 12, color: C.muted, fontWeight: '600', marginBottom: 2 },

  value: { fontSize: 15, color: C.ink, fontWeight: '700' },

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