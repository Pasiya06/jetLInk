import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

type SeatStatus = 'available' | 'selected' | 'booked';

interface Seat {
  id: number;
  status: SeatStatus;
}

// Example: seed some seats as already booked, rest available
const BOOKED_SEATS = [9, 14, 20, 27];
const TOTAL_SEATS = 55;
const SEATS_PER_ROW = 5;

const initialSeats: Seat[] = Array.from({ length: TOTAL_SEATS }, (_, i) => {
  const id = i + 1;
  return {
    id,
    status: BOOKED_SEATS.includes(id) ? 'booked' : 'available',
  };
});

export default function SeatSelectionScreen() {
  const [seats, setSeats] = useState<Seat[]>(initialSeats);

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
    pathname: "/Test/index2",
    params: {
      seatCount: selectedSeats.length.toString(),
      seatNumbers: JSON.stringify(seatNumbers),
    },
  });
};

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      {/* <LinearGradient
        colors={['#6C63FF', '#8E5CF0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Select Your Seat</Text>
            <Text style={styles.headerSubtitle}>Tap a seat to select</Text>
          </View>

          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient> */}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Route info card */}
        {/* <View style={styles.routeCard}>
          <View style={styles.routeIconWrap}>
            <Ionicons name="bus" size={20} color="#6C63FF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.routeText}>Matara → Makubura</Text>
            <Text style={styles.routeSubText}>
              NCO Express · Super Luxury · 10:00 AM
            </Text>
          </View>
        </View> */}

        {/* Seat map */}
        <View style={styles.seatMapCard}>
          {/* Windscreen indicator */}
          {/* <View style={styles.windscreen} /> */}

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
            <LegendItem color="#6C63FF" label="Selected" />
            <LegendItem color="#fff" borderColor="#D8D8E8" label="Available" />
            <LegendItem color="#E4E4EC" label="Booked" />
          </View>
        </View>
      </ScrollView>

      {/* Confirm button */}
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleConfirm}
          disabled={selectedSeats.length === 0}
        >
          <LinearGradient
            colors={
              selectedSeats.length > 0
                ? ['#2ECC71', '#27AE60']
                : ['#C9CDD6', '#C9CDD6']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.confirmButton}
          >
            <Text style={styles.confirmButtonText}>
              Confirm {selectedSeats.length}{' '}
              {selectedSeats.length === 1 ? 'seat' : 'seats'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

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
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  header: {
    paddingTop: 8,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 2,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginTop: -32,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  routeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0EEFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  routeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E1E2A',
  },
  routeSubText: {
    fontSize: 12,
    color: '#8A8A9C',
    marginTop: 2,
  },
  seatMapCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  windscreen: {
    width: '60%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E4E4EC',
    marginBottom: 20,
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E1E1EA',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  seatSelected: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },
  seatBooked: {
    backgroundColor: '#EDEDF3',
    borderColor: '#EDEDF3',
  },
  seatText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A4A5A',
  },
  seatTextSelected: {
    color: '#fff',
  },
  seatTextBooked: {
    color: '#B7B7C4',
  },
  legendRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 20,
  },
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
  legendLabel: {
    fontSize: 12,
    color: '#6A6A7A',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F5F6FA',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
