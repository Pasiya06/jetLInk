import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function VerifyParcel() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);

  const scanAgain = () => {
  setResult(null);
  setScanned(false);
};
  
  

 if (!permission) {
     return (
       <View style={styles.center}>
         <ActivityIndicator size="large" />
       </View>
     );
   }
 
   // Camera permission denied
   if (!permission.granted) {
     return (
       <View style={styles.center}>
         <Text style={styles.permissionText}>
           We need camera access to scan tickets
         </Text>
         <TouchableOpacity style={styles.button} onPress={requestPermission}>
           <Text style={styles.buttonText}>Grant Permission</Text>
         </TouchableOpacity>
       </View>
     );
   }

  const handleBarcodeScanned = async ({ data }: any) => {
  if (scanned || verifying) return;

  setScanned(true);
  setVerifying(true);

  try {
    const response = await fetch(`${API_URL}/parcel/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        qrToken: data,
      }),
    });

    const json = await response.json();

    setResult(json);
  } catch (err) {
    setResult({
      valid: false,
      reason: "Server connection failed.",
    });
  }

  setVerifying(false);
};

  return (
    <View style={styles.container}>
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={handleBarcodeScanned}
      />
    
  {/* Scan frame overlay */}
        {!result && !verifying && (
          <View style={styles.overlay}>
            <View style={styles.scanBox} />
            <Text style={styles.overlayText}>Align QR code within the frame</Text>
          </View>
        )}
  
        {/* Verifying spinner */}
        {verifying && (
          <View style={styles.resultOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.verifyingText}>Verifying...</Text>
          </View>
        )}
  
        {/* Result card */}
        
          <View style={styles.resultOverlay}>
            <View
              style={[
                styles.resultCard,
                result.valid ? styles.successCard : styles.failCard,
              ]}
            >
              <Text style={styles.resultIcon}>{result.valid ? '✅' : '❌'}</Text>
              <Text style={styles.resultTitle}>
                {result.valid ? 'Valid Ticket' : 'Invalid Ticket'}
              </Text>
              <Text style={styles.resultSubtitle}>
                {result.valid
                  ? `Passenger: ${result.passengerName ?? 'Unknown'}`
                  : result.reason ?? 'Verification failed'}
              </Text>
  
              <TouchableOpacity style={styles.button} onPress={handleBarcodeScanned}>
                <Text style={styles.buttonText}>Scan Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000',
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      backgroundColor: '#fff',
    },
    permissionText: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 16,
    },
    overlay: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scanBox: {
      width: 250,
      height: 250,
      borderWidth: 3,
      borderColor: '#fff',
      borderRadius: 16,
      backgroundColor: 'transparent',
    },
    overlayText: {
      marginTop: 16,
      color: '#fff',
      fontSize: 14,
    },
    resultOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.6)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    verifyingText: {
      color: '#fff',
      marginTop: 12,
      fontSize: 14,
    },
    resultCard: {
      width: '80%',
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
    },
    successCard: {
      backgroundColor: '#e6f9ed',
    },
    failCard: {
      backgroundColor: '#fdeaea',
    },
    resultIcon: {
      fontSize: 40,
      marginBottom: 8,
    },
    resultTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 6,
    },
    resultSubtitle: {
      fontSize: 14,
      color: '#444',
      textAlign: 'center',
      marginBottom: 20,
    },
    button: {
      backgroundColor: '#2d6cdf',
      paddingVertical: 10,
      paddingHorizontal: 24,
      borderRadius: 8,
    },
    buttonText: {
      color: '#fff',
      fontWeight: '600',
    },
  });
  