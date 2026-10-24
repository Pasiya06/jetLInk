// app/ParcelScanner.tsx
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";


type ScanResult = {
  valid: boolean;
  stage?: "pickup" | "delivery";
  message?: string;
  reason?: string;
  parcel?: {
    _id: string;
    status: string;
    // add other parcel fields you display
  };
};

export default function ParcelScanner() {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const lockRef = useRef(false); // prevents double-fire on rapid scans

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (lockRef.current) return;
    lockRef.current = true;
    setScanned(true);
    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post(`${API_URL}/parcel/parcel/verify`, {
        qrToken: data,
      });
      setResult(res.data);
    } catch (err) {
      setResult({ valid: false, reason: "Network or server error" });
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setResult(null);
    lockRef.current = false;
  };

  if (!permission) {
    return <View style={styles.center}><ActivityIndicator /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Ionicons name="camera-outline" size={48} color="#94a3b8" />
        <Text style={styles.permText}>Camera access is needed to scan parcel QR codes.</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#4338ca", "#6366f1"]} style={styles.header}>
        <Text style={styles.headerTitle}>Scan Parcel QR</Text>
        <Text style={styles.headerSubtitle}>
          Scan once for pickup, again for delivery
        </Text>
      </LinearGradient>

      <View style={styles.cameraWrap}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        />
        <View style={styles.frame} />
      </View>

      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.overlayText}>Verifying...</Text>
        </View>
      )}

      {result && !loading && (
        <View style={styles.resultCard}>
          <View
            style={[
              styles.resultIconWrap,
              {
                backgroundColor: result.valid
                  ? result.stage === "delivery"
                    ? "#dcfce7"
                    : "#dbeafe"
                  : "#fee2e2",
              },
            ]}
          >
            <Ionicons
              name={
                result.valid
                  ? result.stage === "delivery"
                    ? "checkmark-done-circle"
                    : "cube"
                  : "close-circle"
              }
              size={32}
              color={
                result.valid
                  ? result.stage === "delivery"
                    ? "#16a34a"
                    : "#2563eb"
                  : "#dc2626"
              }
            />
          </View>

          <Text style={styles.resultTitle}>
            {result.valid
              ? result.stage === "delivery"
                ? "Delivered"
                : "Pickup Verified"
              : "Scan Failed"}
          </Text>

          <Text style={styles.resultMessage}>
            {result.message || result.reason}
          </Text>

          {result.parcel && (
            <View style={styles.pillBadge}>
              <Text style={styles.pillBadgeText}>
                Status: {result.parcel.status}
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.scanAgainBtn} onPress={resetScanner}>
            <Ionicons name="scan" size={18} color="#fff" />
            <Text style={styles.scanAgainText}>Scan Next</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  permText: { color: "#475569", textAlign: "center", marginVertical: 12 },
  permBtn: { backgroundColor: "#4338ca", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  permBtnText: { color: "#fff", fontWeight: "600" },

  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "700" },
  headerSubtitle: { color: "#e0e7ff", fontSize: 13, marginTop: 4 },

  cameraWrap: { flex: 1, position: "relative" },
  frame: {
    position: "absolute",
    top: "30%",
    left: "15%",
    width: "70%",
    height: "35%",
    borderWidth: 3,
    borderColor: "#fff",
    borderRadius: 16,
  },

  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayText: { color: "#fff", marginTop: 12, fontWeight: "500" },

  resultCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 12,
  },
  resultIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  resultTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  resultMessage: { fontSize: 14, color: "#64748b", textAlign: "center", marginTop: 6, marginBottom: 12 },

  pillBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 16,
  },
  pillBadgeText: { fontSize: 12, fontWeight: "600", color: "#334155" },

  scanAgainBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#4338ca",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  scanAgainText: { color: "#fff", fontWeight: "600" },
});