import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Modal,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

const { width } = Dimensions.get("window");
const API_BASE = "https://your-api-url.com/api"; // TODO: replace with your backend base URL

type VerifyResult = {
  valid: boolean;
  reason?: string;
  ticket?: {
    ticketId?: string;
    passengerName?: string;
    busNumber?: string;
    seatNumber?: string;
    route?: string;
  };
};

export default function VerifyTicketScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // Scanning line animation loop
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    if (!scanned) loop.start();
    return () => loop.stop();
  }, [scanned]);

  const animateResultIn = () => {
    scaleAnim.setValue(0);
    iconRotate.setValue(0);
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(iconRotate, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);
    setModalVisible(true);

    try {
      const res = await axios.post(`${API_BASE}/tickets/verify`, {
        qrToken: data,
      });
      setResult(res.data);
    } catch (err) {
      setResult({ valid: false, reason: "Network error. Please try again." });
    } finally {
      setLoading(false);
      animateResultIn();
    }
  };

  const resetScanner = () => {
    setModalVisible(false);
    setResult(null);
    setTimeout(() => setScanned(false), 300);
  };

  if (!permission) {
    return <View style={styles.centered} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <LinearGradient
          colors={["#6C5CE7", "#4834D4"]}
          style={styles.permissionIconWrap}
        >
          <Ionicons name="camera-outline" size={40} color="#fff" />
        </LinearGradient>
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionSubtitle}>
          We need camera access to scan passenger ticket QR codes
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <LinearGradient
            colors={["#6C5CE7", "#4834D4"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.permissionButtonGradient}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 230],
  });

  const iconScale = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={["#6C5CE7", "#4834D4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerIconCircle}>
            <Ionicons name="qr-code-outline" size={24} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Verify Ticket</Text>
            <Text style={styles.headerSubtitle}>
              Scan passenger QR to check in
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Camera */}
      <View style={styles.cameraWrap}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        />

        {/* Dim overlay with cutout frame */}
        <View style={styles.overlay}>
          <View style={styles.frameWrap}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            {!scanned && (
              <Animated.View
                style={[
                  styles.scanLine,
                  { transform: [{ translateY: scanLineTranslate }] },
                ]}
              />
            )}
          </View>
          <Text style={styles.overlayHint}>
            Align the QR code within the frame
          </Text>
        </View>
      </View>

      {/* Result Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="large" color="#6C5CE7" />
                <Text style={styles.loadingText}>Verifying ticket...</Text>
              </View>
            ) : (
              <>
                <Animated.View
                  style={[
                    styles.resultIconCircle,
                    result?.valid
                      ? styles.resultIconValid
                      : styles.resultIconInvalid,
                    {
                      transform: [
                        { scale: scaleAnim },
                        { scale: iconScale },
                      ],
                    },
                  ]}
                >
                  <Ionicons
                    name={result?.valid ? "checkmark" : "close"}
                    size={44}
                    color="#fff"
                  />
                </Animated.View>

                <Text style={styles.resultTitle}>
                  {result?.valid ? "Ticket Verified" : "Verification Failed"}
                </Text>

                <View
                  style={[
                    styles.pillBadge,
                    result?.valid ? styles.pillValid : styles.pillInvalid,
                  ]}
                >
                  <Text
                    style={[
                      styles.pillBadgeText,
                      result?.valid
                        ? styles.pillTextValid
                        : styles.pillTextInvalid,
                    ]}
                  >
                    {result?.valid ? "VALID" : (result?.reason || "INVALID").toUpperCase()}
                  </Text>
                </View>

                {result?.valid && result?.ticket && (
                  <View style={styles.infoCard}>
                    <InfoRow
                      icon="person-outline"
                      label="Passenger"
                      value={result.ticket.passengerName || "—"}
                    />
                    <InfoRow
                      icon="bus-outline"
                      label="Bus Number"
                      value={result.ticket.busNumber || "—"}
                    />
                    <InfoRow
                      icon="navigate-outline"
                      label="Route"
                      value={result.ticket.route || "—"}
                    />
                    <InfoRow
                      icon="grid-outline"
                      label="Seat"
                      value={result.ticket.seatNumber || "—"}
                    />
                  </View>
                )}

                <TouchableOpacity
                  style={styles.scanAgainButton}
                  onPress={resetScanner}
                >
                  <LinearGradient
                    colors={["#6C5CE7", "#4834D4"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.scanAgainGradient}
                  >
                    <Ionicons name="scan-outline" size={18} color="#fff" />
                    <Text style={styles.scanAgainText}>Scan Next Ticket</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconTint}>
        <Ionicons name={icon} size={16} color="#6C5CE7" />
      </View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B14" },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: "#F5F5FA",
  },
  permissionIconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 8,
  },
  permissionSubtitle: {
    fontSize: 14,
    color: "#8A8A9E",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  permissionButton: { borderRadius: 14, overflow: "hidden" },
  permissionButtonGradient: { paddingVertical: 14, paddingHorizontal: 32 },
  permissionButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  header: {
    paddingTop: 60,
    paddingBottom: 22,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  headerIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
  headerSubtitle: { color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 2 },

cameraWrap: { flex: 1,marginLeft:20, marginRight:20, marginTop:-70, borderRadius: 24, overflow: "hidden", maxHeight: "65%", },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  frameWrap: {
    width: 250,
    height: 250,
    borderRadius: 20,
    overflow: "hidden",
  },
  corner: {
    position: "absolute",
    width: 32,
    height: 32,
    borderColor: "#A29BFE",
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  scanLine: {
    width: "100%",
    height: 2,
    backgroundColor: "#A29BFE",
    shadowColor: "#A29BFE",
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  overlayHint: {
    marginTop: 24,
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
    opacity: 0.85,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(11,11,20,0.65)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  loadingWrap: { alignItems: "center", paddingVertical: 20 },
  loadingText: { marginTop: 14, fontSize: 14, color: "#8A8A9E", fontWeight: "500" },

  resultIconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  resultIconValid: { backgroundColor: "#2ECC71" },
  resultIconInvalid: { backgroundColor: "#FF5C5C" },

  resultTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 12,
  },

  pillBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  pillValid: { backgroundColor: "#E4F9EE" },
  pillInvalid: { backgroundColor: "#FFEAEA" },
  pillBadgeText: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  pillTextValid: { color: "#27AE60" },
  pillTextInvalid: { color: "#E74C3C" },

  infoCard: {
    width: "100%",
    backgroundColor: "#F7F7FC",
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#ECECF5",
  },
  infoIconTint: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#EFEBFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  infoLabel: { flex: 1, fontSize: 13, color: "#8A8A9E", fontWeight: "500" },
  infoValue: { fontSize: 13, color: "#1A1A2E", fontWeight: "700" },

  scanAgainButton: { width: "100%", borderRadius: 14, overflow: "hidden" },
  scanAgainGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
  },
  scanAgainText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
