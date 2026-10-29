import React, { useEffect, useRef, useState } from "react";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Linking,
  Platform,
} from "react-native";
import { Alert } from "../../components/JetAlert";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import MapView, { Marker, MapViewHandle } from "../../components/OSMMap";

import { C, GRADIENT } from "../../components/JetUI";

type Coords = { latitude: number; longitude: number };

// Straight-line distance in km (Haversine)
const distanceKm = (a: Coords, b: Coords) => {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.latitude * Math.PI) / 180) *
      Math.cos((b.latitude * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};

/**
 * Bus staff screen: shows the passenger's pickup location on a map.
 *
 * Open it with:
 *   router.push({
 *     pathname: "/busStaff/pickupLocation",
 *     params: {
 *       pickupLat, pickupLng, pickupAddress, pickup,
 *       passengerName, passengerPhone, date, time,
 *     },
 *   });
 */
export default function PickupLocation() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mapRef = useRef<MapViewHandle>(null);

  const lat = Number(params.pickupLat);
  const lng = Number(params.pickupLng);
  const hasPickup = !!params.pickupLat && !!params.pickupLng && !isNaN(lat) && !isNaN(lng);
  const pickupCoords: Coords | null = hasPickup ? { latitude: lat, longitude: lng } : null;

  const [myCoords, setMyCoords] = useState<Coords | null>(null);

  // Track bus staff's own location so they can see how far the passenger is
  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 20, timeInterval: 5000 },
        (pos) => setMyCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
      );
    })();
    return () => sub?.remove();
  }, []);

  const fitBoth = () => {
    if (!pickupCoords) return;
    const points = myCoords ? [pickupCoords, myCoords] : [pickupCoords];
    if (points.length === 1) {
      mapRef.current?.animateToRegion({ ...pickupCoords, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 600);
    } else {
      mapRef.current?.fitToCoordinates(points, {
        edgePadding: { top: 80, right: 60, bottom: 260, left: 60 },
        animated: true,
      });
    }
  };

  // Fit once when staff location first arrives
  const fittedRef = useRef(false);
  useEffect(() => {
    if (myCoords && !fittedRef.current) {
      fittedRef.current = true;
      fitBoth();
    }
  }, [myCoords]);

  const openDirections = () => {
    if (!pickupCoords) return;
    const { latitude, longitude } = pickupCoords;
    const url =
      Platform.OS === "ios"
        ? `http://maps.apple.com/?daddr=${latitude},${longitude}`
        : `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
    Linking.openURL(url).catch(() => Alert.alert("Error", "Could not open maps."));
  };

  const callPassenger = () => {
    if (!params.passengerPhone) return;
    Linking.openURL(`tel:${params.passengerPhone}`);
  };

  const km = pickupCoords && myCoords ? distanceKm(myCoords, pickupCoords) : null;

  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />

        <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGrad}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.eyebrow}>Passenger pickup</Text>
              <Text style={styles.headertitle} numberOfLines={1}>
                {params.passengerName || "Pickup location"}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {pickupCoords ? (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{ ...pickupCoords, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
            showsUserLocation
            showsMyLocationButton={false}
          >
            <Marker
              coordinate={pickupCoords}
              title="Pickup location"
              description={String(params.pickupAddress || params.pickup || "")}
              pinColor="green"
            />
          </MapView>
        ) : (
          <View style={styles.empty}>
            <Ionicons name="location-outline" size={40} color={C.muted} />
            <Text style={styles.emptyText}>
              This passenger did not share a map location.{"\n"}Pickup: {params.pickup || "-"}
            </Text>
          </View>
        )}

        {pickupCoords && (
          <TouchableOpacity style={styles.fitBtn} onPress={fitBoth} activeOpacity={0.85}>
            <MaterialCommunityIcons name="crosshairs-gps" size={20} color={C.blue} />
          </TouchableOpacity>
        )}

        {/* INFO CARD */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: "#E6F6EF" }]}>
              <Ionicons name="location" size={18} color={C.green} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.label}>Pickup</Text>
              <Text style={styles.value} numberOfLines={2}>
                {params.pickupAddress || params.pickup || "-"}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            {!!params.date && (
              <View style={styles.chip}>
                <Ionicons name="calendar" size={14} color={C.blue} />
                <Text style={styles.chipText}>{params.date}</Text>
              </View>
            )}
            {!!params.time && (
              <View style={styles.chip}>
                <Ionicons name="time" size={14} color={C.blue} />
                <Text style={styles.chipText}>{params.time}</Text>
              </View>
            )}
            {km !== null && (
              <View style={styles.chip}>
                <Ionicons name="navigate" size={14} color={C.blue} />
                <Text style={styles.chipText}>{km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`} away</Text>
              </View>
            )}
          </View>

          <View style={styles.btnRow}>
            {!!params.passengerPhone && (
              <TouchableOpacity style={styles.secondaryBtn} onPress={callPassenger} activeOpacity={0.85}>
                <Ionicons name="call" size={18} color={C.blue} />
                <Text style={styles.secondaryText}>Call</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.primaryBtn, !pickupCoords && { opacity: 0.5 }]}
              onPress={openDirections}
              disabled={!pickupCoords}
              activeOpacity={0.9}
            >
              <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryGrad}>
                <Ionicons name="navigate" size={18} color="#FFFFFF" />
                <Text style={styles.primaryText}>Get directions</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F6FA" },
  headerGrad: { borderBottomLeftRadius: 24, borderBottomRightRadius: 24, zIndex: 2 },
  header: { paddingTop: 54, paddingHorizontal: 20, paddingBottom: 18, flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center", justifyContent: "center",
  },
  eyebrow: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.85)", letterSpacing: 1, textTransform: "uppercase" },
  headertitle: { fontSize: 22, fontWeight: "800", color: "#FFFFFF" },

  map: { flex: 1, marginTop: -24 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 30 },
  emptyText: { marginTop: 10, textAlign: "center", color: C.muted, fontSize: 14, fontWeight: "600", lineHeight: 20 },

  fitBtn: {
    position: "absolute", right: 18, bottom: 250,
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center",
    elevation: 5, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
  },

  card: {
    position: "absolute", left: 14, right: 14, bottom: 24,
    backgroundColor: "#FFFFFF", borderRadius: 22, padding: 16,
    elevation: 8, shadowColor: "#0F1B2D", shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: 6 },
  },
  row: { flexDirection: "row", alignItems: "center" },
  iconWrap: { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 12, color: C.muted, fontWeight: "600", marginBottom: 2 },
  value: { fontSize: 15, color: C.ink, fontWeight: "800" },

  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#F7F9FC", borderRadius: 12, paddingVertical: 7, paddingHorizontal: 10,
  },
  chipText: { fontSize: 12.5, fontWeight: "700", color: C.ink },

  btnRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  secondaryBtn: {
    height: 50, paddingHorizontal: 18, borderRadius: 25,
    backgroundColor: C.blueSoft, flexDirection: "row", alignItems: "center", gap: 6,
  },
  secondaryText: { color: C.blue, fontWeight: "800", fontSize: 15 },
  primaryBtn: { flex: 1, height: 50, borderRadius: 25, overflow: "hidden" },
  primaryGrad: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  primaryText: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
});
