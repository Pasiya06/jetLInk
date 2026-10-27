import React from 'react';
import  { useState, useMemo, useEffect } from 'react';
import { Stack,useRouter,useLocalSearchParams} from "expo-router";
import { 
  Alert,
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  TextInput,
  ScrollView,
} from 'react-native';
import { ScreenHeader, C, ui } from "../../../components/JetUI";
import { Ionicons, 
  MaterialCommunityIcons, 
  Feather, 
  FontAwesome6, 
  MaterialIcons, 
  FontAwesome5, 
  FontAwesome } from '@expo/vector-icons'; // Standard icon sets
  import { LinearGradient } from 'expo-linear-gradient';

type SeatStatus = 'available' | 'selected' | 'booked';

interface Seat {
  id: number;
  status: SeatStatus;
}

// Example: seed some seats as already booked, rest available
// const BOOKED_SEATS = [9, 14, 20, 27];
const API_URL = process.env.EXPO_PUBLIC_API_URL;

const TOTAL_SEATS = 54;
const SEATS_PER_ROW = 6;


export default function SeatSelectionScreen() {
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const params = useLocalSearchParams();
    const [BookedSeats, setBookedSeats] = useState<number[]>([]);
    const BOOKED_SEATS = BookedSeats;
    const getBookedSeats = async () => {
      try {
        const response = await fetch(
          `${API_URL}/tickets/booked-seats?bNumber=${params.bNumber}&busType=${params.busType}&date=${params.date}&time=${params.depaturetime}`
        );

        const data = await response.json();

        if (response.ok && data.success) {
          console.log(data.bookedSeats);

          setBookedSeats(data.bookedSeats);
        }
      } catch (error) {
        console.log(error);
      }
    };

    useEffect(() => {
      getBookedSeats();
    }, []);

    useEffect(() => {
      const updatedSeats: Seat[] = Array.from(
        { length: TOTAL_SEATS },
        (_, i) => ({
          id: i + 1,
          status: BookedSeats.includes(i + 1)
            ? "booked"
            : "available",
        })
      );

      setSeats(updatedSeats);
    }, [BookedSeats]);
    
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('');

    const [seats, setSeats] = useState<Seat[]>([]);
    
      const selectedSeats = useMemo(
        () => seats.filter((s) => s.status === 'selected'),
        [seats]
      );
    
      const toggleSeat = (id: number) => {
        setSeats((prev) =>
          prev.map((seat) => {
            if (seat.id !== id || seat.status === 'booked') return seat;
            return {
              ...seat,
              status: seat.status === 'selected' ? 'available' : 'selected',
            };
          })
        );
      };
    
      const rows = useMemo(() => {
        const chunked: Seat[][] = [];
        for (let i = 0; i < seats.length; i += SEATS_PER_ROW) {
          chunked.push(seats.slice(i, i + SEATS_PER_ROW));
        }
        return chunked;
      }, [seats]);
    
       const handleConfirm = () => {
        if (selectedSeats.length === 0) return;
      
        const seatNumbers = selectedSeats.map((seat) => seat.id);
      
        router.push({
          pathname: "/passenger/dailyBuses/HighwayTicketSummary",
          params: {
            Pid: params.Pid,
            Pid1: params.Pid1,
            pfirstName: params.pfirstName,
            plastName:params.plastName,
            pphoneNumber: params.pphoneNumber,
            pemail: params.pemail,
            NIC: params.NIC,
            pickup:params.pickup,
            drop:params.drop,
            date:params.date,
            time:params.depaturetime,
            bNumber:params.bNumber,
            busType:params.busType,
            ticketPrice:params.ticketPrice,
            seatCount: selectedSeats.length.toString(),
            seatNumbers: JSON.stringify(seatNumbers),
          },
        });
      };



  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <SafeAreaView style={styles.container}>
       {/* Header Section */}
      <ScreenHeader eyebrow={`${params.pickuploca ?? ""} → ${params.dropoffloca ?? ""}`} title="Select seats" /> 

      <ScrollView
        style={ui.body}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Trip strip */}
        <View style={[ui.card, styles.tripCard]}>
          <View style={styles.tripItem}>
            <Ionicons name="bus-outline" size={18} color={C.blue} />
            <Text style={styles.tripValue}>{params.bNumber}</Text>
          </View>
          <View style={styles.tripDivider} />
          <View style={styles.tripItem}>
            <Ionicons name="time-outline" size={18} color={C.blue} />
            <Text style={styles.tripValue}>{params.depaturetime}</Text>
          </View>
          <View style={styles.tripDivider} />
          <View style={styles.tripItem}>
            <Ionicons name="calendar-outline" size={18} color={C.blue} />
            <Text style={styles.tripValue} numberOfLines={1}>{params.date}</Text>
          </View>
        </View>

        {/* Seat map */}
        <View style={styles.seatMapCard}>
          <View style={styles.busFront}>
            <MaterialCommunityIcons name="steering" size={22} color={C.muted} />
            <Text style={styles.busFrontText}>Front</Text>
          </View>

          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.seatRow}>
              {row.map((seat, seatIndex) => (
                <React.Fragment key={seat.id}>
                  <SeatButton seat={seat} onPress={() => toggleSeat(seat.id)} />
                  {/* aisle gap after 2nd seat in each row */}
                  {seatIndex === 1 && <View style={styles.aisleGap} />}
                </React.Fragment>
              ))}
            </View>
          ))}

          {/* Legend */}
          <View style={styles.legendRow}>
            <LegendItem color="#155B8A" label="Selected" />
            <LegendItem color="#fff" borderColor="#C9D4E2" label="Available" />
            <LegendItem color="#E3E8EF" label="Booked" />
          </View>
        </View>

        
          {selectedSeats.length > 0 ? (
            <View style={[ui.card, styles.selectedCard]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.selectedLabel}>Selected seats</Text>
                <Text style={styles.selectedSeats} numberOfLines={2}>
                  {selectedSeats.map((x) => x.id).join(", ")}
                </Text>
              </View>
              {Number(params.ticketPrice) > 0 ? (
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.selectedLabel}>Total</Text>
                  <Text style={styles.selectedTotal}>
                    Rs. {(Number(params.ticketPrice) * selectedSeats.length).toLocaleString()}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleConfirm}
            disabled={selectedSeats.length === 0}
          >
            <LinearGradient
              colors={
                selectedSeats.length > 0
                  ? ['#173C79', '#155B8A', '#159B79']
                  : ['#C9D2DE', '#C9D2DE']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.confirmButton}
            >
              <Text style={styles.confirmButtonText}>
                Confirm {selectedSeats.length}{' '}
                {selectedSeats.length === 1 ? 'seat' : 'seats'}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        
      </ScrollView>

      {/* Confirm button */}
      
      
        
       
      

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
                        pathname: "/passenger/dailyBuses/searchBus",
                        params: {
                          Pid: params.Pid,
                          Pid1: params.Pid1,
                          pfirstName: params.pfirstName,
                          plastName:params.plastName,
                          pphoneNumber: params.pphoneNumber,
                          pemail: params.pemail,
                          NIC: params.NIC,
                          pickup:params.pickup,
                          drop:params.drop,
                          date:params.date,
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
                          NIC: params.NIC,
                        },                    
                      });}} > 
                <Ionicons name="home-outline" size={28} color="#fff" />             
              </TouchableOpacity>
        
              <TouchableOpacity style={styles.item} onPress={() => { router.push({ pathname: "/notifications", params: { role: "passenger" } }); }}>
                <Ionicons name="notifications-outline" size={24} color={activeTab === "alerts" ? "#0057D9" : "#8A8A8A"}/>
                <Text style={[styles.label1,activeTab === "alerts" && styles.activeLabel, ]}>
                  Alerts
                </Text>
              </TouchableOpacity>
        
              <TouchableOpacity style={styles.item} onPress={() => {setActiveTab("profile"); router.push({ pathname: "/passenger/passengerProfile", params: { role: "passenger",NIC: params.NIC } });}}>
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

