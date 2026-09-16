// screens/TicketQRScreen.tsx
import { useEffect, useState, useCallback,  } from 'react';
import { Stack,useRouter,useLocalSearchParams} from "expo-router";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';



export default function TicketQRScreen() {
  const params = useLocalSearchParams();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const [busId, setBusId] = useState('');
  
  const [qrToken, setQrToken] = useState<string | null>(null);
  
  const [error, setError] = useState<string | null>(null);

  const fetchQR = async () => {

  if (!busId.trim()) {
    alert("Please enter Bus ID");
    return;
  }

  try {

    setError(null);

    const url = `${API_URL}/tickets/bus/${busId}/qr`;

    console.log("Request URL:", url);

    const res = await fetch(url);

    console.log("Status:", res.status);

    const data = await res.json();

    console.log("Backend Data:", data);


    if (!res.ok) {
      throw new Error(data.error);
    }


    setQrToken(data.qrToken);


  } catch (error) {

    console.log("QR Error:", error);

    setQrToken(null);
    setError("Could not generate QR");

  }
};
  

  

  return (
    <View style={styles.container}>
      <TextInput
        
        placeholder="Enter Bus ID"
        value={busId}
        onChangeText={setBusId}
      />
      <TouchableOpacity style={styles.retryButton} onPress={fetchQR}>
        <Text style={styles.retryText}>Generate QR</Text>
      </TouchableOpacity>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      
      <Text style={styles.title}>Your Ticket</Text>
      {qrToken && (
        <View style={styles.qrWrapper}>
          <QRCode value={String(qrToken)} size={220} />
        </View>
      )}
      <Text style={styles.hint}>Show this to the conductor to board</Text>
      <Text style={styles.expiry}>This QR refreshes automatically every 12 hours</Text>

      <TouchableOpacity style={styles.refreshButton} onPress={fetchQR}>
        <Text style={styles.refreshText}>Refresh QR</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  qrWrapper: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  hint: {
    marginTop: 20,
    fontSize: 14,
    color: '#444',
  },
  expiry: {
    marginTop: 6,
    fontSize: 12,
    color: '#999',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 14,
    color: '#c0392b',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2d6cdf',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  refreshButton: {
    marginTop: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  refreshText: {
    color: '#2d6cdf',
    fontWeight: '600',
  },
});
