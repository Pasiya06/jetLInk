import React, { useState } from 'react';
import { Stack,useRouter,useLocalSearchParams} from "expo-router";
import { 
  Alert ,
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
  FontAwesome,
  FontAwesome5
} from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';


const JetLinkInterface: React.FC = () => {
  const params = useLocalSearchParams();
  const [sendername, setsendername] = useState(`${params.pfirstName ?? ""} ${params.plastName ?? ""}`.trim());
  const [smobilenumber, Ssetmobilenumber] = useState(String(params.pphoneNumber || params.smobilenumber || ""));
  const [receivername, setreceivername] = useState(String(params.receivername || ""));
  const [rmobilenumber, Rsetmobilenumber] = useState(String(params.rmobilenumber || ""));
  const [remail, RsetEmail] = useState(String(params.remail || ""));
  const [weight, setWeight] = useState(String(params.weight || ""));
  const [pickup, setPickup] = useState(String(params.pickup || ""));
  const [drop, setDrop] = useState(String(params.drop || ""));
  const [date, setDate] = useState(String(params.date || ""));
  const [date1, setdate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [activeTab, setActiveTab] = useState('');
  
  const router = useRouter();


  const onTimeChange = (event: any, selected?: Date) => {
  setShowTimePicker(false);

  if (selected) {
    setTime(selected);

    const formatted = selected.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setSelectedTime(formatted);
  }
};

  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const handlesenderD = async () => {

  if (!sendername || !smobilenumber  || !receivername || !remail || !rmobilenumber || !weight || !pickup || !drop ) {
    alert("Please fill required fields");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(remail)) {
        Alert.alert("Invalid Receiver Email", "Please enter a valid email address.");
        return false;
      }
  const phoneRegex = /^[0-9]{10}$/;

  if (!phoneRegex.test(smobilenumber)) {
    Alert.alert(
      "Invalid Sender Phone Number",
      "Phone number must contain exactly 10 digits."
    );
    return false;
  }

  if (!phoneRegex.test(rmobilenumber)) {
    Alert.alert(
      "Invalid Receiver Phone Number",
      "Phone number must contain exactly 10 digits."
    );
    return false;
  }


  try {

    router.push({
          pathname: "/passenger/parcel/index3",
          params:{ 
            Pid: params.Pid,
            Pid1: params.Pid1,
            pfirstName: params.pfirstName,
            plastName:params.plastName,
            pphoneNumber: params.pphoneNumber,
            pemail: params.pemail,
            sendername,
            smobilenumber,
            semail:params.pemail,
            receivername,
            rmobilenumber,
            remail,
            weight,
            pickup,
            drop,
            date,
            //time:selectedTime
          } 
          
      });


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
      <LinearGradient
          colors={["#173C79","#155B8A","#159B79",]}
          start={{x: 0, y: 0,}}
          end={{x: 1, y: 1,}}
          style={styles.submitGradient1}
        >
              <View style={styles.header}>
                  
              
                <TouchableOpacity >
                  <Text style={styles.title}>Book Parcel</Text>
                </TouchableOpacity>
                       
              </View>
              </LinearGradient> 

      
    

      
      <View style={styles.card}>
        
        

        
        <ScrollView style={styles.svw}>
          <Text style={styles.label}>Sender Name</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} value={sendername} onChangeText={setsendername} />
            
          </View>

          <Text style={styles.label}>Sender Mobile Number</Text>
          <View style={styles.inputWrapper}>
            <TextInput 
              style={styles.input} 
              value={smobilenumber} 
              onChangeText={Ssetmobilenumber} 
              keyboardType="phone-pad" 
              maxLength={10}/>
            
          </View>

          <Text style={styles.label}>Sender Email</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.input1}>{params.pemail}</Text>
            
          </View>

          <Text style={styles.label}>Receiver Name</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} value={receivername} onChangeText={setreceivername} />
            
          </View>

          <Text style={styles.label}>Receiver Mobile Number</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} value={rmobilenumber} onChangeText={Rsetmobilenumber} keyboardType="phone-pad" maxLength={10}/>
            
          </View>

          <Text style={styles.label}>Receiver Email</Text>
          <View style={styles.inputWrapper}>
            <TextInput 
              style={styles.input} 
              value={remail} 
              onChangeText={(text) => RsetEmail(text.replace(/\s/g, "").toLowerCase())} 
              autoCapitalize="none"
              autoCorrect={false}
            />
            
          </View>

          <Text style={styles.label}>Weight(kg)</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="phone-pad" maxLength={2} />           
          </View>
          
          <Text style={styles.label}>Pick up Location</Text>
          <View style={styles.inputWrapper}>
            <TextInput 
              style={styles.input} 
              value={pickup}  
              onChangeText={(text) => setPickup(text.replace(/\s/g, "").toUpperCase())}
              autoCapitalize="characters"
              autoCorrect={false}
              />
          </View>
          
          <Text style={styles.label}>Delivery Location</Text>
          <View style={styles.inputWrapper}>
            <TextInput 
              style={styles.input} 
              value={drop} 
              onChangeText={(text) => setDrop(text.replace(/\s/g, "").toUpperCase())}
              autoCapitalize="characters"
              autoCorrect={false} 
            />
            
          </View>
          
           <Text style={styles.label}>Date</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} value={date} placeholder="YYYY-MM-DD" onChangeText={setDate} />
            <TouchableOpacity onPress={() => setShowCalendar(true)}>
              <FontAwesome5 name="calendar-alt" size={24} color="black" />  
            </TouchableOpacity>
          </View>

          {showCalendar && (
            <DateTimePicker
              value={date1 || new Date()}
              mode="date"
              display="default"
              minimumDate={new Date()}   // Cannot select a date before today
              onChange={(event, selectedDate) => {
                setShowCalendar(false);

                if (selectedDate) {
                  setdate(selectedDate);
                  setDate(selectedDate.toLocaleDateString());
                }
              }}
            />
          )}
          {/*<Text style={styles.label}>Time</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input}
              
              value={selectedTime}
              placeholder="00:00"
              editable={false}
            />

            <TouchableOpacity onPress={() => setShowTimePicker(true)}>
              <Ionicons name="time-outline" size={24} color="black" />
            </TouchableOpacity>
          </View> 

          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="default"
              onChange={onTimeChange}
            />
          )}                    */}
 
        </ScrollView>
        
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handlesenderD}>
        <LinearGradient
            colors={["#173C79","#155B8A","#159B79",]}
            start={{x: 0, y: 0,}}
            end={{x: 1, y: 1,}}
            style={styles.submitGradient}
        >
        <Text style={styles.submitText}>Next</Text>
        </LinearGradient>
    </TouchableOpacity>

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
                        pathname: "/passenger/parcel/index1",
                        params: {
                          Pid: params.Pid,
                          Pid1: params.Pid1,
                          pfirstName: params.pfirstName,
                          plastName:params.plastName,
                          pphoneNumber: params.pphoneNumber,
                          pemail: params.pemail,
                          
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
                          pphoneNumber: params.pphoneNumber,
                          pemail: params.pemail,
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

      {/* Bottom Graphic Design Element */}
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

  card: {
    width: '90%',
    flex: 1,
    maxHeight: '60%',
    backgroundColor: '#FFF',
    padding: 15,
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
      
  },

  label: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    backgroundColor: '#F2F4F5',
    borderColor: '#ECEEF2',
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

  input1: {
    flex: 1,
    height: '100%',
    color: '#333',
    marginTop:20,
  },

  inputIcon: {
    fontSize: 18,
    color: '#999',
  },
  
  submitButton: {
    
    justifyContent: "space-around",
    marginLeft: 20,
    marginRight: 20,  
    height: 55,
    overflow: 'hidden',
    borderRadius: 25,
    marginTop: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    elevation: 10,
  },

   submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
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

export default JetLinkInterface;