function SeatButton({
  seat,
  onPress,
}: {
  seat: Seat;
  onPress: () => void;
}) {
  const isBooked = seat.status === 'booked';
  const isSelected = seat.status === 'selected';

  return (
    <TouchableOpacity
      disabled={isBooked}
      onPress={onPress}
      style={[
        styles.seat,
        isSelected && styles.seatSelected,
        isBooked && styles.seatBooked,
      ]}
    >
      <Text
        style={[
          styles.seatText,
          isSelected && styles.seatTextSelected,
          isBooked && styles.seatTextBooked,
        ]}
      >
        {seat.id}
      </Text>
    </TouchableOpacity>
  );
}

function LegendItem({
  color,
  borderColor,
  label,
}: {
  color: string;
  borderColor?: string;
  label: string;
}) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendDot,
          { backgroundColor: color },
          borderColor ? { borderWidth: 1, borderColor } : null,
        ]}
      />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const SEAT_SIZE = 40;

const styles = StyleSheet.create({
  selectedTotal: { fontSize: 18, fontWeight: '800', color: C.blue, marginTop: 2 },
  selectedSeats: { fontSize: 16, fontWeight: '800', color: C.navy, marginTop: 2 },
  selectedLabel: { fontSize: 12, fontWeight: '700', color: C.muted },
  selectedCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20 },
  busFrontText: { fontSize: 12, fontWeight: '700', color: C.muted },
  busFront: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6, paddingHorizontal: 8, paddingBottom: 12, marginBottom: 14, borderBottomWidth: 1, borderBottomColor: C.line },
  tripDivider: { width: 1, height: 22, backgroundColor: C.line },
  tripValue: { fontSize: 13, fontWeight: '800', color: C.ink, flexShrink: 1 },
  tripItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  tripCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 10, borderRadius: 20 },
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,   
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

  scrollContent: { paddingHorizontal: 16, paddingBottom: 200, gap: 14 },
  
  seatMapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#0F1B2D',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  
  seatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aisleGap: {
    width: 20,
  },
  seat: {
    width: SEAT_SIZE,
    height: SEAT_SIZE,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#C9D4E2',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  seatSelected: { backgroundColor: '#155B8A', borderColor: '#155B8A' },
  seatBooked: { backgroundColor: '#E3E8EF', borderColor: '#E3E8EF' },
  seatText: { fontSize: 13, fontWeight: '700', color: '#0F1B2D' },
  seatTextSelected: {
    color: '#fff',
  },
  seatTextBooked: { color: '#A3AEBD' },
  legendRow: { flexDirection: 'row', marginTop: 10, paddingTop: 14, gap: 18, borderTopWidth: 1, borderTopColor: C.line, alignSelf: 'stretch', justifyContent: 'center' },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 4,
    marginRight: 6,
  },
  legendLabel: { fontSize: 12, fontWeight: '600', color: C.muted },
  
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 27,
    gap: 8,
  },
  confirmButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  
  
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

