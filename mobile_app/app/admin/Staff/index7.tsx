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
  Feather, 
  FontAwesome6, 
  Feather as Icon, 
  FontAwesome5, 
  FontAwesome } from '@expo/vector-icons';
import { updateConductor } from "../../../services/conductorService";
import DateTimePicker from '@react-native-community/datetimepicker';

const driverScreen: React.FC = () => {
    const params = useLocalSearchParams();
    const [firstName, setFirstName] = useState(String(params.cfirstName || ""));
    const [lastName, setLastName] = useState(String(params.clastName || ""));
    const [phoneNumber, setPhoneNumber] = useState(String(params.phoneNumber || ""));
    const [address, setAddress] = useState(String(params.address || ""));
    const [NIC, setNIC] = useState(String(params.NIC || ""));
    const [Birthday, setBirthday] = useState(String(params.Birthday || ""));
    const [showCalendar, setShowCalendar] = useState<boolean>(false);
    const [date, setDate] = useState(new Date());
    const [email, setEmail] = useState(String(params.cemail || ""));
    const [password, setPassword] = useState(String(params.password || "")); 
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState(''); 
    const router = useRouter();
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    
    
  
    const handleConductorUpdate = async () => {

    try{

        await updateConductor(params.Cid as string,{
            firstName,
            lastName,
            phoneNumber,
            address,
            NIC,
            Birthday,
            email,
            password,
        });

        alert("Updated Successfully");

        router.push({
              pathname: "/admin/Staff/index5",
              params: {

                Aid: params.Aid,
                firstName: params.firstName,
                lastName: params.lastName,
                email: params.email,
              },
            });

    }
    catch(err){

        alert("Update Failed");

    }

}

  return (
    <>
    <Stack.Screen options={{ title: "", headerShown: false }} />
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
              
                      
              <TouchableOpacity >
                <Text style={styles.title}>{params.cfirstName} {params.clastName}</Text>
              </TouchableOpacity>
                      
    
            </View>
            

      <View style={styles.card}>
        <ScrollView style={styles.svw} >
            
              
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
                      onChangeText={setAddress}
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
                      onChangeText={setEmail}
                      placeholder="ABC@gmail.com"
                      placeholderTextColor="#A3A3A3"
                      keyboardType="email-address"
                      autoCapitalize="none"
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
        <TouchableOpacity style={styles.searchButton} onPress={handleConductorUpdate}>
          <Text style={styles.searchButtonText}>Update Driver</Text>
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
                pathname: "/admin/Staff/index5",
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

  svw: {
    width: '100%',
    marginBottom:70,  
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

export default driverScreen;