
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

type EmergencyStatus = "normal" | "accident" | "breakdown";

const busNumber:string = "HH-7788";

type Props = {
  busNumber: string;
};



const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function EmergencyButton() {
  const [emergency, setEmergency] = useState(false);
  const [status, setStatus] = useState<EmergencyStatus>("normal");
  const [loading, setLoading] = useState(false);
  const busNumber:string = "HH-7788";
  const fetchEmergency = useCallback(async () => {
    if (!API_URL || !busNumber) return;

    try {
      const response = await fetch(
        `${API_URL}/buses/${encodeURIComponent(
          busNumber
        )}/emergency`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to get status");
      }

      setEmergency(data.bus.emergency);
      setStatus(data.bus.status);
    } catch (error) {
      console.error("Fetch emergency error:", error);
    }
  }, [busNumber]);

  useEffect(() => {
    fetchEmergency();
  }, [fetchEmergency]);

  const reportEmergency = async (
    emergencyType: "accident" | "breakdown"
  ) => {
    if (loading) return;

    Alert.alert(
      "Confirm Emergency",
      `Are you sure you want to report a ${emergencyType}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          style: "destructive",
          onPress: async () => {
            if (!API_URL) {
              Alert.alert("Error", "API URL is not configured.");
              return;
            }

            try {
              setLoading(true);

              const response = await fetch(
                `${API_URL}/buses/${encodeURIComponent(
                  busNumber
                )}/emergency`,
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    status: emergencyType,
                  }),
                }
              );

              const data = await response.json();

              if (!response.ok) {
                throw new Error(
                  data.message || "Failed to report emergency"
                );
              }

              setEmergency(data.bus.emergency);
              setStatus(data.bus.status);

              Alert.alert(
                "Emergency Reported",
                `Bus ${busNumber}: ${emergencyType.toUpperCase()}`
              );
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "Failed to report emergency"
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const resolveEmergency = () => {
    if (loading) return;

    Alert.alert(
      "Resolve Emergency",
      "Has the emergency been resolved?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes, Resolve",
          onPress: async () => {
            if (!API_URL) {
              Alert.alert("Error", "API URL is not configured.");
              return;
            }

            try {
              setLoading(true);

              const response = await fetch(
                `${API_URL}/buses/${encodeURIComponent(
                  busNumber
                )}/emergency/resolve`,
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );

              const data = await response.json();

              if (!response.ok) {
                throw new Error(
                  data.message || "Failed to resolve emergency"
                );
              }

              setEmergency(data.bus.emergency);
              setStatus(data.bus.status);

              Alert.alert(
                "Success",
                "Emergency resolved successfully."
              );
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "Failed to resolve emergency"
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bus Emergency</Text>

      <Text style={styles.busNumber}>
        Bus Number: {busNumber}
      </Text>

      <View
        style={[
          styles.statusBox,
          emergency ? styles.emergencyBox : styles.normalBox,
        ]}
      >
        <Text style={styles.statusLabel}>
          Current Status
        </Text>

        <Text
          style={[
            styles.statusText,
            { color: emergency ? "#B91C1C" : "#15803D" },
          ]}
        >
          {emergency
            ? status.toUpperCase()
            : "NORMAL"}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#0047AB"
          style={styles.loader}
        />
      ) : (
        <>
          {!emergency && (
            <>
              <TouchableOpacity
                style={[styles.button, styles.accidentButton]}
                onPress={() => reportEmergency("accident")}
                accessibilityRole="button"
                accessibilityLabel="Report accident"
              >
                <Text style={styles.buttonText}>
                  🚨 Report Accident
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.breakdownButton]}
                onPress={() => reportEmergency("breakdown")}
                accessibilityRole="button"
                accessibilityLabel="Report breakdown"
              >
                <Text style={styles.buttonText}>
                  🚌 Report Breakdown
                </Text>
              </TouchableOpacity>
            </>
          )}

          {emergency && (
            <TouchableOpacity
              style={[styles.button, styles.resolveButton]}
              onPress={resolveEmergency}
              accessibilityRole="button"
              accessibilityLabel="Resolve emergency"
            >
              <Text style={styles.buttonText}>
                ✓ Resolve Emergency
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    margin: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0047AB",
    marginBottom: 8,
  },
  busNumber: {
    fontSize: 16,
    color: "#555555",
    marginBottom: 14,
  },
  statusBox: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: "center",
  },
  normalBox: {
    backgroundColor: "#DCFCE7",
  },
  emergencyBox: {
    backgroundColor: "#FEE2E2",
  },
  statusLabel: {
    fontSize: 14,
    color: "#333333",
  },
  statusText: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 4,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  accidentButton: {
    backgroundColor: "#DC2626",
  },
  breakdownButton: {
    backgroundColor: "#EA580C",
  },
  resolveButton: {
    backgroundColor: "#15803D",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  loader: {
    marginVertical: 20,
  },
});
