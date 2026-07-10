import React, { useState } from 'react';
import { Stack,useRouter} from "expo-router";
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';
import { 
  Ionicons, 
  MaterialCommunityIcons, 
  Fontisto, 
  FontAwesome6, 
  MaterialIcons, 
  FontAwesome5, 
  FontAwesome
} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Types for the Toggle Selection


const JetLinkInterface: React.FC = () => {
  
  const [weight, setWeight] = useState<string>('');
  const [pickup, setPickup] = useState<string>('');
  const [drop, setDrop] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const router = useRouter();

  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const handleparcelD = async () => {

  if (!weight || !pickup || !drop) {
    alert("Please fill required fields");
    return;
  }

  try {

    const newBus = {
      id: Date.now().toString(),
      weight,
      pickup,
      drop
    };


    const oldData = await AsyncStorage.getItem("parcelD");

    const parcelD = oldData ? JSON.parse(oldData): [];


    const updatedBuses = [...parcelD,newBus];

    await AsyncStorage.setItem("parcelD",JSON.stringify(updatedBuses));


    alert("Bus Added Successfully");


    router.push("/admin/buses/index2");


  } catch(error){

    console.log(error);

  }

};
  const handleSearch = () => {
    // router.push({
    //     pathname: "/parcel/index3", 
       
    // });
  };

  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0056b3" />
      
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
              setIsSearching(false); 
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
          <Text style={styles.subHeaderTitle}>Package Details</Text>
        )}
        
        <TouchableOpacity onPress={() => setIsSearching(!isSearching)}>
          <FontAwesome 
            name={isSearching ? "close" : "search"} 
            size={24} 
            color="#0047AB" 
          />
        </TouchableOpacity>
      </View>
    

      {/* Main Search Form Container */}
      <View style={styles.formContainer}>
        
        {/* Toggle Buttons */}
        
        {/* Input Fields */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Weight(kg)</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} value={weight} onChangeText={setWeight} />
            
          </View>

          <Text style={styles.label}>Pick up Location</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} value={pickup} onChangeText={setPickup} />
            <Text style={styles.inputIcon}>📍</Text>
          </View>

          <Text style={styles.label}>Delivery Location</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} value={drop} onChangeText={setDrop} />
            <Text style={styles.inputIcon}>📍</Text>
          </View>

          <Text style={styles.label}>Date</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} value={date} placeholder="YYYY-MM-DD" onChangeText={setDate} />
            <Text style={styles.inputIcon}>📅</Text>
          </View>

          <Text style={styles.label}>Time</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} value={time} placeholder="00:00" onChangeText={setTime} />
            <Text style={styles.inputIcon}>🕒</Text>
          </View>
        </View>

        {/* Search Button */}
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
      </View>

      {/* Bottom Graphic Design Element */}
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
    backgroundColor: '#fff',
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
  
  subHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0047AB',
  },
  formContainer: {
    marginHorizontal: 20,
    padding: 5,
    borderWidth: 0,
    borderColor: '#32CD32',
    borderRadius: 25,
    
  },
  toggleWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    color: '#32CD32',
    
  },
  toggleBtn: {
    
    flex: 0.48,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#32CD32',
    borderRadius: 8,
    alignItems: 'center',
    
  },
  activeToggle: {
    backgroundColor: '#32CD32',
    color: '#f1f7ff',
    fontWeight: 'bold',
    
  },
  activetoggleText: {
    
    color: '#e9e9e9',
    fontWeight: 'bold',
  },
  activeToggleText: {
    color: '#FFFFFF', // This makes it white when active
  },
  toggleText: {
    fontSize: 18,
    color: '#0052cc',
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#0052cc',
    fontSize: 16,
    fontWeight: '500',
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
    elevation: 8, 
    
    // iOS
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
    width: '100%',
    borderRadius: 25,
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

export default JetLinkInterface;