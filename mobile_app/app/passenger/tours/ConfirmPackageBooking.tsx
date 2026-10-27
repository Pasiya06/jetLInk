import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Alert } from "../../../components/JetAlert";

import {
  Stack,
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { C, GRADIENT } from "../../../components/JetUI";

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

        <LinearGradient
          colors={GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
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

          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.eyebrow}>Almost done</Text>
            <Text style={styles.headerTitle}>
              Confirm booking
            </Text>
          </View>
        </LinearGradient>

        {/* CONTENT */}

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.content
          }
        >
          {/* PRICE */}

          <View style={styles.priceCard}>
            <View>
              <Text style={styles.priceLabel}>
                Total price
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
                color={C.green}
              />

              <Text style={styles.onlineText}>
                {params.isOnline === "true" 
                  ? "Online"
                  : "Counter"}
              </Text>
            </View>
          </View>

          {/* PACKAGE */}

          <View style={styles.card}>
            <View style={styles.cardHead}>
              <View style={[styles.cardIcon, { backgroundColor: C.blueSoft }]}>
                <Ionicons name="map" size={18} color={C.blue} />
              </View>
              <Text style={styles.cardTitle}>
                Package details
              </Text>
            </View>

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
            <View style={styles.cardHead}>
              <View style={[styles.cardIcon, { backgroundColor: C.greenSoft }]}>
                <Ionicons name="bus" size={18} color={C.green} />
              </View>
              <Text style={styles.cardTitle}>
                Bus information
              </Text>
            </View>

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
            <View style={styles.cardHead}>
              <View style={[styles.cardIcon, { backgroundColor: C.purpleSoft }]}>
                <Ionicons name="person" size={18} color={C.purple} />
              </View>
              <Text style={styles.cardTitle}>
                Passenger information
              </Text>
            </View>

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
            <LinearGradient
              colors={GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.confirmGradient}
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
            </LinearGradient>
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
    backgroundColor: "#F3F6FA",
  },

  header: {
    paddingTop: 54,
    paddingBottom: 76,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor:
      "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },

  eyebrow: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 2,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
  },

  scroll: { flex: 1, marginTop: -56 },

  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 6,
    marginBottom: 14,
    elevation: 3,
    shadowColor: "#0F1B2D",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },

  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F1B2D",
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF1F6",
  },

  infoLabel: {
    flex: 0.9,
    fontSize: 13.5,
    color: "#5B6B7F",
    paddingRight: 10,
  },

  infoValue: {
    flex: 1.4,
    fontSize: 14,
    fontWeight: "700",
    color: "#0F1B2D",
    textAlign: "right",
  },

  priceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4,
    shadowColor: "#0F1B2D",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },

  priceLabel: {
    fontSize: 12,
    color: "#5B6B7F",
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  price: {
    marginTop: 4,
    fontSize: 28,
    fontWeight: "800",
    color: "#173C79",
    letterSpacing: -0.4,
  },

  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F5EE",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },

  onlineText: {
    marginLeft: 6,
    color: "#0B6B53",
    fontSize: 13,
    fontWeight: "800",
  },

  confirmButton: {
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    marginTop: 6,
    shadowColor: "#155B8A",
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  confirmGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    color: "#5B6B7F",
  },
});
