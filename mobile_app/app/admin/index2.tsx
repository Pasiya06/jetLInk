// import React, { useEffect, useRef, useState } from 'react';
// import { Stack, useRouter } from 'expo-router';
// import { Image, StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import API from "../../services/api";
// export const FlatmateLogin: React.FC = () => {
//   const router = useRouter();
//   const [showOtp, setShowOtp] = useState(false);
//   const [busNum, setBusNum] = useState('');
//   const [DNIC, DsetNIC] = useState('');
//   const [CNIC, CsetNIC] = useState('');
//   const [email, setEmail] = useState('');
//   const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
//   const otpInputRefs = useRef<Array<TextInput | null>>([]);

//   await sendOTP({
//     busNum,
//     driverNIC:DNIC,
//     conductorNIC:CNIC,
//     email
// });

//   useEffect(() => {
//     if (showOtp) {
//       const timer = setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
//       return () => clearTimeout(timer);
//     }
//   }, [showOtp]);

//   const sendOtp = async () => {
//     if (!busNum.trim() || !DNIC.trim() || !CNIC.trim() || !email.trim()) {
//       alert('Please fill all fields');
//       return;
//     }

//     try {
//       const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
//       await AsyncStorage.setItem('generatedOtp', otpCode);
//       setOtp(Array(6).fill(''));
//       setShowOtp(true);
//       alert('OTP Sent Successfully');
//     } catch (error) {
//       console.log(error);
//       alert('Failed to send OTP');
//     }
//   };

//   const handleChange = (text: string, index: number) => {
//     const digit = text.replace(/\D/g, '').slice(0, 1);
//     const nextOtp = [...otp];
//     nextOtp[index] = digit;
//     setOtp(nextOtp);

//     if (digit && index < 5) {
//       otpInputRefs.current[index + 1]?.focus();
//     }
//   };

//   const handleBackspace = (key: string, index: number) => {
//     if (key !== 'Backspace') return;

//     const nextOtp = [...otp];

//     if (nextOtp[index] !== '') {
//       nextOtp[index] = '';
//       setOtp(nextOtp);
//       return;
//     }

//     if (index > 0) {
//       nextOtp[index - 1] = '';
//       setOtp(nextOtp);
//       otpInputRefs.current[index - 1]?.focus();
//     }
//   };

//   const verifyOTP = async () => {
//     const code = otp.join('');

//     if (code.length !== 6) {
//       alert('Enter OTP');
//       return;
//     }

//     try {
//       const savedOtp = await AsyncStorage.getItem('generatedOtp');

//       if (code === savedOtp) {
//         await AsyncStorage.removeItem('generatedOtp');
//         alert('OTP Verified');
//         router.replace('/');
//       } else {
//         alert('Invalid OTP');
//       }
//     } catch (error) {
//       console.log(error);
//       alert('OTP verification failed');
//     }
//   };

 

  

//   return (
//     <>
//       <Stack.Screen options={{ title: "", headerShown: false }} />
//       <StatusBar barStyle="light-content" backgroundColor="#7db300" />
//       <SafeAreaView style={styles.container}>
//         <View style={styles.header}>
         
          
//           <TouchableOpacity onPress={() => router.push("/")}>
//             <Text style={styles.title}>Login</Text>
//           </TouchableOpacity>
          
          
//         </View>
        
        
                
              
//                 {!showOtp ? (


//                 <>
//                 <View style={styles.card}>
//                 <View style={styles.formContainer}>
//                     <Text style={styles.inputLabel}>Bus Number</Text>
//                     <View style={styles.inputWrapper1}>
//                     <Image source={require("../../assets/images/icons8-bus-94.png")} style={styles.input3dIcon}/>
//                     <View style={styles.inputInnerWrapper}>
//                         <TextInput style={styles.textInput} value={busNum} onChangeText={setBusNum} placeholder="Bus Number"/>
//                     </View>
//                     </View>

//                     <Text style={styles.inputLabel}>Driver NIC</Text>  
//                     <View style={styles.inputWrapper1}>
//                       <Image source={require("../../assets/images/icons8-loyalty-94.png")} style={styles.input3dIcon} />
//                       <View style={styles.inputInnerWrapper}>
//                         <TextInput
//                           style={styles.textInput}
//                           value={DNIC}
//                           onChangeText={DsetNIC}
//                           placeholder="123456789012"
//                           placeholderTextColor="#A3A3A3"
//                         />
//                         </View>
//                     </View>

//                     <Text style={styles.inputLabel}>Conductor NIC</Text>  
//                     <View style={styles.inputWrapper1}>
//                       <Image source={require("../../assets/images/icons8-loyalty-94.png")} style={styles.input3dIcon} />
//                       <View style={styles.inputInnerWrapper}>
//                         <TextInput
//                             style={styles.textInput}
//                             value={CNIC}
//                             onChangeText={CsetNIC}
//                             placeholder="123456789012"
//                             placeholderTextColor="#A3A3A3"
//                         />
//                       </View>
//                     </View>

//                     <Text style={styles.inputLabel}>Driver or Conductor Email Address</Text>
//                     <View style={styles.inputWrapper1}>
//                       <Image source={require("../../assets/images/icons8-gmail-logo-94.png")} style={styles.input3dIcon} />
//                       <View style={styles.inputInnerWrapper}>
//                         <TextInput
//                           style={styles.textInput}
//                           value={email}
//                           onChangeText={setEmail}
//                           placeholder="ABC@gmail.com"
//                           placeholderTextColor="#A3A3A3"
//                           keyboardType="email-address"
//                           autoCapitalize="none"
//                         />
//                       </View>
//                     </View>
//                     </View>
//                   </View>
//                 </>
//                 ) : (
//                 <>
//                   <View style={styles.card1}>
//                   <View style={styles.formContainer}>
//                     <Text style={styles.inputLabel}>Enter OTP</Text>

