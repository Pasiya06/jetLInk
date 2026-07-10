import React from 'react';
import  { useState } from 'react';
import { Stack,useRouter,useLocalSearchParams} from "expo-router";
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  Image ,
  TextInput,
} from 'react-native';
import { Ionicons, 
  MaterialCommunityIcons, 
  Fontisto, 
  FontAwesome6, 
  MaterialIcons, 
  FontAwesome5, 
  FontAwesome } from '@expo/vector-icons'; // Standard icon sets

const ParcelService = () => {
    const [isSearching, setIsSearching] = useState<boolean>(false);
      const [searchQuery, setSearchQuery] = useState<string>('');
      const params = useLocalSearchParams();
      const router = useRouter();
      const handleSearch = () => {
      router.push({
          pathname: "/passenger/parcel/index2",
          params:{ 
            Pid: params.Pid,
            Pid1: params.passengerId,
            firstName: params.firstName,
            lastName:params.lastName,
            phoneNumber: params.phoneNumber,
            address: params.address,
            NIC: params.NIC,
            Birthday: params.birthday,
            gender: params.gender,
            email: params.email,

          } 
          
      });
    };
  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
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

      {/* Sub-Header */}
      <View style={styles.subHeader}>
        <TouchableOpacity 
          onPress={() => {
            if (isSearching) {
              setIsSearching(false); // Close search bar if open
            } else {
              

            
              router.back() 
            }
          }}
        >
          <Ionicons 
            name={isSearching ? "arrow-back" : "arrow-back-outline"} 
            size={24} 
            color="#0047AB" 
          />
        </TouchableOpacity>
        
        {isSearching ? (
          <TextInput
            style={styles.searchBarInput}
            placeholder="Search parcel..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
          />
        ) : (
          <Text style={styles.subHeaderTitle}>Parcel Service</Text>
        )}
        
        <TouchableOpacity onPress={() => setIsSearching(!isSearching)}>
          <FontAwesome 
            name={isSearching ? "close" : "search"} 
            size={24} 
            color="#0047AB" 
          />
        </TouchableOpacity>
      </View>
      {/* Content Section */}
      <View style={styles.content}>
        
        {/* Action Buttons */}
        <TouchableOpacity style={styles.card} onPress={handleSearch}>
          <MaterialCommunityIcons name="package-variant-closed" size={50} color="#32CD32" /*style={styles.pvc}*/ />
          <Text style={styles.cardText}>Parcel Booking</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <MaterialCommunityIcons name="map-marker-radius" size={50} color="#FF0000" /*style={styles.mmr}*//>
          <Text style={styles.cardText}>Parcel Tracking</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
        </TouchableOpacity>
      </View>

      {/* Footer / Illustration Section */}
      <View style={styles.footerGraphic}>
        <View style={styles.blueCurve} />
        <View style={styles.greenCurve} />
      </View>
            
    </SafeAreaView></>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
 header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Spaced items
    paddingTop: 50, // Added padding for top status bar area
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 20,
    padding: 5,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '500',
    marginVertical: 30,
    color: '#333',
  },
  card: {
    backgroundColor: '#ffffff',
    width: "100%" ,
    // height: "30%",
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 22,
    borderWidth: 0.5,
    borderColor: '#32CD32',
     //justifyContent: 'space-between',
    
    // Shadow
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardText: {
    paddingHorizontal: 10,
    flex: 1,
    fontSize: 24,
    color: '#0047AB',
    fontWeight: '600',
  },
  footer: {
    height: 250,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  footerCurve: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 10,
    backgroundColor: '#0047AB',
    borderBottomWidth: 5,
    borderBottomColor: '#32CD32',
  },
  busImage: {
    width: '80%',
    height: 150,
    marginBottom: 20,
  },
  searchBarInput: {
  flex: 1,
  height: 40,
  backgroundColor: '#f0f0f0',
  borderRadius: 10,
  marginHorizontal: 15,
  paddingHorizontal: 15,
  fontSize: 16,
  color: '#333',
  },
   subHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0047AB',
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
    // bottom: -40,
    // left: '-10%',
  },
  greenCurve: {
    backgroundColor: '#0052cc',
    height: 100,
    width: '100%',
    borderRadius: 25,
    position: 'absolute',
    // bottom: -60,
    // left: '-10%',
  },
  // pvc: {
  //   backgroundColor: '#FFA500'+ '20',
  //   justifyContent: 'center',
  // },
  // mmr: {
  //   backgroundColor: '#FFA500'+ '20',
  //   justifyContent: 'center',
  // },
});

export default ParcelService;