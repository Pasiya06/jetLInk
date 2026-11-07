// components/RouteMapModal.tsx
// Bottom sheet with a map of one bus schedule:
//   green pin = pickup, blue pins = stops (in order), red pin = drop-off,
//   and a line joining them in travel order. Below the map, the same route
//   as a list with the times.

import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Polyline, MapViewHandle } from "./OSMMap";
import { findPlace, splitStops, displayName, Place } from "../utils/placeGeocode";
import { C } from "./JetUI";

export type RouteInfo = {
  title?: string;          // e.g. "Super Line · NB-1234"
  pickup?: string;
  drop?: string;
  stops?: string;          // "KADAWATHA,KEGALLE"
  departure?: string;      // "08:30 AM"
  arrival?: string;        // "12:15 PM"
};

type Point = {
  kind: "pickup" | "stop" | "drop";
  label: string;           // shown name
  place: Place | null;     // null = couldn't be placed on the map
  index?: number;          // stop number
};

const COLORS = { pickup: "#159B79", stop: "#2F80ED", drop: "#E5484D" };

export default function RouteMapModal({
  route,
  onClose,
}: {
  route: RouteInfo | null;
  onClose: () => void;
}) {
  const mapRef = useRef<MapViewHandle>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(false);

  // Look up the coordinates every time a schedule is opened
  useEffect(() => {
    if (!route) return;
    let cancelled = false;
    const stopNames = splitStops(route.stops).filter(
      (s) => s.toLowerCase() !== String(route.pickup ?? "").toLowerCase() &&
             s.toLowerCase() !== String(route.drop ?? "").toLowerCase()
    );
    const wanted: Omit<Point, "place">[] = [
      { kind: "pickup", label: displayName(route.pickup) },
      ...stopNames.map((s, i) => ({ kind: "stop" as const, label: displayName(s), index: i + 1 })),
      { kind: "drop", label: displayName(route.drop) },
    ];
    const raw = [route.pickup, ...stopNames, route.drop];

    setPoints(wanted.map((w) => ({ ...w, place: null })));
    setLoading(true);
    (async () => {
      const found: Point[] = [];
      for (let i = 0; i < wanted.length; i++) {
        const place = await findPlace(raw[i]);
        if (cancelled) return;
        found.push({ ...wanted[i], place });
        // Show each point as soon as it is found
        setPoints([...found, ...wanted.slice(i + 1).map((w) => ({ ...w, place: null }))]);
      }
      setLoading(false);
      const coords = found
        .filter((p) => p.place)
        .map((p) => ({ latitude: p.place!.lat, longitude: p.place!.lng }));
      if (coords.length === 1) {
        mapRef.current?.animateToRegion({ ...coords[0], latitudeDelta: 0.3, longitudeDelta: 0.3 }, 400);
      } else if (coords.length > 1) {
        mapRef.current?.fitToCoordinates(coords, {
          edgePadding: { top: 50, right: 40, bottom: 40, left: 40 },
          animated: true,
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [route]);

  const onMap = points.filter((p) => p.place);

  return (
    <Modal visible={!!route} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close map" />
        <View style={s.sheet}>
          <View style={s.handle} />

          <View style={s.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.eyebrow}>Bus route</Text>
              <Text style={s.title} numberOfLines={1}>
                {displayName(route?.pickup)} → {displayName(route?.drop)}
              </Text>
              {!!route?.title && <Text style={s.sub} numberOfLines={1}>{route.title}</Text>}
            </View>
            <TouchableOpacity onPress={onClose} style={s.close} accessibilityLabel="Close">
              <Ionicons name="close" size={22} color={C.ink} />
            </TouchableOpacity>
          </View>

          <View style={s.mapWrap}>
            <MapView ref={mapRef} style={StyleSheet.absoluteFill}>
              {onMap.length > 1 && (
                <Polyline
                  coordinates={onMap.map((p) => ({ latitude: p.place!.lat, longitude: p.place!.lng }))}
                  strokeColor="#155B8A"
                  strokeWidth={4}
                />
              )}
              {onMap.map((p, i) => (
                <Marker
                  key={`${p.kind}-${i}`}
                  coordinate={{ latitude: p.place!.lat, longitude: p.place!.lng }}
                  pinColor={COLORS[p.kind]}
                  title={p.kind === "pickup" ? `Pickup: ${p.label}` : p.kind === "drop" ? `Drop-off: ${p.label}` : `Stop ${p.index}: ${p.label}`}
                  description={p.kind === "pickup" ? route?.departure : p.kind === "drop" ? route?.arrival : undefined}
                />
              ))}
            </MapView>
            {loading && (
              <View style={s.loadingChip}>
                <ActivityIndicator size="small" color={C.blue} />
                <Text style={s.loadingText}>Finding places…</Text>
              </View>
            )}
          </View>

          <View style={s.legend}>
            <Legend color={COLORS.pickup} text="Pickup" />
            <Legend color={COLORS.stop} text="Stops" />
            <Legend color={COLORS.drop} text="Drop-off" />
          </View>

          <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
            {points.map((p, i) => (
              <View key={`${p.kind}-${i}`} style={s.stopRow}>
                <View style={s.rail}>
                  <View style={[s.dot, { backgroundColor: COLORS[p.kind] }]}>
                    {p.kind === "stop" && <Text style={s.dotText}>{p.index}</Text>}
                  </View>
                  {i < points.length - 1 && <View style={s.railLine} />}
                </View>
                <View style={{ flex: 1, paddingBottom: 14 }}>
                  <Text style={s.stopKind}>
                    {p.kind === "pickup" ? "Pickup" : p.kind === "drop" ? "Drop-off" : `Stop ${p.index}`}
                  </Text>
                  <Text style={s.stopName}>{p.label || "—"}</Text>
                  {!loading && !p.place && <Text style={s.notFound}>Not shown on the map (place not found)</Text>}
                </View>
                {p.kind === "pickup" && !!route?.departure && <Text style={s.time}>{route.departure}</Text>}
                {p.kind === "drop" && !!route?.arrival && <Text style={s.time}>{route.arrival}</Text>}
              </View>
            ))}
            {points.length === 2 && !loading && (
              <Text style={s.note}>This bus has no stops listed between pickup and drop-off.</Text>
            )}
            {!loading && onMap.length > 1 && (
              <Text style={s.note}>The line joins the places in travel order; it is not the exact road.</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function Legend({ color, text }: { color: string; text: string }) {
  return (
    <View style={s.legendItem}>
      <View style={[s.legendDot, { backgroundColor: color }]} />
      <Text style={s.legendText}>{text}</Text>
    </View>
  );
}

/** Small "Map" button used on the schedule cards */
export function RouteMapButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={s.mapBtn} activeOpacity={0.8} accessibilityLabel="View route on map">
      <Ionicons name="map-outline" size={14} color="#fff" />
      <Text style={s.mapBtnText}>Map</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(15,27,45,0.45)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 8,
    maxHeight: "90%",
  },
  handle: { alignSelf: "center", width: 40, height: 5, borderRadius: 3, backgroundColor: "#DCE3EC", marginBottom: 10 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  eyebrow: { fontSize: 12, fontWeight: "700", color: C.muted, letterSpacing: 0.3 },
  title: { fontSize: 18, fontWeight: "800", color: C.navy, marginTop: 2 },
  sub: { fontSize: 13, fontWeight: "600", color: C.muted, marginTop: 2 },
  close: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.bg, alignItems: "center", justifyContent: "center", marginLeft: 10 },
  mapWrap: { height: 300, borderRadius: 18, overflow: "hidden", backgroundColor: "#E8EEF5" },
  loadingChip: {
    position: "absolute", top: 10, alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#fff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, elevation: 3,
    shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  loadingText: { fontSize: 12, fontWeight: "700", color: C.blue },
  legend: { flexDirection: "row", gap: 16, marginTop: 10, marginBottom: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, fontWeight: "700", color: C.muted },
  stopRow: { flexDirection: "row", alignItems: "flex-start" },
  rail: { width: 26, alignItems: "center", marginRight: 10 },
  dot: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
  dotText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  railLine: { width: 2, flex: 1, minHeight: 22, backgroundColor: "#DCE3EC", marginVertical: 2 },
  stopKind: { fontSize: 11, fontWeight: "700", color: C.muted },
  stopName: { fontSize: 15, fontWeight: "800", color: C.ink },
  notFound: { fontSize: 11, fontWeight: "600", color: C.amber, marginTop: 2 },
  time: { fontSize: 14, fontWeight: "800", color: C.blue, marginLeft: 8 },
  note: { fontSize: 12, color: C.muted, marginTop: 2 },
  mapBtn: {
    flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#155B8A",
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14, marginLeft: 8,
  },
  mapBtnText: { color: "#fff", fontSize: 12, fontWeight: "800" },
});
