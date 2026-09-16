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
import { LinearGradient } from 'expo-linear-gradient';



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
              pphoneNumber: params.pphoneNumber,
              pemail: params.pemail,
              sendername:params.sendername,
              smobilenumber:params.smobilenumber,
              semail:params.semail,
              receivername:params.receivername,
              rmobilenumber:params.rmobilenumber,
              remail:params.remail,
              weight:params.weight,
              pickup:params.pickup,
              drop:params.drop,
              date:params.date,
              //time:params.time



            },
          })
        }
      >
      <View style={styles.friendRow}>
        <View style={styles.topRow}>
          <View style={styles.busNoPill}>
            <Ionicons name="bus" size={14} color="#4B7BEC" />
            <Text style={styles.busNoText}>{item.busNo}</Text>
          </View>
          <Text style={styles.dateText}>{params.date}</Text>
        </View>
  
        {/* Route visual */}
        <View style={styles.routeRow}>
          <View style={styles.routeLine}>
            <View style={styles.dotFilled} />
            <View style={styles.connector} />
            <View style={styles.dotOutline} />
          </View>
  
          <View style={styles.routeDetails}>
            <View style={styles.routeStop}>
              <Text style={styles.locationText}>{item.pickuploca}</Text>
              <Text style={styles.timeText}>{item.depaturetime}</Text>
            </View>
  
            <View style={[styles.routeStop, { marginTop: 22 }]}>
              <Text style={styles.locationText}>{item.dropoffloca}</Text>
              <Text style={styles.timeText}>{item.arrivaltime}</Text>
            </View>
          </View>
        </View>
  
        {/* Stops row */}
        <View style={styles.infoRow}>
          <View style={styles.iconWrap}>
            <Ionicons name="location-outline" size={16} color="#4B7BEC" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>Stops</Text>
            <Text style={styles.infoValue}>{item.stops}</Text>
          </View>
        </View>
      </View>
      </TouchableOpacity>
    );
  
    return (
  
      <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <SafeAreaView style={styles.container}>
        
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
             
        <View style={styles.card}>
          <Text style={styles.cardtitle}>Select a route for booking</Text>
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
                        pathname: "/passenger/parcel/index2",
                        params: {
                          Pid: params.Pid,
                          Pid1: params.Pid1,
                          pfirstName: params.pfirstName,
                          plastName:params.plastName,
                          pphoneNumber: params.pphoneNumber,
                          pemail: params.pemail,
                          sendername:params.sendername,
                          smobilenumber:params.smobilenumber,
                          semail:params.semail,
                          receivername:params.receivername,
                          rmobilenumber:params.rmobilenumber,
                          remail:params.remail,
                          weight:params.weight,
                          pickup:params.pickup,
                          drop:params.drop,
                          date:params.date,
                          time:params.time
                                      
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
    borderTopLeftRadius: 55,
    borderTopRightRadius: 55,
    width: '100%',
    flex: 1,
    maxHeight: '70%',
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -50,   
    alignSelf: 'center',
  },

  cardtitle:{
    marginTop:10,
    fontSize: 20,
    fontWeight: '800',
    color: '#999797',
    letterSpacing: 0.5,
  },


  svw: {
    width: '100%',
    marginBottom:80,
    marginTop: 3, 
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25, 
  },

  friendRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  busNoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF1FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  busNoText: {
    color: '#4B7BEC',
    fontWeight: '700',
    fontSize: 13,
  },
  dateText: {
    color: '#8A94A6',
    fontSize: 13,
    fontWeight: '500',
  },
  routeRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  routeLine: {
    alignItems: 'center',
    width: 20,
    marginRight: 12,
  },
  dotFilled: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4B7BEC',
  },
  connector: {
    width: 2,
    flex: 1,
    minHeight: 30,
    backgroundColor: '#D8E2F5',
    marginVertical: 4,
  },
  dotOutline: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#4B7BEC',
    backgroundColor: '#FFFFFF',
  },
  routeDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  routeStop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  locationText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1F36',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B7BEC',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
    borderRadius: 12,
    padding: 10,
    marginTop: 4,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  infoLabel: {
    fontSize: 11,
    color: '#8A94A6',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    color: '#1A1F36',
    fontWeight: '500',
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