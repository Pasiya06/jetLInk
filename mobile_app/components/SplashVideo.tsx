// Branded splash video shown once when the app opens.
// The native splash stays up until the video is ready, so there is no blank flash,
// and the video fades out into the app when it ends.
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import * as SplashScreen from "expo-splash-screen";

const SPLASH_VIDEO = require("../assets/videos/jetlink_splash.mp4");

// If anything goes wrong, never keep the user waiting longer than this
const MAX_WAIT_MS = 6000;

export default function SplashVideo({ onFinish }: { onFinish: () => void }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const finished = useRef(false);

  const player = useVideoPlayer(SPLASH_VIDEO, (p) => {
    p.loop = false;
    p.muted = true;
    p.play();
  });

  const skipRef = useRef<() => void>(() => {});

  useEffect(() => {
    const hideNativeSplash = () => {
      SplashScreen.hideAsync().catch(() => {});
    };

    const finish = () => {
      if (finished.current) return;
      finished.current = true;
      hideNativeSplash();
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => onFinish());
    };

    const statusSub = player.addListener("statusChange", ({ status }) => {
      if (status === "readyToPlay") hideNativeSplash();
      if (status === "error") finish();
    });
    const endSub = player.addListener("playToEnd", finish);
    skipRef.current = finish; // tap anywhere to skip
    const safety = setTimeout(finish, MAX_WAIT_MS);

    return () => {
      statusSub.remove();
      endSub.remove();
      clearTimeout(safety);
    };
  }, [player]);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.wrap, { opacity }]}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
        allowsPictureInPicture={false}
      />
      {/* Tap anywhere to skip the intro */}
      <Pressable style={StyleSheet.absoluteFill} onPress={() => skipRef.current()} accessibilityLabel="Skip intro">
        <Text style={styles.skip}>Tap to skip</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "#ffffff",
    zIndex: 999,
    elevation: 999,
  },
  skip: {
    position: "absolute",
    bottom: 48,
    alignSelf: "center",
    color: "#8A97A8",
    fontSize: 13,
    fontWeight: "600",
  },
});
