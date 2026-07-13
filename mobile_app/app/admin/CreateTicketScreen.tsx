// screens/CreateTicketScreen.tsx
import { useState } from 'react';
import { Stack,useRouter,useLocalSearchParams} from "expo-router";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';


type Ticket = {
  _id: string;
  busId: string;
  passengerName: string;
  price: number;
  fromStop?: string;
  toStop?: string;
};

type Props = {
  navigation: {
    navigate: (screen: string, params: { ticketId: string }) => void;
  };
  route: {
    params: {
      busId: string;
    };
  };
};

export default function CreateTicketScreen({ navigation, route }: Props) {
  
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const [busId, setbusid] = useState('');
  const [passengerName, setPassengerName] = useState('');
  const [price, setPrice] = useState('');
  const [fromStop, setFromStop] = useState('');
  const [toStop, setToStop] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const createTicket = async () => {
    if (!passengerName.trim() || !price.trim()) {
      Alert.alert('Missing info', 'Passenger name and price are required');
      return;
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      Alert.alert('Invalid price', 'Enter a valid ticket price');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          busId,
          passengerName,
          price,
          fromStop,
          toStop,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create ticket');
      }

      const ticket: Ticket = await res.json();

      
      
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>New Ticket</Text>

      <Text style={styles.label}>Passenger Name</Text>
      <TextInput
        style={styles.input}
        value={busId}
        onChangeText={setbusid}
        placeholder="e.g. Pasindu Perera"
      />



      <Text style={styles.label}>Passenger Name</Text>
      <TextInput
        style={styles.input}
        value={passengerName}
        onChangeText={setPassengerName}
        placeholder="e.g. Pasindu Perera"
      />

      <Text style={styles.label}>Price (LKR)</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="e.g. 150"
        keyboardType="numeric"
      />

      <Text style={styles.label}>From Stop</Text>
      <TextInput
        style={styles.input}
        value={fromStop}
        onChangeText={setFromStop}
        placeholder="e.g. Kandy"
      />

      <Text style={styles.label}>To Stop</Text>
      <TextInput
        style={styles.input}
        value={toStop}
        onChangeText={setToStop}
        placeholder="e.g. Colombo"
      />

      <TouchableOpacity
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={createTicket}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create Ticket</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: '#555',
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  button: {
    marginTop: 28,
    backgroundColor: '#2d6cdf',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