//                     <View style={styles.otpContainer}>
//                     {otp.map((digit, index) => (
//                       <TextInput
//                         key={index}
//                         ref={(ref) => {
//                           otpInputRefs.current[index] = ref;
//                         }}
//                         value={digit}
//                         style={styles.otpBox}
//                         keyboardType="number-pad"
//                         maxLength={1}
//                         textContentType="oneTimeCode"
//                         autoComplete="sms-otp"
//                         onChangeText={(text) => handleChange(text, index)}
//                         onKeyPress={({ nativeEvent }) => handleBackspace(nativeEvent.key, index)}
//                       />
//                     ))}
//                     </View>
//                   </View>
//                   </View>
//                 </>
//                 )}
              
              

         

//         <View style={styles.footerContainer}>
            
//             <TouchableOpacity
//                 style={styles.primaryButton}
//                 onPress={() => {
//                     if (!showOtp) {
//                     sendOtp();
//                     } else {
//                     verifyOTP();
//                     }
//                 }}
//                 >
//                 <Text style={styles.primaryButtonText}>
//                     {showOtp ? "Verify OTP" : "Send OTP"}
//                 </Text>
//             </TouchableOpacity>

           
//           </View>

//         <View style={styles.footerGraphic}>
//             <View style={styles.blueCurve} />
//             <View style={styles.greenCurve} />
//         </View>
//       </SafeAreaView>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F9FAFB',  
//   },

//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingTop: 50,
//     paddingHorizontal: 20,
//     paddingBottom: 70,   
//     backgroundColor: '#0047AB',
//     borderBottomLeftRadius: 25,
//     borderBottomRightRadius: 25,
//   },

//   title: {
//     fontSize: 28,
//     fontWeight: '800',
//     color: '#ffffff',
//     letterSpacing: 0.5,  
//   },

//   card: {
//     width: '90%',
//     height: '60%',
//     backgroundColor: '#FFF',
//     //padding: 24,
//     //alignItems: 'center',

//     marginTop: -50,   
//     alignSelf: 'center',

//     borderRadius: 20,
//     elevation: 10,

//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 5,
//     },
//     shadowOpacity: 0.2,
//     shadowRadius: 5,
//   },

//   card1: {
//     width: '90%',
//     height: '25%',
//     backgroundColor: '#FFF',
//     //padding: 24,
//     //alignItems: 'center',

//     marginTop: -50,   
//     alignSelf: 'center',

//     borderRadius: 20,
//     elevation: 10,

//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 5,
//     },
//     shadowOpacity: 0.2,
//     shadowRadius: 5,
//   },
  
 
  
  
  

//   formContainer: {
    
//     marginTop: 34,
//     //marginBottom:70,
//     //width: '90%',  
//   },


//   inputWrapper1: {
//     height: '12%',
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F2F4F5',
//     marginRight: 15,
//     marginLeft: 15,
//     marginBottom: 25,
//     borderLeftWidth: 1,
//     borderWidth: 1,
//     borderColor: '#32CD32',
//     borderRadius: 12,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//   },

//   otpContainer: {
//     width: '100%',
//     flexDirection: "row",
//     justifyContent: "space-between",
    
//     marginBottom: 40,
//     paddingHorizontal: 25,
//     paddingTop: 40,
//   },

//   otpBox: {
//     width: 40,
//     height: 55,
//     borderRadius: 10,
//     backgroundColor: "#F5F5F5",
//     textAlign: "center",
//     fontSize: 28,
//     fontWeight: "700",
//     elevation: 3,
//   },

//   input3dIcon: {
//     marginRight: 12,
//     width:25,
//     height:25
//   },

//   inputInnerWrapper: {
//     flex: 1,
//   },

//   inputLabel: {
//     marginRight: 15,
//     marginLeft: 15,
//     fontSize: 16,
//     color: '#0056b3',
//     fontWeight: '500',
//     marginBottom: 10,
//   },

//   textInput: {
//     fontSize: 16,
//     color: '#0056b3',
//     fontWeight: '500',
//     padding: 0, 
//     marginTop: 2,
//   },

//   footerContainer: {
    
//     marginTop: 'auto', 
//     paddingBottom: 10,
//     marginBottom: 10,
//     marginRight: 15,
//     marginLeft: 15,
//   },

//   primaryButton: {
//     marginBottom: 60,
//     width: '100%',
    
//     backgroundColor: '#32CD32',
//     padding: 14,
//     alignItems: 'center',   
//     alignSelf: 'center',
//     marginTop: 10,
//     borderRadius: 20,
//     elevation: 10,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 5,
//     },
//     shadowOpacity: 0.2,
//     shadowRadius: 5,
//   },

//   primaryButtonText: {
//     color: '#FFF',
//     fontSize: 16,
//     fontWeight: '500',
//   },
  
//   footerGraphic: {
//     position: 'absolute',
//     bottom: 0,
//     width: '100%',
//     height: 45,
//     overflow: 'hidden',
//     marginTop: 22,
//   },

//   blueCurve: {
//     backgroundColor: '#0052cc',
//     width: '100%',
//     borderRadius: 30,
//     position: 'absolute', 
//   },

//   greenCurve: {
//     backgroundColor: '#0052cc',
//     height: 100,
//     width: '100%',
//     borderRadius: 30,
//     position: 'absolute', 
//   },
// });

// export default FlatmateLogin;