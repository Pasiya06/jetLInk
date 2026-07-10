import React, { useState } from 'react';
import { Stack,useRouter} from "expo-router";
import {
  StyleSheet,
  View,
  Text,
  TextInput, 
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import {Ionicons, 
  MaterialCommunityIcons, 
  Fontisto, 
  FontAwesome6, 
  MaterialIcons, 
  FontAwesome5, 
  FontAwesome} from '@expo/vector-icons';

// Define the shape of a friend object
interface Friend {
  id: string;
  name: string;
}

const FriendsScreen: React.FC = () => {
  const router = useRouter(); 
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Mock data based on your screenshot
  const friendsData: Friend[] = Array(6).fill({ id: '', name: 'Pasindu Sandakelum' }).map((item, index) => ({
    ...item,
    id: index.toString(),
  }));

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <TouchableOpacity>
    <View style={styles.friendRow}>
      {/* Profile Icon */}
      <View style={styles.profileCircle}>
        <FontAwesome name="user-o" size={20} color="#32CD32" />
      </View>

      {/* Name */}
      <Text style={styles.friendName}>{item.name}</Text>

      {/* Action Icons */}
      <View style={styles.actionGroup}>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialCommunityIcons name="email-outline" size={24} color="#FFA500" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="trash" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View></TouchableOpacity>
  );

  return (

    <>
    <Stack.Screen options={{ title: "", headerShown: false }} />
    <SafeAreaView style={styles.container}>
      {/* Header */}
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
                  placeholder="Search routes..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus={true}
                />
              ) : (
                <Text style={styles.subHeaderTitle}>Friends</Text>
              )}
              
              <TouchableOpacity onPress={() => setIsSearching(!isSearching)}>
                <FontAwesome 
                  name={isSearching ? "close" : "search"} 
                  size={24} 
                  color="#0047AB" 
                />
              </TouchableOpacity>
            </View>

        {/* Outer Green Border Container */}
        <View style={styles.listContainer}>
          <FlatList
            data={friendsData}
            renderItem={renderFriendItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 10 }}
          />
        </View>
      

      {/* Footer Branding */}
      <View style={styles.footerGraphic}>
        <View style={styles.blueCurve} />
        <View style={styles.greenCurve} />
      </View>
    </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
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
  subHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0047AB',
  },

  
  body: { flex: 1, paddingHorizontal: 20, alignItems: 'center' },
  
  
  listContainer: {
    width: '100%',
    flex: 0.85,
    borderWidth: 0,
    borderColor: '#39FF14',
    borderRadius: 15,
    paddingHorizontal: 15,
    // Add this to ensure shadows on the edges aren't clipped
    paddingTop: 5, 
  },
  friendRow: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: '#32CD32',
    elevation: 3, 
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  profileCircle: {
    width: 35,
    height: 35,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#32CD32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendName: {
    flex: 1,
    marginLeft: 10,
    fontSize: 18,
    color: '#0047AB',
    fontWeight: '500',
  },
  actionGroup: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { marginLeft: 10 },
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
    width: '120%',
    borderRadius: 100,
    position: 'absolute',
    bottom: -40,
    left: '-10%',
  },
  greenCurve: {
    backgroundColor: '#0052cc',
    height: 120,
    width: '100%',
    borderRadius: 30,
    position: 'absolute',
    // bottom: -60,
    // left: '-10%',
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
});

export default FriendsScreen;