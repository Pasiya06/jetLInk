import React, { useState } from 'react';
import { Stack,useRouter} from "expo-router";
import { 
  StyleSheet, 
  View, 
  Text,
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  Image 
} from 'react-native';
import { Ionicons, 
  MaterialCommunityIcons, 
  Fontisto, 
  FontAwesome6, 
  MaterialIcons, 
  FontAwesome5, 
  FontAwesome } from '@expo/vector-icons';

/**
 * Interface for the Tours Screen
 * Using standard React Native and TypeScript
 */
const ToursScreen: React.FC = () => {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  return (
    <>
    <Stack.Screen options={{ title: "", headerShown: false }} />
    <SafeAreaView style={styles.container}>
      {/* Navbar Section */}
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
          <Text style={styles.subHeaderTitle}>Receipts</Text>
        )}
        
        <TouchableOpacity onPress={() => setIsSearching(!isSearching)}>
          <FontAwesome 
            name={isSearching ? "close" : "search"} 
            size={24} 
            color="#0047AB" 
          />
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <View style={styles.body}>
        

        {/* Option 1: Tour Packages */}
        <TouchableOpacity style={styles.menuCard}>
          <MaterialCommunityIcons name="highway" size={33} color="#32CD32" />     
          <Text style={styles.menuLabel}>Parcel</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
        </TouchableOpacity>

        {/* Option 2: Additional Payment */}
        <TouchableOpacity style={styles.menuCard}>
          <FontAwesome name="road" size={33} color="#FFA500" />
          <Text style={styles.menuLabel}>Tour</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
        </TouchableOpacity>
      </View>

      {/* Footer Design */}
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
  body: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 15,
    alignItems: 'center',
  },
  
  
  menuCard: {
    height: 100,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: '#32CD32',
    // Shadow
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  menuLabel: {
    paddingHorizontal: 25,
    fontSize: 21,
    color: '#0047AB',
    fontWeight: '500',
    flex: 1,
  },
  cardIcon: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  footerWrap: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 50,
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
  footerGraphic: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 60,
    overflow: 'hidden',
  },
  blueCurve: {
    backgroundColor: '#0052cc',
    height: 100,
    width: '100%',
    borderRadius: 25,
    position: 'absolute',
    // bottom: -40,
    // left: '-10%',
  },
  greenCurve: {
    backgroundColor: '#0052cc',
    height: 100,
    width: '120%',
    borderRadius: 25,
    position: 'absolute',
    bottom: -60,
    left: '-10%',
  },
  subHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0047AB',
  },
});

export default ToursScreen;