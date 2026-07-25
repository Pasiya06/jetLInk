import React from 'react';
import  { useState } from 'react';
import { Stack,useRouter,useLocalSearchParams} from "expo-router";
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons, 
  MaterialCommunityIcons, 
  Fontisto, 
  FontAwesome, Feather } from '@expo/vector-icons'; 
import { LinearGradient } from 'expo-linear-gradient';

const ParcelService = () => {
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const params = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState('');
    const router = useRouter();
    const handleSearch = () => {
      router.push({
          pathname: "/admin/Staff/index2", 
           params: {
                  
                  Aid: params.Aid,
                  firstName: params.firstName,
                  lastName: params.lastName,
                  email: params.email,
                },
      });
    };
    const handleSearch1 = () => {
      router.push({
          pathname: "/admin/Staff/index5", 
           params: {
                  
                  Aid: params.Aid,
                  firstName: params.firstName,
                  lastName: params.lastName,
                  email: params.email,
                },
      });
    };
    
  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#4B6CF5', '#32CD32']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.submitGradient1}
        >
       
        <View style={styles.header}> 
            <TouchableOpacity><Text style={styles.title}>{params.parcelId}</Text></TouchableOpacity>
        </View>
      </LinearGradient>

        <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        >
        {/* Sender */}
        <View style={styles.card}>
            <Text style={styles.sectionHeader}>Sender</Text>
            <View style={styles.infoRow}>
            <View style={[styles.iconWrap, { backgroundColor: "#6366f1" }]}>
            <Ionicons name="person" size={18} color="#fff" />
            </View>
            <View style={styles.infoTextWrap}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{params.sendername}</Text>
            </View>
            </View>

            <View style={styles.infoRow}>
            <View style={[styles.iconWrap, { backgroundColor: "#6366f1" }]}>
            <Ionicons name="call" size={18} color="#fff" />
            </View>
            <View style={styles.infoTextWrap}>
            <Text style={styles.infoLabel}>Mobile Number</Text>
            <Text style={styles.infoValue}>{params.Smobilenumber}</Text>
            </View>
            </View>

            <View style={styles.infoRow}>
            <View style={[styles.iconWrap, { backgroundColor: "#6366f1" }]}>
                <Ionicons name="mail" size={18} color="#fff" />
            </View>
            <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{params.Semail}</Text>
            </View>
            </View>

        </View>

        {/* Receiver */}
        <View style={styles.card}>
            <Text style={styles.sectionHeader}>Receiver</Text>
            <View style={styles.infoRow}>
            <View style={[styles.iconWrap, { backgroundColor: "#059669" }]}>
            <Ionicons name="person" size={18} color="#fff" />
            </View>
            <View style={styles.infoTextWrap}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{params.receivername}</Text>
            </View>
            </View>

            <View style={styles.infoRow}>
            <View style={[styles.iconWrap, { backgroundColor: "#059669" }]}>
            <Ionicons name="call" size={18} color="#fff" />
            </View>
            <View style={styles.infoTextWrap}>
            <Text style={styles.infoLabel}>Mobile Number</Text>
            <Text style={styles.infoValue}>{params.Rmobilenumber}</Text>
            </View>
            </View>

            <View style={styles.infoRow}>
            <View style={[styles.iconWrap, { backgroundColor: "#059669" }]}>
            <Ionicons name="mail" size={18} color="#fff" />
            </View>
            <View style={styles.infoTextWrap}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{params.Remail}</Text>
            </View>
            </View>

        </View>

        {/* Trip / Parcel info */}
        <View style={styles.card}>
            <Text style={styles.sectionHeader}>Shipment</Text>

            <View style={styles.infoRow}>
            <View style={[styles.iconWrap, { backgroundColor: "#ea580c" }]}>
            <Ionicons name="scale" size={18} color="#fff" />
            </View>
            <View style={styles.infoTextWrap}>
            <Text style={styles.infoLabel}>Weight</Text>
            <Text style={styles.infoValue}>{params.weight}</Text>
            </View>
            </View>

            <View style={styles.infoRow}>
            <View style={[styles.iconWrap, { backgroundColor: "#ea580c" }]}>
            <Ionicons name="location" size={18} color="#fff" />
            </View>
            <View style={styles.infoTextWrap}>
            <Text style={styles.infoLabel}>Pickup</Text>
            <Text style={styles.infoValue}>{params.pickup}</Text>
            </View>
            </View>

            <View style={styles.infoRow}>
            <View style={[styles.iconWrap, { backgroundColor: "#ea580c" }]}>
            <Ionicons name="flag" size={18} color="#fff" />
            </View>
            <View style={styles.infoTextWrap}>
            <Text style={styles.infoLabel}>Drop-off</Text>
            <Text style={styles.infoValue}>{params.drop}</Text>
            </View>
            </View>

            <View style={styles.infoRow}>
            <View style={[styles.iconWrap, { backgroundColor: "#ea580c" }]}>
            <Ionicons name="calendar" size={18} color="#fff" />
            </View>
            <View style={styles.infoTextWrap}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{params.date}</Text>
            </View>
            </View>

            <View style={styles.infoRow}>
            <View style={[styles.iconWrap, { backgroundColor: "#ea580c" }]}>
            <Ionicons name="time" size={18} color="#fff" />
            </View>
            <View style={styles.infoTextWrap}>
            <Text style={styles.infoLabel}>Time</Text>
            <Text style={styles.infoValue}>{params.time}</Text>
            </View>
            </View>

            <View style={styles.infoRow}>
            <View style={[styles.iconWrap, { backgroundColor: "#ea580c" }]}>
            <Ionicons name="bus" size={18} color="#fff" />
            </View>
            <View style={styles.infoTextWrap}>
            <Text style={styles.infoLabel}>Bus Number</Text>
            <Text style={styles.infoValue}>{params.Bnumber}</Text>
            </View>
            </View>

            <View style={styles.infoRow}>
            <View style={[styles.iconWrap, { backgroundColor: "#ea580c" }]}>
            <MaterialCommunityIcons name="currency-usd" size={18} color="#fff" />
            </View>
            <View style={styles.infoTextWrap}>
            <Text style={styles.infoLabel}>Total Fare</Text>
            <Text style={styles.infoValue}>Rs.{params.totalFare}</Text>
            </View>
            </View>

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

          

          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("home"); if (isSearching) {
                  setIsSearching(false); 
                }

                else {
                  router.push({
                    pathname: "/passenger/receipt/parcelReceipt",
                    params: {
                      Pid: params.Pid,
                      Pid1: params.Pid1,
                      pfirstName: params.pfirstName,
                      plastName:params.plastName,
                      pemail: params.pemail,
                      pphoneNumber: params.pphoneNumber,

                    },                    
                  });
                };}}>
            <Ionicons name={isSearching ? "arrow-back" : "arrow-back-outline"} size={24} color={activeTab === "home" ? "#0057D9" : "#8A8A8A"}/>
            <Text style={[styles.label1,activeTab === "home" && styles.activeLabel,]}>
              Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("routes"); setIsSearching(!isSearching); }}>
            <FontAwesome name={isSearching ? "close" : "search"} size={24} color={activeTab  === "routes" ? "#0057D9" : "#8A8A8A"}/>
            <Text style={[ styles.label1,activeTab === "routes" && styles.activeLabel,]}>
              Routes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.centerButton} onPress={() => {setActiveTab("tickets"); router.push({
                    pathname: "/passenger/index1",
                    params: {
                        Pid: params.Pid,
                        Pid1: params.Pid1,
                        pfirstName: params.pfirstName,
                        plastName:params.plastName,
                        pemail: params.pemail,
                        pphoneNumber: params.pphoneNumber,
                    },                    
                  });}} > 
            <Ionicons name="home-outline" size={28} color="#fff" />             
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("routes"); router.push("/admin/index1");}}>
            <Ionicons name="notifications-outline" size={24} color={activeTab === "alerts" ? "#0057D9" : "#8A8A8A"}/>
            <Text style={[styles.label1,activeTab === "alerts" && styles.activeLabel, ]}>
              Alerts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => {setActiveTab("profile"); router.push("/admin/index1");}}>
            <Feather name="user" size={24} color={activeTab === "profile" ? "#0057D9" : "#8A8A8A"}/>
            <Text style={[styles.label1, activeTab === "profile" && styles.activeLabel,]}>
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
            
    </SafeAreaView></>
    
  );
};

const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:"#fff"
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

  scroll: { flex: 1,marginTop: -50,  },
  scrollContent: { padding: 16, paddingBottom: 150, gap: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoTextWrap: { flex: 1 },
  infoLabel: { fontSize: 12, color: "#94a3b8", marginBottom: 2 },
  infoValue: { fontSize: 15, color: "#1e293b", fontWeight: "600" },
  
   
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

  searchBarInput: {
    position: "absolute",
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginLeft: 15,
    marginTop: 45,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    width:'90%' 
  },

  subHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
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

export default ParcelService;