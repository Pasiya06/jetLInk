import React, { useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import ViewShot, { ViewShotRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";

interface ParcelQRDialogProps {
  visible: boolean;
  onClose: () => void;
  qrToken: string;
  error?: string | null;
  parcelId?: string;
  loading?: boolean;
}

export default function ParcelQRDialog({
  visible,
  onClose,
  qrToken,
  error,
  parcelId,
  loading,
}: ParcelQRDialogProps) {
  const viewShotRef = useRef<ViewShotRef>(null);
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (!viewShotRef.current) return;
    try {
      setSharing(true);
      const uri = await viewShotRef.current.capture?.();
      if (!uri) return;

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        alert("Sharing isn't available on this device");
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Share Parcel QR Code",
        UTI: "public.png",
      });
    } catch (err) {
      console.log("Share error:", err);
    } finally {
      setSharing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Gradient header */}
          <LinearGradient
            colors={["#173C79", "#155B8A", "#159B79"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            
            <Text style={styles.headerTitle}>Parcel QR Code</Text>
            {parcelId && (
              <Text style={styles.headerSubtitle}>ID: {parcelId}</Text>
            )}

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          {/* Body */}
          <View style={styles.body}>
            {loading ? (
              <ActivityIndicator size="large" color="#155B8A" />
            ) : error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={36} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : qrToken ? (
              <>
                <ViewShot
                  ref={viewShotRef}
                  options={{ format: "png", quality: 1 }}
                  style={styles.qrWrapper}
                >
                  <View style={styles.qrInner}>
                    <QRCode value={qrToken} size={200} />
                  </View>
                </ViewShot>

                <Text style={styles.helperText}>
                  Show this code to the courier for verification
                </Text>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.shareBtn]}
                    onPress={handleShare}
                    disabled={sharing}
                  >
                    {sharing ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="share-social-outline" size={18} color="#fff" />
                        <Text style={styles.shareBtnText}>Share</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.closeActionBtn]}
                    onPress={onClose}
                  >
                    <Text style={styles.closeActionBtnText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 15, 25, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 24,
    backgroundColor: "#fff",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: { elevation: 12 },
    }),
  },
  header: {
    paddingTop: 28,
    paddingBottom: 22,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: { elevation: 4 },
    }),
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    marginTop: 4,
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 26,
    alignItems: "center",
  },
  qrWrapper: {
    backgroundColor: "#fff",
  },
  qrInner: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#F8F9FC",
    borderWidth: 1,
    borderColor: "#EEF0F5",
  },
  helperText: {
    marginTop: 16,
    fontSize: 13,
    color: "#5B6B7F",
    textAlign: "center",
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 22,
    width: "100%",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 13,
    borderRadius: 14,
    gap: 6,
  },
  shareBtn: {
    backgroundColor: "#155B8A",
  },
  shareBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  closeActionBtn: {
    backgroundColor: "#F1F2F6",
  },
  closeActionBtnText: {
    color: "#4B5563",
    fontWeight: "600",
    fontSize: 14,
  },
  errorBox: {
    alignItems: "center",
    paddingVertical: 12,
  },
  errorText: {
    marginTop: 10,
    color: "#EF4444",
    fontSize: 14,
    textAlign: "center",
  },
});