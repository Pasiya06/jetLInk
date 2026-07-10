import React, { useState } from 'react';
import { Stack,useRouter,useLocalSearchParams} from "expo-router";
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  ScrollView 
} from 'react-native';
import { 
  Ionicons, 
  Feather , 
  Fontisto, 
  FontAwesome6, 
  MaterialIcons, 
  FontAwesome5, 
  FontAwesome
} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Types for the Toggle Selection


const JetLinkInterface: React.FC = () => {
  const params = useLocalSearchParams();
  const [sendername, setsendername] = useState(`${params.firstName ?? ""} ${params.lastName ?? ""}`.trim());
  const [Smobilenumber, Ssetmobilenumber] = useState(String(params.phoneNumber || ""));
  const [Semail, SsetEmail] = useState(String(params.email || ""));
  const [receivername, setreceivername] = useState<string>('');
  const [Rmobilenumber, Rsetmobilenumber] = useState<string>('');
  const [Remail, RsetEmail] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [pickup, setPickup] = useState<string>('');
  const [drop, setDrop] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [activeTab, setActiveTab] = useState('');
  
  const router = useRouter();

  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const handlesenderD = async () => {

  if (!sendername || !Smobilenumber || !Semail || !receivername || !Remail || !Rmobilenumber || !weight || !pickup || !drop || !date || !time) {
    alert("Please fill required fields");
    return;
  }

  try {

    const newBus = {
      id: Date.now().toString(),
      sendername,
      Smobilenumber,
      Semail,
      receivername,
      Rmobilenumber,
      Remail,
      weight,
      pickup,
      drop,
      time
    };


    const oldData = await AsyncStorage.getItem("senderD");

    const senderD = oldData ? JSON.parse(oldData): [];


    const updatedBuses = [...senderD,newBus];

    await AsyncStorage.setItem("senderD",JSON.stringify(updatedBuses));


    alert("Bus Added Successfully");


    router.push("/passenger/parcel/index3");


  } catch(error){

    console.log(error);

  }

};
  

  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0056b3" />
      
      {/* Header Section */}
      <View style={styles.header}>
          
          
          <TouchableOpacity><Text style={styles.title}>Jetlink</Text></TouchableOpacity>
          
          
        </View>

      
    

      
      <View style={styles.card}>
        
        

        
        <ScrollView style={styles.svw}>
          <Text style={styles.label}>Sender Name</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} value={sendername} onChangeText={setsendername} />
            
          </View>

          <Text style={styles.label}>Mobile Number</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} value={Smobilenumber} onChangeText={Ssetmobilenumber} />
            
          </View>

          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} value={Semail} onChangeText={SsetEmail} />
            
          </View>

          <Text style={styles.label}>Sender Name</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} value={receivername} onChangeText={setreceivername} />
            
          </View>

          <Text style={styles.label}>Mobile Number</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} value={Rmobilenumber} onChangeText={Rsetmobilenumber} />
            
          </View>

          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} value={Remail} onChangeText={RsetEmail} />
            
          </View>

          <Text style={styles.label}>Weight(kg)</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} value={weight} onChangeText={setWeight} />           
          </View>
          
          <Text style={styles.label}>Pick up Location</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} value={pickup} onChangeText={setPickup} />
            
          </View>
          
          <Text style={styles.label}>Delivery Location</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} value={drop} onChangeText={setDrop} />
            
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
 
        </ScrollView>
        <TouchableOpacity style={styles.searchButton} onPress={handlesenderD}>
            <Text style={styles.searchButtonText}>Next</Text>
        </TouchableOpacity>
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
        
              
              <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("home"); if (isSearching) {
                      setIsSearching(false); 
                    }
        
                    else {
                      router.push({
                        pathname: "/passenger/index1",
                        params: {
                          Aid: params.Aid,
                          firstName: params.firstName,
                          lastName: params.lastName,
                          email: params.email,
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
        
              <TouchableOpacity style={styles.centerButton} onPress={() => {setActiveTab("tickets"); router.push("/admin/index1");}} > 
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

  card: {
    width: '90%',
    flex: 1,
    maxHeight: '68%',
    backgroundColor: '#FFF',
    padding: 24,
    alignItems: 'center',
    marginTop: -50,   
    alignSelf: 'center',
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  svw: {
    width: '100%',
    marginBottom:70,  
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
    position: "absolute",
    bottom: 15,
    left: 10,
    right: 10,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
      
    height: 55,
    backgroundColor: "#32CD32",
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

  searchButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },


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

export default JetLinkInterface;