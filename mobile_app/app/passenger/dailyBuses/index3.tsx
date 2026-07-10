import React, { useState } from 'react';
import { Stack,useRouter} from "expo-router";
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  ScrollView,
  Alert 
} from 'react-native';
import { 
  Ionicons, 
  MaterialCommunityIcons, 
  Fontisto, 
  FontAwesome6, 
  MaterialIcons, 
  FontAwesome5, 
  FontAwesome
} from '@expo/vector-icons';
type SeatStatus = 'available' | 'booked' | 'selected';
const router = useRouter();

  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
interface Seat {
  id: number;
  status: SeatStatus;
}

const SeatPicker: React.FC = () => {
  const [seats, setSeats] = useState<Seat[]>(
    Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      status: 'available',
    }))
  );

  const toggleSeat = (id: number) => {
    setSeats((prevSeats) =>
      prevSeats.map((seat) => {
        if (seat.id === id && seat.status !== 'booked') {
          return { 
            ...seat, 
            status: seat.status === 'selected' ? 'available' : 'selected' 
          };
        }
        return seat;
      })
    );
  };

  const handleConfirm = () => {
    const selectedIds = seats
      .filter((s) => s.status === 'selected')
      .map((s) => s.id);
    
    if (selectedIds.length === 0) {
      Alert.alert('Selection', 'Please select at least one seat.');
    } else {
      Alert.alert('Seats Selected', selectedIds.join(', '));
    }
  };

  return (
    <>
    <Stack.Screen options={{ title: "", headerShown: false }} />
    <SafeAreaView style={styles.container}>

       <View style={styles.header}>
          <TouchableOpacity>
            <Ionicons name="menu" size={30} color="#ffffff" />
          </TouchableOpacity>
          
          <TouchableOpacity><Text style={styles.title}>Jetlink</Text></TouchableOpacity>
          
          <TouchableOpacity>
            <Ionicons name="notifications" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

      {/* Sub-Header */}
      <View style={styles.subHeader}>
        <TouchableOpacity 
          onPress={() => {
            if (isSearching) {
              setIsSearching(false); // Close search bar if open
            } else {
              

            
              router.back() 
            }
          }}
        >
          <Ionicons 
            name={isSearching ? "arrow-back" : "arrow-back-outline"} 
            size={24} 
            color="#0047AB" 
          />
        </TouchableOpacity>
        
        {isSearching ? (
          <TextInput
            style={styles.searchBarInput}
            placeholder="Search routes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
          />
        ) : (
          <Text style={styles.subHeaderTitle}>Bus Routes & Schedules</Text>
        )}
        
        <TouchableOpacity onPress={() => setIsSearching(!isSearching)}>
          <FontAwesome 
            name={isSearching ? "close" : "search"} 
            size={24} 
            color="#0047AB" 
          />
        </TouchableOpacity>
      </View>
    

      <View style={styles.busLayout}>
        <ScrollView contentContainerStyle={styles.grid}>
          {seats.map((seat) => (
            <TouchableOpacity
              key={seat.id}
              onPress={() => toggleSeat(seat.id)}
              disabled={seat.status === 'booked'}
              style={[
                styles.seat,
                styles[seat.status],
                // Creating the aisle between seat 2 and 3
                seat.id % 5 === 2 ? { marginRight: 40 } : { marginRight: 10 },
              ]}
            >
              <Text style={[styles.seatText, seat.status === 'selected' && { color: '#fff' }]}>
                {seat.id}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, styles.selected]} />
              <Text style={styles.legendText}>Selected</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, styles.available, { borderWidth: 1, borderColor: '#ccc' }]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, styles.booked]} />
              <Text style={styles.legendText}>Booked</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.okButton} onPress={handleConfirm}>
            <Text style={styles.okButtonText}>Ok</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.footerGraphic}>
               <View style={styles.blueCurve} />
               <View style={styles.greenCurve} />
      </View>
    </SafeAreaView></>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Spaced items
    paddingTop: 50, // Added padding for top status bar area
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    justifyContent: 'space-between',
  },
  
  subHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0047AB',
  },
  busLayout: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#00C853',
    borderRadius: 20,
    padding: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  seat: {
    width: 45,
    height: 45,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  seatText: {
    color: '#0056b3',
    fontWeight: 'bold',
  },
  available: { backgroundColor: '#fff' },
  booked: { backgroundColor: '#e0e0e0' },
  selected: { backgroundColor: '#0056b3' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 20,
  },
  legend: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 4,
  },
  legendText: {
    color: '#0056b3',
    fontSize: 14,
  },
  okButton: {
    borderWidth: 2,
    borderColor: '#00C853',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 15,
  },
  okButtonText: {
    color: '#0056b3',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerGraphic: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 60,
    overflow: 'hidden',
  },
  blueCurve: {
    backgroundColor: '#0052cc',
    height: 100,
    width: '100%',
    borderRadius: 25,
    position: 'absolute',
    // bottom: -40,
    // left: '-10%',
  },
  greenCurve: {
    backgroundColor: '#0052cc',
    height: 100,
    width: '100%',
    borderRadius: 25,
    position: 'absolute',
    // bottom: -60,
    // left: '-10%',
  },
  searchBarInput: {
  flex: 1,
  height: 40,
  backgroundColor: '#f0f0f0',
  borderRadius: 10,
  marginHorizontal: 15,
  paddingHorizontal: 15,
  fontSize: 16,
  color: '#333',
  },
});

export default SeatPicker;