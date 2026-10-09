import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import {
  Stack,
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import { Ionicons } from "@expo/vector-icons";

export default function BookTour() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [loading, setLoading] = useState(false);

  // ==========================================================
  // CREATE RECEIPT
  // ==========================================================

  const createReceipt = async () => {
    try {
      setLoading(true);

      const API_URL = process.env.EXPO_PUBLIC_API_URL;

      if (!API_URL) {
        throw new Error(
          "EXPO_PUBLIC_API_URL is not configured."
        );
      }

      // ------------------------------------------------------
      // Prepare receipt data
      // ------------------------------------------------------

      const receiptData = {
        busNumber: params.busNumber,

        driverNIC: params.driverNIC,

        conductorNIC: params.conductorNIC,

        driverD: params.driverD,

        conductorD: params.conductorD,

        isOnline:
          params.isOnline === "true",

        date: params.date,

        pickup: params.pickup,

        time: params.time,

        packageId: params.packageId,

        description: params.description,

        packageType: params.packageType,

        totalDistance:
          Number(params.totalDistance) || 0,

        tripDuration: params.tripDuration,

        maxPassengers:
          Number(params.maxPassengers) || 0,

        maxPrice:
          Number(params.maxPrice) || 0,

        Pid: params.Pid,

        Pid1: params.Pid1 || "",

        pfirstName: params.pfirstName,

        plastName: params.plastName,

        pphoneNumber: params.pphoneNumber,

        pemail: params.pemail,
      };

      console.log(
        "================================"
      );

      console.log(
        "CREATING RECEIPT"
      );

      console.log(
        "Receipt Data:",
        receiptData
      );

      console.log(
        "================================"
      );

      // ------------------------------------------------------
      // Validate required fields
      // ------------------------------------------------------

      const requiredFields = [
        "busNumber",
        "driverNIC",
        "conductorNIC",
        "driverD",
        "conductorD",
        "date",
        "pickup",
        "time",
        "packageId",
        "description",
        "packageType",
        "tripDuration",
        "Pid",
        "pfirstName",
        "plastName",
        "pphoneNumber",
        "pemail",
      ];

      const missingFields =
        requiredFields.filter(
          (field) =>
            !receiptData[
              field as keyof typeof receiptData
            ]
        );

      if (missingFields.length > 0) {
        console.log(
          "Missing fields:",
          missingFields
        );

        Alert.alert(
          "Missing Information",
          `Please provide:\n\n${missingFields.join(
            "\n"
          )}`
        );

        return;
      }

      // ------------------------------------------------------
      // SEND TO BACKEND
      // ------------------------------------------------------

      const response = await fetch(
        `${API_URL}/receipts`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(
            receiptData
          ),
        }
      );

      // ------------------------------------------------------
      // READ RESPONSE
      // ------------------------------------------------------

      const data = await response.json();

      console.log(
        "Backend response:",
        data
      );

      // ------------------------------------------------------
      // ERROR
      // ------------------------------------------------------

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create receipt."
        );
      }

      // ------------------------------------------------------
      // CHECK RECEIPT
      // ------------------------------------------------------

      if (
        !data.receipt ||
        !data.receipt.receiptId
      ) {
        throw new Error(
          "Receipt was created but receipt ID was not returned."
        );
      }

      const receiptId =
        data.receipt.receiptId;

      console.log(
        "Receipt created successfully:"
      );

      console.log(
        "Receipt ID:",
        receiptId
      );

      // ------------------------------------------------------
      // OPEN RECEIPT SCREEN
      // ------------------------------------------------------

      router.push({
        pathname:
          "/passenger/tours/PackageReceipt",

        params: {
          receiptId: receiptId,
        },
      });
    } catch (error: any) {
      console.error(
        "Create receipt error:",
        error
      );

      Alert.alert(
        "Receipt Error",
        error.message ||
          "Unable to create receipt."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // SCREEN
  // ==========================================================

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.container}>
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Confirm Booking
          </Text>

          <View style={{ width: 42 }} />
        </View>

        {/* CONTENT */}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.content
          }
        >
          {/* PACKAGE */}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Package Details
            </Text>

            <InfoRow
              label="Package ID"
              value={params.packageId}
            />

            <InfoRow
              label="Package Type"
              value={params.packageType}
            />

            <InfoRow
              label="Description"
              value={params.description}
            />

            <InfoRow
              label="Pickup"
              value={params.pickup}
            />

            <InfoRow
              label="Date"
              value={params.date}
            />

            <InfoRow
              label="Time"
              value={params.selectedTime}
            />

            <InfoRow
              label="Distance"
              value={
                params.totalDistance
                  ? `${params.totalDistance} km`
                  : "-"
              }
            />

            <InfoRow
              label="Duration"
              value={params.tripDuration}
            />
          </View>

          {/* BUS */}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Bus Information
            </Text>

            <InfoRow
              label="Bus Number"
              value={params.busNumber}
            />

            <InfoRow
              label="Driver"
              value={params.driverD}
            />

            <InfoRow
              label="Driver NIC"
              value={params.driverNIC}
            />

            <InfoRow
              label="Conductor"
              value={params.conductorD}
            />

            <InfoRow
              label="Conductor NIC"
              value={params.conductorNIC}
            />
          </View>

          {/* PASSENGER */}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Passenger Information
            </Text>

            <InfoRow
              label="Passenger ID"
              value={params.Pid}
            />

            {params.Pid1 ? (
              <InfoRow
                label="Second ID"
                value={params.Pid1}
              />
            ) : null}

            <InfoRow
              label="Name"
              value={`${params.pfirstName || ""} ${
                params.plastName || ""
              }`}
            />

            <InfoRow
              label="Phone"
              value={params.pphoneNumber}
            />

            <InfoRow
              label="Email"
              value={params.pemail}
            />
          </View>

          {/* PRICE */}

          <View style={styles.priceCard}>
            <View>
              <Text style={styles.priceLabel}>
                Total Price
              </Text>

              <Text style={styles.price}>
                Rs.{" "}
                {Number(
                  params.maxPrice || 0
                ).toLocaleString("en-LK", {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>

            <View style={styles.onlineBadge}>
              <Ionicons
                name={
                  params.isOnline === "true" 
                    ? "checkmark-circle"
                    : "storefront"
                }
                size={18}
                color="#0B3D12"
              />

              <Text style={styles.onlineText}>
                {params.isOnline === "true" 
                  ? "Online"
                  : "Counter"}
              </Text>
            </View>
          </View>

          {/* CONFIRM BUTTON */}

          <TouchableOpacity
            style={[
              styles.confirmButton,
              loading &&
                styles.confirmButtonDisabled,
            ]}
            onPress={createReceipt}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text
                  style={[
                    styles.confirmText,
                    {
                      marginLeft: 10,
                    },
                  ]}
                >
                  Creating Receipt...
                </Text>
              </>
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={23}
                  color="#FFFFFF"
                />

                <Text
                  style={[
                    styles.confirmText,
                    {
                      marginLeft: 10,
                    },
                  ]}
                >
                  Confirm Booking
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.bottomNote}>
            Your receipt will be generated after
            confirming this booking.
          </Text>
        </ScrollView>
      </View>
    </>
  );
}

