// components/Skeleton.tsx
// Shimmering "skeleton" placeholders shown while a screen is loading.
// One shared animation drives every box so they all shimmer in sync
// and it stays cheap (native driver, no extra packages).
//
// Usage:
//   {loading ? <SkeletonList count={5} /> : <FlatList ... />}
//   {loading ? <SkeletonStat /> : <YourStatCard />}

import React, { useEffect, useRef } from "react";
import {
  Animated,
  DimensionValue,
  Easing,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const BASE = "#E3E9F1";
const SHINE = "rgba(255,255,255,0.75)";
const SWEEP = 260; // width of the moving shine

/* ---------- one shared shimmer loop ---------- */
const progress = new Animated.Value(0);
let users = 0;
let loop: Animated.CompositeAnimation | null = null;

function useSharedShimmer() {
  useEffect(() => {
    users += 1;
    if (users === 1) {
      progress.setValue(0);
      loop = Animated.loop(
        Animated.timing(progress, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      );
      loop.start();
    }
    return () => {
      users -= 1;
      if (users === 0 && loop) {
        loop.stop();
        loop = null;
      }
    };
  }, []);
  return progress;
}

/* ---------- basic block ---------- */
export function SkeletonBox({
  width = "100%",
  height = 14,
  radius = 8,
  style,
}: {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const p = useSharedShimmer();
  const translateX = p.interpolate({
    inputRange: [0, 1],
    outputRange: [-SWEEP, 420],
  });

  return (
    <View
      style={[
        { width, height, borderRadius: radius, backgroundColor: BASE, overflow: "hidden" },
        style,
      ]}
    >
      <Animated.View
        style={[StyleSheet.absoluteFill, { width: SWEEP, transform: [{ translateX }] }]}
      >
        <LinearGradient
          colors={["transparent", SHINE, "transparent"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

export const SkeletonCircle = ({ size = 40, style }: { size?: number; style?: StyleProp<ViewStyle> }) => (
  <SkeletonBox width={size} height={size} radius={size / 2} style={style} />
);

/* ---------- ready-made shapes ---------- */

/** A list card: avatar + two lines on top, divider, label + price row below. */
export function SkeletonCard({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[s.card, style]}>
      <View style={s.row}>
        <SkeletonCircle size={40} />
        <View style={{ flex: 1, marginLeft: 12, gap: 8 }}>
          <SkeletonBox width="65%" height={14} />
          <SkeletonBox width="40%" height={11} />
        </View>
        <SkeletonBox width={64} height={22} radius={11} />
      </View>
      <View style={s.divider} />
      <View style={[s.row, { justifyContent: "space-between" }]}>
        <View style={{ gap: 7 }}>
          <SkeletonBox width={70} height={10} />
          <SkeletonBox width={120} height={14} />
        </View>
        <View style={{ gap: 7, alignItems: "flex-end" }}>
          <SkeletonBox width={50} height={10} />
          <SkeletonBox width={90} height={18} />
        </View>
      </View>
    </View>
  );
}

/** Several cards stacked — drop-in replacement for a loading spinner. */
export function SkeletonList({
  count = 5,
  style,
  cardStyle,
}: {
  count?: number;
  style?: StyleProp<ViewStyle>;
  cardStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ paddingTop: 4 }, style]}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} style={cardStyle} />
      ))}
    </View>
  );
}

/** Placeholder for a stats / income card. */
export function SkeletonStat({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[s.card, { marginHorizontal: 0, marginTop: 0, gap: 10 }, style]}>
      <SkeletonBox width={90} height={11} />
      <SkeletonBox width="60%" height={26} radius={10} />
      <SkeletonBox width={70} height={11} />
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 18,
    padding: 16,
    shadowColor: "#0F1B2D",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  row: { flexDirection: "row", alignItems: "center" },
  divider: { height: 1, backgroundColor: "#EEF2F7", marginVertical: 14 },
});

export default SkeletonList;
