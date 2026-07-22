import React, { useState } from "react";
import { Image } from 'react-native';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
   SafeAreaView,
  ScrollView
} from "react-native";

import {  } from "react-native-safe-area-context";
import { Stack,useRouter,useLocalSearchParams } from "expo-router";
import { Ionicons, FontAwesome, FontAwesome5, Feather, Feather as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addDriver } from "../../../services/driverService";





const AddBus = () => {
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAdress] = useState("");
  const [NIC, setNIC] = useState("");
  const [drivingLicense, setdrivingLicense] = useState("");
  const [Birthday, setBirthday] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [date, setDate] = useState(new Date());
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('');
  const params = useLocalSearchParams();
  const router = useRouter();
  

  const handleAddBus = async () => {

  if (!firstName || !lastName || !phoneNumber) {
    alert("Please fill required fields");
    return;
  }

  try {

    const data = await addDriver({
      firstName,
      lastName,
      phoneNumber,
      address,
      NIC,
      drivingLicense,
      Birthday,
      email,
      password,
    });

    if (data.success) {

      alert("Driver Added Successfully");

      router.push({
        pathname: "/admin/Staff/index2",
        params: {
          Aid: params.Aid,
          firstName: params.firstName,
          lastName: params.lastName,
          email: params.email,
        },
      });

    } else {

      alert(data.message);

    }

  } catch (err) {

    alert("Server Connection Failed");

  }

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
          <TouchableOpacity>
            <Text style={styles.title}>Drivers</Text>
            </TouchableOpacity>
      </View>
      </LinearGradient>
    
      <View style={styles.card}>

        <ScrollView style={styles.svw}>           
              
            <Text style={styles.inputLabel}>First Name</Text>  
                <View style={styles.inputWrapper}>
                  
                  <View style={styles.inputInnerWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder="Deshith"
                      placeholderTextColor="#A3A3A3"
                    />
                  </View>
                </View>

                <Text style={styles.inputLabel}>Last Name</Text>  
                <View style={styles.inputWrapper}>
                  
                  <View style={styles.inputInnerWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Sandakelum"
                      placeholderTextColor="#A3A3A3"
                    />
                  </View>
                </View>

                <Text style={styles.inputLabel}>Phone Number</Text>  
                <View style={styles.inputWrapper}>
                  
                  <View style={styles.inputInnerWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      placeholder="077 1234567"
                      placeholderTextColor="#A3A3A3"
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                <Text style={styles.inputLabel}>Address</Text>  
                <View style={styles.inputWrapper}>
                  
                  <View style={styles.inputInnerWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={address}
                      onChangeText={setAdress}
                      placeholder="15/2 Galle road, Colombo"
                      placeholderTextColor="#A3A3A3"
                    />
                  </View>
                </View>

                <Text style={styles.inputLabel}>NIC</Text>  
                <View style={styles.inputWrapper}>
                  
                  <View style={styles.inputInnerWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={NIC}
                      onChangeText={setNIC}
                      placeholder="123456789012"
                      placeholderTextColor="#A3A3A3"
                    />
                  </View>
                </View>

                <Text style={styles.inputLabel}>Driving License</Text>  
                <View style={styles.inputWrapper}>
                  
                  <View style={styles.inputInnerWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={drivingLicense}
                      onChangeText={setdrivingLicense}
                      placeholder="123456789012"
                      placeholderTextColor="#A3A3A3"
                    />
                  </View>
                </View>

                <Text style={styles.inputLabel}>Birth Day</Text>                
                <View style={styles.inputWrapper}>
                  
                  <View style={styles.inputInnerWrapper}>
                    <Text style={[styles.textInputG, Birthday ? { color: "#0056b3" } : null]}>{Birthday || "DD-MM-YYYY"}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowCalendar(true)}>
                    <FontAwesome5 name="calendar-alt" size={24} color="black" />  
                  </TouchableOpacity>
                </View>

                {showCalendar && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowCalendar(false);
                      if (selectedDate) {
                        setDate(selectedDate);
                        setBirthday(selectedDate.toLocaleDateString());
                      }
                    }}
                  />
                )}

                

                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  
                  <View style={styles.inputInnerWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={email}
                      placeholder="ABC@gmail.com"
                      placeholderTextColor="#A3A3A3"
                      keyboardType="email-address"
                      onChangeText={(text) => setEmail(text.replace(/\s/g, "").toLowerCase())} 
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                  
                  <View style={styles.inputInnerWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Abc@123"
                      placeholderTextColor="#A3A3A3"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                  </View>
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Icon name={showPassword ? 'eye' : 'eye-off'} size={20} color="#000000" />
                  </TouchableOpacity>
                </View> 
      
        </ScrollView>

    </View>

    <TouchableOpacity style={styles.searchButton} onPress={handleAddBus }>
        <LinearGradient
          colors={['#4B6CF5', '#32CD32']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.submitGradient}
        >
        <Text style={styles.searchButtonText}>Add Driver</Text>
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
                pathname: "/admin/Staff/index2",
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
     
  },

  
  inputWrapper: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F4F5',
    borderWidth: 1,
    borderColor: '#32CD32',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 15,
  },
  input3dIcon: {
    marginRight: 12,
    width: 25,
    height: 25
  },
  input3dIcon1: {
    marginRight: -4,
    width: 25,
    height: 25
  },
  inputInnerWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    color: '#0056b3',
    fontWeight: '500',
    marginBottom: 10,
  },
  textInput: {
    fontSize: 16,
    color: '#0056b3',
    fontWeight: '500',
    padding: 0, 
  },
  textInputG: {
    fontSize: 16,
    color: '#A3A3A3',
    fontWeight: '500',
    padding: 0, 
  },
  eyeIcon: {
    padding: 4,
  },
  underIcon: {
    marginRight: -11,   
  },

  label:{
    color:"#0047AB",
    fontSize:14,
    marginBottom: 5,
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


export default AddBus;