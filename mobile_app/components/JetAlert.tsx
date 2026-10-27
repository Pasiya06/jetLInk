import React, { useEffect, useRef, useState } from "react";
import {
  Alert as NativeAlert,
  AlertButton,
  AlertOptions,
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { C, GRADIENT } from "./JetUI";

/**
 * JetLink themed alert.
 *
 * Drop-in replacement for React Native's Alert:
 *   import { Alert } from "../components/JetAlert";
 *   Alert.alert("Title", "Message", [{ text: "Cancel", style: "cancel" }, { text: "OK", onPress }]);
 *
 * <JetAlertHost /> is mounted once in app/_layout.tsx.
 */

type Variant = "success" | "error" | "warning" | "info";

type AlertRequest = {
  id: number;
  title: string;
  message?: string;
  buttons: AlertButton[];
  options?: AlertOptions;
  variant: Variant;
};

let nextId = 1;
let queue: AlertRequest[] = [];
let hostListener: ((queue: AlertRequest[]) => void) | null = null;

const notify = () => hostListener?.([...queue]);

/* Pick a look from the words in the alert */
const SUCCESS_WORDS = /\b(success|successful|successfully|saved|updated|added|deleted|removed|verified|booked|confirmed|sent|done|welcome|copied|paid|complete|completed|thank)\b/i;
const ERROR_WORDS = /\b(error|failed|fail|invalid|unable|could ?not|couldn'?t|can'?t|cannot|expired|denied|not found|not available|wrong|incorrect|declined|network|problem|no internet)\b/i;
const WARNING_WORDS = /\b(confirm|sure|required|missing|please|permission|warning|delete|remove|logout|log out|sign out|cancel|emergency|limit|full|already|select|choose|enter)\b/i;

const guessVariant = (title: string, message = "", buttons: AlertButton[]): Variant => {
  const text = `${title} ${message}`;
  const t = title || "";
  if (ERROR_WORDS.test(t)) return "error";
  if (SUCCESS_WORDS.test(t) && !/\b(delete|remove)\b.*\?/i.test(text)) return "success";
  if (buttons.some((b) => b.style === "destructive")) return "warning";
  if (WARNING_WORDS.test(t)) return "warning";
  if (ERROR_WORDS.test(text)) return "error";
  if (SUCCESS_WORDS.test(text)) return "success";
  if (WARNING_WORDS.test(text) || buttons.length > 1) return "warning";
  return "info";
};

const VARIANTS: Record<Variant, { icon: React.ComponentProps<typeof Ionicons>["name"]; color: string; soft: string }> = {
  success: { icon: "checkmark-circle", color: C.green, soft: C.greenSoft },
  error: { icon: "close-circle", color: C.red, soft: C.redSoft },
  warning: { icon: "alert-circle", color: C.amber, soft: C.amberSoft },
  info: { icon: "information-circle", color: C.blue, soft: C.blueSoft },
};

export const Alert = {
  alert(title: string, message?: string, buttons?: AlertButton[], options?: AlertOptions) {
    const list = buttons && buttons.length ? buttons : [{ text: "OK" }];

    // Host not mounted (should not happen) -> fall back to the system alert
    if (!hostListener) {
      NativeAlert.alert(title, message, buttons, options);
      return;
    }

    queue.push({
      id: nextId++,
      title: String(title ?? ""),
      message: message != null ? String(message) : undefined,
      buttons: list,
      options,
      variant: guessVariant(String(title ?? ""), message != null ? String(message) : "", list),
    });
    notify();
  },
};

export default Alert;

/* ---------- Host ---------- */

export function JetAlertHost() {
  const [items, setItems] = useState<AlertRequest[]>([]);
  const [visible, setVisible] = useState(false);
  const current = items[0];

  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;
  const iconPop = useRef(new Animated.Value(0)).current;
  const closing = useRef(false);

  useEffect(() => {
    hostListener = setItems;
    setItems([...queue]);
    return () => {
      if (hostListener === setItems) hostListener = null;
    };
  }, []);

  // Animate in whenever a new alert reaches the front of the queue
  useEffect(() => {
    if (!current) return;
    closing.current = false;
    setVisible(true);
    fade.setValue(0);
    scale.setValue(0.85);
    iconPop.setValue(0);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 7, tension: 80, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(90),
        Animated.spring(iconPop, { toValue: 1, friction: 4, tension: 90, useNativeDriver: true }),
      ]),
    ]).start();
  }, [current?.id]);

  const close = (after?: () => void) => {
    if (closing.current || !current) return;
    closing.current = true;
    Animated.parallel([
      Animated.timing(fade, { toValue: 0, duration: 140, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0.92, duration: 140, useNativeDriver: true }),
    ]).start(() => {
      queue = queue.filter((q) => q.id !== current.id);
      if (!queue.length) setVisible(false);
      setItems([...queue]);
      // Run the button action after the alert is gone (safe for navigation / next alert)
      if (after) setTimeout(after, 30);
    });
  };

  if (!current) return null;

  const v = VARIANTS[current.variant];
  const buttons = current.buttons;
  const cancelButton = buttons.find((b) => b.style === "cancel");
  const cancelable = current.options?.cancelable ?? false;
  const stacked = buttons.length > 2 || buttons.some((b) => (b.text || "").length > 14);

  // Show cancel first in a row, last in a column
  const ordered = stacked
    ? [...buttons.filter((b) => b.style !== "cancel"), ...buttons.filter((b) => b.style === "cancel")]
    : [...buttons.filter((b) => b.style === "cancel"), ...buttons.filter((b) => b.style !== "cancel")];

  const onBackdrop = () => {
    if (cancelable) close(current.options?.onDismiss);
  };

  const onBack = () => {
    if (cancelButton) close(cancelButton.onPress as any);
    else if (cancelable) close(current.options?.onDismiss);
    else if (buttons.length === 1) close(buttons[0].onPress as any);
  };

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onBack}>
      <Animated.View style={[styles.backdrop, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onBackdrop} />

        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          <View style={[styles.topBand, { backgroundColor: v.soft }]} />

          <Animated.View
            style={[
              styles.iconRing,
              { backgroundColor: v.soft, transform: [{ scale: iconPop.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }] },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: v.color }]}>
              <Ionicons name={v.icon} size={34} color="#FFFFFF" />
            </View>
          </Animated.View>

          {!!current.title && <Text style={styles.title}>{current.title}</Text>}
          {!!current.message && <Text style={styles.message}>{current.message}</Text>}

          <View style={[styles.buttons, stacked ? styles.buttonsColumn : styles.buttonsRow]}>
            {ordered.map((b, i) => {
              const onPress = () => close(b.onPress as any);
              const label = b.text || "OK";

              if (b.style === "cancel") {
                return (
                  <TouchableOpacity
                    key={`${label}-${i}`}
                    style={[styles.btn, styles.btnCancel, !stacked && styles.btnFlex]}
                    onPress={onPress}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.btnCancelText}>{label}</Text>
                  </TouchableOpacity>
                );
              }

              if (b.style === "destructive") {
                return (
                  <TouchableOpacity
                    key={`${label}-${i}`}
                    style={[styles.btn, styles.btnDanger, !stacked && styles.btnFlex]}
                    onPress={onPress}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.btnText}>{label}</Text>
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={`${label}-${i}`}
                  style={[styles.btn, styles.btnPrimaryWrap, !stacked && styles.btnFlex]}
                  onPress={onPress}
                  activeOpacity={0.85}
                >
                  <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btnGradient}>
                    <Text style={styles.btnText}>{label}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15,27,45,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    paddingHorizontal: 22,
    paddingBottom: 20,
    paddingTop: 0,
    alignItems: "center",
    overflow: "hidden",
    elevation: 14,
    shadowColor: "#0F1B2D",
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  },
  topBand: { position: "absolute", top: 0, left: 0, right: 0, height: 62 },
  iconRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 5,
    borderColor: "#FFFFFF",
  },
  iconCircle: { width: 62, height: 62, borderRadius: 31, alignItems: "center", justifyContent: "center" },
  title: { marginTop: 14, fontSize: 19, fontWeight: "800", color: C.ink, textAlign: "center" },
  message: { marginTop: 8, fontSize: 14.5, lineHeight: 21, color: C.muted, textAlign: "center" },

  buttons: { alignSelf: "stretch", marginTop: 22, gap: 10 },
  buttonsRow: { flexDirection: "row" },
  buttonsColumn: { flexDirection: "column" },
  btn: { height: 50, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  btnFlex: { flex: 1 },
  btnPrimaryWrap: { overflow: "hidden" },
  btnGradient: { alignSelf: "stretch", flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 14 },
  btnDanger: { backgroundColor: C.red, paddingHorizontal: 14 },
  btnCancel: { backgroundColor: "#F3F6FA", borderWidth: 1, borderColor: "#DCE3EC", paddingHorizontal: 14 },
  btnText: { color: "#FFFFFF", fontWeight: "800", fontSize: 15.5 },
  btnCancelText: { color: C.muted, fontWeight: "800", fontSize: 15.5 },
});
