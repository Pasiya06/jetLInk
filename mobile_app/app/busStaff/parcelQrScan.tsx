import React, { useState } from "react";
import { View, Text, Alert, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function VerifyParcel() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return <Text>Loading Camera...</Text>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Camera permission required.</Text>
        <Text onPress={requestPermission}>Grant Permission</Text>
      </View>
    );
  }

  const handleBarcodeScanned = async ({ data }: any) => {
    if (scanned) return;

    setScanned(true);

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

      const result = await response.json();

      if (!result.valid) {
        Alert.alert("Verification Failed", result.reason);
      } else {
        if (result.stage === "pickup") {
          Alert.alert(
            "Pickup Verified",
            `${result.message}

            Sender : ${result.parcel.sendername}
            Receiver : ${result.parcel.receivername}
            Status : ${result.parcel.status}`
          );
        } else {
          Alert.alert(
            "Delivered",
            `${result.message}

            Sender : ${result.parcel.sendername}
            Receiver : ${result.parcel.receivername}
            Status : ${result.parcel.status}`
          );
        }
      }
    } catch (err) {
      Alert.alert("Error", "Server connection failed.");
    }

    setTimeout(() => {
      setScanned(false);
    }, 3000);
  };

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={handleBarcodeScanned}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});