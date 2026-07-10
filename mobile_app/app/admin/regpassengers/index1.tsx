import React, { useState, useCallback } from 'react';
import { Stack, useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
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


interface pasenger {
  id:string;
  fullName:string;
  phoneNumber?:string;
  address?:string;
  NIC?:string;
  Birthday?:string;
  gender?:string;
  email?:string;
  password?:string;
}

const BusScreen: React.FC = () => {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [passengerData, setPassengerData] = useState<pasenger[]>([]);

  const loadPassenger = async()=>{
    try{
      const data = await AsyncStorage.getItem("passengers");
      if(data){
        setPassengerData(JSON.parse(data));
      }
      else{
        setPassengerData([]);
      }

    }
    catch(error){
      console.log(error);
    }
  };

  useFocusEffect(useCallback(()=>{loadPassenger();},[]));

  const handleSearch = () => {
    router.push({
      pathname:"/admin/buses/index6"
    });
  };

  const deletePassenger = async(id:string)=>{
    const updated = passengerData.filter(
      item=>item.id !== id
    );
    setPassengerData(updated);
    await AsyncStorage.setItem( "passengers",JSON.stringify(updated));
  };
  
  

  const renderBusItem = ({item}:{item:pasenger}) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/admin/regpassengers/index2",
          params: {
            id: item.id,
            fullName: item.fullName,
            phoneNumber: item.phoneNumber || "",
            address: item.address || "",
            NIC: item.NIC || "",
            Birthday: item.Birthday || "",
            gender: item.gender || "",
            email: item.email || "",
            password: item.password || "",
          },
        })
      }
    >
    <View style={styles.friendRow}>
      <View style={styles.profileCircle}>
        <FontAwesome name="bus"size={14}color="#32CD32"/>
      </View>
      <Text style={styles.friendName}>{item.fullName}</Text>
      <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="location-on" size={32} color="#32CD32"/>    
      </TouchableOpacity>
      <TouchableOpacity onPress={()=>deletePassenger(item.id)}>
        <Ionicons name="trash" size={30} color="red"/>
      </TouchableOpacity>
    </View>
    </TouchableOpacity>
  );

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
              router.push({pathname: "/admin/index1", }); 
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
          <Text style={styles.subHeaderTitle}>Normal Way Buses</Text>
        )}
              
        <TouchableOpacity onPress={() => setIsSearching(!isSearching)}>
          <FontAwesome name={isSearching ? "close" : "search"} size={24} color="#0047AB" />
        </TouchableOpacity>
      </View>

        
      <View style={styles.listContainer}>
        <FlatList
          data={passengerData}
          renderItem={renderBusItem}
          keyExtractor={(item)=>item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 10 }}
          />
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
    backgroundColor: '#FFF' 
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
  
  body: { 
    flex: 1, 
    paddingHorizontal: 20, 
    alignItems: 'center' 
  },
  
  listContainer: {  
    flex: 0.85,
    borderWidth: 0,
    borderColor: '#39FF14',
    borderRadius: 15,
    paddingHorizontal: 15,
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
    marginLeft:10,
    marginRight:10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4, },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  profileCircle: {
    width: 40,
    height: 40,
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

  actionGroup: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },

  iconButton: { 
    marginRight: 10 
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
    width: '120%',
    borderRadius: 100,
    position: 'absolute',  
  },

  greenCurve: {
    backgroundColor: '#0052cc',
    height: 120,
    width: '100%',
    borderRadius: 30,
    position: 'absolute',  
  }
  
});

export default BusScreen;