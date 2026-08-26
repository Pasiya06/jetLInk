import React, { useEffect, useRef, useState } from 'react';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, StatusBar, Alert, BackHandler    } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather as Icon, AntDesign, Fontisto, Ionicons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const FlatmateLogin: React.FC = () => {
  const router = useRouter();
  const [busNum, setBusNum] = useState('');
  const [DNIC, DsetNIC] = useState('');
  const [CNIC, CsetNIC] = useState('');
  const [verifiedCNIC, setVerifiedCNIC] = useState("");
  const [verifiedDNIC, setVerifiedDNIC] = useState("");
  const [verifiedBusno, setVerifiedBusno] = useState("");
  const [dfirstname, setdfirstname] = useState("");
  const [dlastname, setdlastname] = useState("");
  const [dphonenumber, setdphonenumber] = useState("");
  const [cfirstname, setcfirstname] = useState("");
  const [clastname, setclastname] = useState("");
  const [cphonenumber, setcphonenumber] = useState("");
  const [cemail, setcemail] = useState("");
  const params = useLocalSearchParams();
  

  const handleBusNumber = (text: string) => {
    let value = text.toUpperCase();
    // Remove spaces
    text = text.replace(/\s/g, "");

    // Keep only letters and numbers
    text = text.replace(/[^a-zA-Z0-9]/g, "");

    // Format as HH-8888
    if (text.length > 2) {
      text = text.slice(0, 2) + "-" + text.slice(2, 6);
    }

    setBusNum(text);
  };

  useEffect(() => {
    const backAction = () => {
      router.replace("/passenger/selectScreen"); // Navigate to a specific path
      return true; // Prevent default back behavior
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => subscription.remove();
  }, []);

  

const verify = async () => {
  try {
    const busResponse = await fetch(`${API_URL}/buses/check/${busNum}`);
    const bus = await busResponse.json();
    if (!bus.exists) {
      alert("Invalid Bus Number");
      return;
    }
     
    setVerifiedBusno(bus.data.busNumber);

    const dResponse = await fetch(`${API_URL}/buses/check1/${DNIC}`);
    const d = await dResponse.json();
    if (d.exists) {
      alert("Driver login with another bus");
      return;
    }

    const cResponse = await fetch(`${API_URL}/buses/check2/${CNIC}`);
    const c = await cResponse.json();
    if (c.exists) {
      alert("Conductor login with another bus");
      return;
    }

    const driverResponse = await fetch(`${API_URL}/drivers/check/${DNIC}`);
    const driver = await driverResponse.json();
    if (!driver.exists) {
      alert(driver.message || "Invalid Driver NIC");
      return;
    }

    setVerifiedDNIC(driver.data.NIC);
    setdfirstname(driver.data.firstName);
    setdlastname(driver.data.lastName);
    setdphonenumber(driver.data.phoneNumber);
  
    const conductorResponse = await fetch(`${API_URL}/conductors/check/${CNIC}`);
    const conductor = await conductorResponse.json();
    if (!conductor.exists) {
      alert(conductor.message ||"Invalid Conductor NIC");
      return;
    }

    setVerifiedCNIC(conductor.data.NIC);
    setcfirstname(conductor.data.firstName);
    setclastname(conductor.data.lastName);
    setcphonenumber(conductor.data.phoneNumber);
    setcemail(conductor.data.email);

    router.push({
      pathname: "/busStaff/otpLogin",
      params: {
        conductorNIC:conductor.data.NIC,
        cfirstName:conductor.data.firstName,
        clastName:conductor.data.lastName,
        cphoneNumber:conductor.data.phoneNumber,
        cemail:conductor.data.email,
        driverId:driver.data.NIC,
        dfirstName:driver.data.firstName,
        dlastName:driver.data.lastName,
        dphoneNumber:driver.data.phoneNumber,
        busNo:bus.data.busNumber
        
      },
    });
    

  } 
  
  catch (error) {
    console.log(error);
    alert("Server connection failed");
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
                  onChangeText={handleBusNumber} 
                  placeholder="Bus Number"
                  placeholderTextColor="#A3A3A3"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={7}
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
                onPress={verify}
              >
                <Text style={styles.primaryButtonText}>
                  Verify
                </Text>
              </TouchableOpacity>
        
            </View>                  
          </View>
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

  otpcard: {
    marginTop: -28,
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  otplabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
    textAlign: "center",
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  otpBox: {
    width: 46,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E2E6F0",
    backgroundColor: "#F8F9FC",
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
  },
  otpBoxFilled: {
    borderColor: "#4C6FFF",
    backgroundColor: "#EEF1FF",
  },
  otpBoxError: {
    borderColor: "#E4453A",
    backgroundColor: "#FDEEEE",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    gap: 6,
  },
  errorText: {
    color: "#E4453A",
    fontSize: 13,
    fontWeight: "500",
  },
  verifyButton: {
    marginTop: 24,
    backgroundColor: "#32CD32",
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#32CD32",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  verifyButtonDisabled: {
    backgroundColor: "#70e070",
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  resendText: {
    color: "#6B7280",
    fontSize: 13,
  },
  resendLink: {
    color: "#3454E8",
    fontSize: 13,
    fontWeight: "700",
  },
  resendLinkDisabled: {
    color: "#A5AEC7",
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

export default FlatmateLogin;