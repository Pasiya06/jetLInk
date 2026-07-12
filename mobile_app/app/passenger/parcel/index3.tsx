import React, { useState, useCallback } from 'react';
import { Stack, useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import { getSchedules,  } from "../../../services/scheduleServices";
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  TextInput 
} from 'react-native';
import { 
  Ionicons, 
  Feather, 
  Fontisto, 
  FontAwesome6, 
  MaterialIcons, 
  FontAwesome5, 
  FontAwesome
} from '@expo/vector-icons';



interface Bussched {
  _id:string;
  scheduleId:string;
  busdate:string;
  pickuploca?:string;
  dropoffloca?:string;
  arrivaltime?:string;
  depaturetime?:string;
  stops?:string;
  busNo?:string;
}


const JetLinkInterface: React.FC = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('');
  const [busschedData, setBusschedData] = useState<Bussched[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const loadschedBuses = async () => {
    try {
      const result = await getSchedules();
  
      if (result.success) {
        const filteredSchedules = result.data.filter(
          (schedule: any) => 
            schedule.pickuploca === params.pickup &&
            schedule.dropoffloca === params.drop
            
        );
  
        setBusschedData(filteredSchedules);
      }
    } catch (error) {
      console.log(error);
    }
  };
  
    useFocusEffect(useCallback(()=>{loadschedBuses();},[]));
    
    const renderBusItem = ({item}:{item:Bussched}) => (
      <TouchableOpacity
        onPress={() => 
          router.push({
            pathname: "/passenger/parcel/index4",
            params: {
              Sid: item._id,
              scheduleId: item.scheduleId,
              busdate: item.busdate,
              pickuploca: item.pickuploca || "",
              dropoffloca: item.dropoffloca || "",
              arrivaltime: item.arrivaltime || "",
              depaturetime: item.depaturetime || "",
              stops: item.stops || "",
              bNumber: item.busNo || "",

              Pid: params.Pid,
              Pid1: params.Pid1,
              pfirstName: params.pfirstName,
              plastName:params.plastName,
              sendername:params.sendername,
              Smobilenumber:params.Smobilenumber,
              Semail:params.Semail,
              receivername:params.receivername,
              Rmobilenumber:params.Rmobilenumber,
              Remail:params.Remail,
              weight:params.weight,
              pickup:params.pickup,
              drop:params.drop,
              time:params.time



            },
          })
        }
      >
      <View style={styles.friendRow}>
          <View style={styles.textline10}>
          <View style={styles.textline0}>  
                  <View style={styles.textline1}>
                      <Text style={styles.friendName1}>{item.pickuploca} -  {item.dropoffloca}</Text>
                      <Text style={styles.friendName}>{item.depaturetime}</Text>
                      <Text style={styles.friendName1}>{item.pickuploca}</Text>
                  </View>
  
                  <View style={styles.textline2}>
                      <Text style={styles.friendName1}>{item.busdate}</Text>
                      <Text style={styles.friendName}>{item.arrivaltime}</Text>
                      <Text style={styles.friendName1}>{item.dropoffloca}</Text>
                  </View>
              </View>
              
              
              </View>  
              <Text style={styles.friendName}>Stops:</Text>
              <Text style={styles.friendName}>{item.stops}</Text>
              
          
      </View>
      </TouchableOpacity>
    );
  
    return (
  
      <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <SafeAreaView style={styles.container}>
        
        <View style={styles.header}>
        
          <TouchableOpacity >
            <Text style={styles.title}>JetLink</Text>
          </TouchableOpacity>
                  
        </View>
             
        <View style={styles.card}>
          <FlatList style={styles.svw}
            data={busschedData}
            renderItem={renderBusItem}
            keyExtractor={(item)=>item.scheduleId}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 10 }}
            />
  
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
                        pathname: "/passenger/parcel/index1",
                        params: {
                          Pid: params.Pid,
                          Pid1: params.Pid1,
                          firstName: params.pfirstName,
                          lastName:params.plastName,
                          phoneNumber: params.pphoneNumber,
                          email: params.pemail,
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
    marginBottom:80,
    marginTop: 3, 
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25, 
  },

  friendRow: {
    backgroundColor: '#ffffff',
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

  textline0:{
    flex: 1,
    
    flexDirection: 'row',

  },

  textline10:{
    justifyContent: 'space-between', 
    flexDirection: 'row',

  },

  textline1:{
    
    
    
  },

  textline2:{
    marginLeft: 50, 
    
    
  },

  friendName: {
    //flex: 1,
    // marginLeft: 10,
    fontSize: 14,
    color: '#0047AB',
    fontWeight: '500',
  },

  friendName1: {
    //flex: 1,
    //marginRight: 100,
    fontSize: 14,
    color: '#0047AB',
    fontWeight: '500',
  },


  iconButton: { 
    marginRight: 10 
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