// ============================================================
// INFO ROW
// ============================================================

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: any;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>
        {label}
      </Text>

      <Text
        style={styles.infoValue}
        numberOfLines={3}
      >
        {value || "-"}
      </Text>
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF2F8",
  },

  header: {
    backgroundColor: "#0047AB",
    paddingTop: 50,
    paddingBottom: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor:
      "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginBottom: 16,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#101828",
    marginBottom: 6,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E9F1",
  },

  infoLabel: {
    flex: 0.9,
    fontSize: 14,
    color: "#8A94A6",
    paddingRight: 10,
  },

  infoValue: {
    flex: 1.4,
    fontSize: 14,
    fontWeight: "700",
    color: "#101828",
    textAlign: "right",
  },

  priceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 3,
  },

  priceLabel: {
    fontSize: 13,
    color: "#8A94A6",
    fontWeight: "600",
  },

  price: {
    marginTop: 4,
    fontSize: 28,
    fontWeight: "800",
    color: "#0047AB",
  },

  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E7F7E7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },

  onlineText: {
    marginLeft: 6,
    color: "#0B3D12",
    fontSize: 13,
    fontWeight: "700",
  },

  confirmButton: {
    height: 56,
    borderRadius: 17,
    backgroundColor: "#0047AB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },

  confirmButtonDisabled: {
    opacity: 0.7,
  },

  confirmText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  bottomNote: {
    marginTop: 14,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19,
    color: "#8A94A6",
  },
});