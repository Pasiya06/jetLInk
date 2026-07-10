import React, { useState } from 'react';
import { Stack,useRouter,useLocalSearchParams} from "expo-router";
import { 
  StyleSheet, 
  View, 
  Text,
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  Image,
  ScrollView 
} from 'react-native';
import { Ionicons, 
  MaterialCommunityIcons, 
  Fontisto, 
  FontAwesome6, 
  MaterialIcons, 
  FontAwesome5, 
  FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ToursScreen: React.FC = () => {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const params = useLocalSearchParams();
  

  return (
    <>
    <Stack.Screen options={{ title: "", headerShown: false }} />
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
              <TouchableOpacity>
                <Ionicons name="menu" size={30} color="#ffffff" />
              </TouchableOpacity>
                      
              <TouchableOpacity >
                <Text style={styles.title}>Jetlink</Text>
              </TouchableOpacity>
                      
              <TouchableOpacity>
                <Ionicons name="notifications" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
                  
            <View style={styles.subHeader}>
              <TouchableOpacity 
                onPress={() => {
                  if (isSearching) {
                    setIsSearching(false); 
                  } 
                  else {
                    router.push({pathname: "/admin/regpassengers/index1", }); 
                  }
                }}
              >
                <Ionicons name={isSearching ? "arrow-back" : "arrow-back-outline"} size={24} color="#0047AB"/>
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
                <Text style={styles.subHeaderTitle}>{params.busNumber}</Text>
              )}
                    
              <TouchableOpacity onPress={() => setIsSearching(!isSearching)}>
                <FontAwesome name={isSearching ? "close" : "search"} size={24} color="#0047AB" />
              </TouchableOpacity>
            </View>

      {/* Main Content Area */}
      <View style={styles.body}>
        
        <View style={styles.container}>
        
                <Text >Full Name: {params.fullName}</Text>
        
                <Text>Phone Number: {params.phoneNumber}</Text>
        
                <Text>
                  Address: {params.address}
                </Text>
        
                <Text>
                 NIC: {params.NIC}
                </Text>
        
                <Text>
                  Birthday: {params.Birthday}
                </Text>
        
                <Text>
                  Gender: {params.gender}
                </Text>
        
                <Text>
                  Email: {params.email}
                </Text>
        
                
        
        
              </View>
        
        
                
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
    justifyContent: 'space-between', 
    paddingTop: 50, 
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

  body: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 15,
    alignItems: 'center',
  },
  
  
  
  
 form:{
   marginTop:-20,
   marginHorizontal:10,
   borderWidth:0,
   borderColor:"#32CD32",
   borderRadius:35,
   padding:10,
   paddingTop:35,
   marginBottom:70,
 },

 label:{
    color:"#0047AB",
    fontSize:14,
    marginBottom: 5,
 },

 inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#32CD32',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 45,
    marginBottom: 15,
  },

  input: {
    flex: 1,
    height: '100%',
    color: '#333',
  },

  inputIcon: {
    fontSize: 18,
    color: '#999',
  },

  searchButton: {
    backgroundColor:'#32CD32',
    borderWidth: 2,
    borderColor: '#32CD32',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 15,
    elevation: 8, 
    
    
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
  },

  searchButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
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
  },

  greenCurve: {
    backgroundColor: '#0052cc',
    height: 100,
    width: '120%',
    borderRadius: 25,
    position: 'absolute',  
  },
  
});

export default ToursScreen;