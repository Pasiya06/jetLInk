import React, { useEffect, useRef, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { Image, StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, StatusBar, Alert   } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather as Icon, AntDesign, Fontisto, EvilIcons } from '@expo/vector-icons';


const API_URL = process.env.EXPO_PUBLIC_API_URL;
export const FlatmateLogin: React.FC = () => {
  const router = useRouter();
  const [showLogin, setShowOtp] = useState(false);
  const [busNum, setBusNum] = useState('');
  const [DNIC, DsetNIC] = useState('');
  const [CNIC, CsetNIC] = useState('');
  const [password1, setPassword1] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [verifiedCNIC, setVerifiedCNIC] = useState("");
  const [verifiedDNIC, setVerifiedDNIC] = useState("");
  const [verifiedBusno, setVerifiedBusno] = useState("");
  const [dfirstname, setdfirstname] = useState("");
  const [dlastname, setdlastname] = useState("");
  const [dphonenumber, setdphonenumber] = useState("");

  

const verify = async () => {
  try {
    const busResponse = await fetch(`${API_URL}/buses/check/${busNum}`);
    const bus = await busResponse.json();
    if (!bus.exists) {
      alert("Invalid Bus Number");
      return;
    }
     

    setVerifiedBusno(bus.data.busNumber);

    const driverResponse = await fetch(`${API_URL}/drivers/check/${DNIC}`);
    const driver = await driverResponse.json();
    if (!driver.exists) {
      alert("Invalid Driver NIC");
      return;
    }

    setVerifiedDNIC(driver.data.NIC);
    setdfirstname(driver.data.firstName);
    setdlastname(driver.data.lastName);
    setdphonenumber(driver.data.phoneNumber);
  
    const conductorResponse = await fetch(`${API_URL}/conductors/check/${CNIC}`);
    const conductor = await conductorResponse.json();
    if (!conductor.exists) {
      alert("Invalid Conductor NIC");
      return;
    }

    // Store the verified NIC clearly, not conductorId
    setVerifiedCNIC(conductor.data.NIC);

    setShowOtp(true);
  } catch (error) {
    console.log(error);
    alert("Server connection failed");
  }
};





const login = async () => {
  try {

    
    console.log("Sending password:", password1); // is this defined?

    const response = await fetch(`${API_URL}/conductors/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        NIC: verifiedCNIC,
        password: password1,
      }),
    });

    const data = await response.json();
    console.log("Response:", data); 

    if (!data.success) {
      alert(data.message);
      return;
    }
    

    alert("Login Successful");

    
    router.push({
      pathname: "/busStaff/index1",
      params: {
        Cid: data.data._id,
        conductorId: data.data.conductorId,
        conductorNIC:verifiedCNIC,
        cfirstName: data.data.firstName,
        clastName: data.data.lastName,
        cphoneNumber:data.data.phoneNumber,
        driverId:verifiedDNIC,
        dfirstName:dfirstname,
        dlastName:dlastname,
        dphoneNumber:dphonenumber,
        busNo: verifiedBusno,
        
      },
    });
  } catch (error) {
    console.log(error);
    alert("Server Error");
  }
};


  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#7db300" />
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#4B6CF5', '#32CD32']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.submitGradient1}
        >
          <View style={styles.header}>
          
            <TouchableOpacity >
              <Text style={styles.title}>JetLink</Text>
            </TouchableOpacity>
                  
          </View>
        </LinearGradient>
        
        
                
              
                {!showLogin ? (


              <>
              <View style={styles.card}>
                <View style={styles.formContainer}>
                    <Text style={styles.inputLabel}>Bus Number</Text>
                    <View style={styles.inputWrapper1}>
                    <View style={[styles.iconWrap, { backgroundColor: "#FF9F1C1A"  }]}>
                      <Fontisto name="bus" size={18} color="#FF9F1C" />
                    </View>
                    <View style={styles.inputInnerWrapper}>
                      <TextInput 
                        style={styles.textInput} 
                        value={busNum} 
                        onChangeText={setBusNum} 
                        placeholder="Bus Number"
                        placeholderTextColor="#A3A3A3"
                      />
                    </View>
                    </View>

                    <Text style={styles.inputLabel}>Driver NIC</Text>  
                    <View style={styles.inputWrapper1}>
                      <View style={[styles.iconWrap, { backgroundColor: "#38B0001A"  }]}>
                      <AntDesign name="idcard" size={18} color="#38B000" />
                      </View>
                      <View style={styles.inputInnerWrapper}>
                        <TextInput
                          style={styles.textInput}
                          value={DNIC}
                          onChangeText={DsetNIC}
                          placeholder="123456789012"
                          placeholderTextColor="#A3A3A3"
                        />
                        </View>
                    </View>

                    <Text style={styles.inputLabel}>Conductor NIC</Text>  
                    <View style={styles.inputWrapper1}>
                      <View style={[styles.iconWrap, { backgroundColor: "#F725851A"  }]}>
                        <AntDesign name="idcard" size={18} color="#F72585" />
                      </View>
                      <View style={styles.inputInnerWrapper}>
                        <TextInput
                            style={styles.textInput}
                            value={CNIC}
                            onChangeText={CsetNIC}
                            placeholder="123456789012"
                            placeholderTextColor="#A3A3A3"
                        />
                      </View>
                    </View>
                  <View style={styles.footerContainer}>
            
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={showLogin ? login : verify}
                  >
                    <Text style={styles.primaryButtonText}>
                      {showLogin ? "Login" : "Verify"}
                    </Text>
                  </TouchableOpacity>
           
          </View>                  
                    </View>
                  </View>
                  

                </>
                ) : (
                <>
                  <View style={styles.card1}>
                  <View style={styles.formContainer}>
                    <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                <View style={[styles.iconWrap, { backgroundColor: "#FF9F1C1A"  }]}>
                  <EvilIcons name="lock" size={28} color="#FF9F1C" />
                </View>
                    
                <View style={styles.inputInnerWrapper}>
                  <TextInput
                    style={styles.textInput}
                    value={password1}
                    onChangeText={setPassword1}
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
                  </View>
                  <View style={styles.footerContainer}>
            
                    <TouchableOpacity
                      style={styles.primaryButton1}
                      onPress={showLogin ? login : verify}
                    >
                      <Text style={styles.primaryButtonText}>
                        {showLogin ? "Login" : "Verify"}
                      </Text>
                    </TouchableOpacity>
           
          </View>
                  </View>
                </>
                )}
              
              

         

  

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
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',  
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
    height: '50%',
    backgroundColor: '#FFF',
    //padding: 24,
    //alignItems: 'center',

    marginTop: -50,   
    alignSelf: 'center',

    borderRadius: 20,
    elevation: 10,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  card1: {
    width: '90%',
    height: '25%',
    backgroundColor: '#FFF',
    //padding: 24,
    //alignItems: 'center',

    marginTop: -50,   
    alignSelf: 'center',

    borderRadius: 20,
    elevation: 10,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  
  eyeIcon: {
    padding: 4,
  },
 
  
  
  

  formContainer: {
    
    marginTop: 34,
    //marginBottom:70,
    //width: '90%',  
  },


  inputWrapper1: {
    height: '13%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F4F5',
    marginRight: 15,
    marginLeft: 15,
    marginBottom: 25,
    borderLeftWidth: 1,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  inputWrapper: {
    height: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F4F5',
    marginRight: 15,
    marginLeft: 15,
    
    borderLeftWidth: 1,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  otpContainer: {
    width: '100%',
    flexDirection: "row",
    justifyContent: "space-between",
    
    marginBottom: 40,
    paddingHorizontal: 25,
    paddingTop: 40,
  },

  otpBox: {
    width: 40,
    height: 55,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    textAlign: "center",
    fontSize: 28,
    fontWeight: "700",
    elevation: 3,
  },

  input3dIcon: {
    marginRight: 12,
    width:25,
    height:25
  },

  inputInnerWrapper: {
    flex: 1,
  },

  inputLabel: {
    marginRight: 15,
    marginLeft: 15,
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
    marginBottom: 10,
  },

  textInput: {
    
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
    padding: 0, 
    marginTop: 2,
  },

  footerContainer: {
    
    marginTop: 'auto', 
    paddingBottom: 10,
    //marginBottom: 10,
    marginRight: 15,
    marginLeft: 15,
  },

  primaryButton: {
    //marginBottom: 60,
    width: '100%',
    
    backgroundColor: '#32CD32',
    padding: 14,
    alignItems: 'center',   
    alignSelf: 'center',
    marginBottom: 2,
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  primaryButton1: {
    
    width: '100%',
    marginBottom: 10,
    backgroundColor: '#32CD32',
    padding: 14,
    alignItems: 'center',   
    alignSelf: 'center',
    //marginTop: 10,
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
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

export default FlatmateLogin;