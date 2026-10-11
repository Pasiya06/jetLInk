import React, { useState } from 'react';
import { Stack,useRouter,useLocalSearchParams} from "expo-router";
import { 
  StyleSheet, 
  View, 
  Text,
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  Image 
} from 'react-native';
import { 
  Ionicons, 
  MaterialCommunityIcons, 
  Feather, 
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  MaterialIcons,
} from '@expo/vector-icons';
  import { LinearGradient } from 'expo-linear-gradient';


const ToursScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  return (
    <>
    <Stack.Screen options={{ title: "", headerShown: false }} />
    <SafeAreaView style={styles.container}>
      {/* Navbar Section */}
      <LinearGradient
        colors={["#173C79","#155B8A","#159B79",]}
          start={{x: 0, y: 0,}}
          end={{x: 1, y: 1,}}
        style={styles.submitGradient1}
      >
        <View style={styles.header}>
   
          <TouchableOpacity >
            <Text style={styles.title}>JetLink</Text>
          </TouchableOpacity>
                  
        </View>
      </LinearGradient>
       
      
        

        {/* Option 1: Tour Packages */}
        <TouchableOpacity 
          style={styles.card } 
          onPress={() =>
            router.push({
              pathname: "/passenger/tours/PackagesScreen1",
              params: {
                Pid: params.Pid,
                Pid1: params.Pid1,
                pfirstName: params.pfirstName,
                plastName:params.plastName,
                pphoneNumber: params.pphoneNumber,
                pemail: params.pemail,
              },
            })
          }
        >
          <View style={[styles.iconWrap, { backgroundColor: "#F59E0B18" }]}>
            <FontAwesome6 name="person-walking-luggage" size={40} color="#F59E0B" />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.text1}>Tour Packages</Text>
            <Text style={styles.text2}>Book your tour packages</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
        </TouchableOpacity>

        {/* Option 2: Additional Payment */}
        <TouchableOpacity style={styles.card1}>
          <View style={[styles.iconWrap, { backgroundColor: "#EF444418" }]}>
            <MaterialIcons name="payment" size={40} color="#EF4444" />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.text1}>Additional payment</Text>
            <Text style={styles.text2}>Pay your aditional payment</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
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
                        pathname: "/passenger/index1",
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
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 20,
    padding: 5,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '500',
    marginVertical: 30,
    color: '#333',
  },
  card: {
    marginLeft: 20,
    marginRight: 20,
    flex: 1,
    maxHeight: '15%',
    backgroundColor: '#FFF',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: -50,   
    alignSelf: 'center',
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  card1: {
    marginLeft: 20,
    marginRight: 20,
    flex: 1,
    maxHeight: '15%',
    backgroundColor: '#FFF',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 30,   
    alignSelf: 'center',
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginLeft: 20,
  },

  cardText: {
    paddingHorizontal: 10,
    flex: 1,
    fontSize: 24,
    color: '#0047AB',
    fontWeight: '600',
  },

  text1:{
    fontSize: 21,
    color: '#000000',
    fontWeight: '600',
  
  },

  text2:{
    fontSize: 14,
    color: '#7b7b7b',
    fontWeight: '600',
  
  },

  footer: {
    height: 250,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  footerCurve: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 10,
    backgroundColor: '#0047AB',
    borderBottomWidth: 5,
    borderBottomColor: '#32CD32',
  },
  busImage: {
    width: '80%',
    height: 150,
    marginBottom: 20,
  },
 
   subHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0047AB',
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

export default ToursScreen;
// import React, { useState } from 'react';
// import { Stack,useRouter} from "expo-router";
// import { 
//   StyleSheet, 
//   View, 
//   Text,
//   TextInput, 
//   TouchableOpacity, 
//   SafeAreaView, 
//   Image 
// } from 'react-native';
// import { Ionicons, 
//   MaterialCommunityIcons, 
//   Fontisto, 
//   FontAwesome6, 
//   MaterialIcons, 
//   FontAwesome5, 
//   FontAwesome } from '@expo/vector-icons';

// /**
//  * Interface for the Tours Screen
//  * Using standard React Native and TypeScript
//  */
// const ToursScreen: React.FC = () => {
//   const router = useRouter();
//   const [isSearching, setIsSearching] = useState<boolean>(false);
//   const [searchQuery, setSearchQuery] = useState<string>('');
  
//   return (
//     <>
//     <Stack.Screen options={{ title: "", headerShown: false }} />
//     <SafeAreaView style={styles.container}>
//       {/* Navbar Section */}
//       <View style={styles.header}>
//           <TouchableOpacity>
//             <Ionicons name="menu" size={30} color="#ffffff" />
//           </TouchableOpacity>
          
//           <TouchableOpacity><Text style={styles.title}>Jetlink</Text></TouchableOpacity>
          
//           <TouchableOpacity>
//             <Ionicons name="notifications" size={24} color="#ffffff" />
//           </TouchableOpacity>
//         </View>

//       {/* Sub-Header */}
//       <View style={styles.subHeader}>
//         <TouchableOpacity 
//           onPress={() => {
//             if (isSearching) {
//               setIsSearching(false); // Close search bar if open
//             } else {
              

            
//               router.back() 
//             }
//           }}
//         >
//           <Ionicons 
//             name={isSearching ? "arrow-back" : "arrow-back-outline"} 
//             size={24} 
//             color="#0047AB" 
//           />
//         </TouchableOpacity>
        
//         {isSearching ? (
//           <TextInput
//             style={styles.searchBarInput}
//             placeholder="Search parcel..."
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//             autoFocus={true}
//           />
//         ) : (
//           <Text style={styles.subHeaderTitle}>Tours</Text>
//         )}
        
//         <TouchableOpacity onPress={() => setIsSearching(!isSearching)}>
//           <FontAwesome 
//             name={isSearching ? "close" : "search"} 
//             size={24} 
//             color="#0047AB" 
//           />
//         </TouchableOpacity>
//       </View>

//       {/* Main Content Area */}
//       <View style={styles.body}>
        

//         {/* Option 1: Tour Packages */}
//         <TouchableOpacity style={styles.menuCard}>
//           <FontAwesome6 name="person-walking-luggage" size={33} color="#32CD32" />
//           <Text style={styles.menuLabel}>Tour Packages</Text>
//           <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
//         </TouchableOpacity>

//         {/* Option 2: Additional Payment */}
//         <TouchableOpacity style={styles.menuCard}>
//           <MaterialIcons name="payment" size={33} color="#FFA500" />
//           <Text style={styles.menuLabel}>Additional payment</Text>
//           <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
//         </TouchableOpacity>
//       </View>

//       {/* Footer Design */}
//       <View style={styles.footerGraphic}>
//                <View style={styles.blueCurve} />
//                <View style={styles.greenCurve} />
//             </View>
//     </SafeAreaView>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//   },
//  header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between', // Spaced items
//     paddingTop: 50, // Added padding for top status bar area
//     paddingHorizontal: 20,
//     paddingBottom: 20,
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
  
//   subHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 20,
//     justifyContent: 'space-between',
//   },
//   body: {
//     flex: 1,
//     paddingHorizontal: 25,
//     paddingTop: 15,
//     alignItems: 'center',
//   },
  
  
//   menuCard: {
//     height: 100,
//     backgroundColor: '#ffffff',
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     borderRadius: 16,
//     marginBottom: 12,
//     borderWidth: 0.5,
//     borderColor: '#32CD32',
//     // Shadow
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//   },
//   menuLabel: {
//     paddingHorizontal: 25,
//     fontSize: 21,
//     color: '#0047AB',
//     fontWeight: '500',
//     flex: 1,
//   },
//   cardIcon: {
//     width: 60,
//     height: 60,
//     resizeMode: 'contain',
//   },
  
  
//   searchBarInput: {
//   flex: 1,
//   height: 40,
//   backgroundColor: '#f0f0f0',
//   borderRadius: 10,
//   marginHorizontal: 15,
//   paddingHorizontal: 15,
//   fontSize: 16,
//   color: '#333',
//   },
//   footerGraphic: {
//     position: 'absolute',
//     bottom: 0,
//     width: '100%',
//     height: 60,
//     overflow: 'hidden',
//   },
//   blueCurve: {
//     backgroundColor: '#0052cc',
//     height: 100,
//     width: '100%',
//     borderRadius: 25,
//     position: 'absolute',
   
//   },
//   greenCurve: {
//     backgroundColor: '#0052cc',
//     height: 100,
//     width: '120%',
//     borderRadius: 25,
//     position: 'absolute',
    
//   },
//   subHeaderTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#0047AB',
//   },
// });

// export default ToursScreen;