import React, { useCallback, useMemo, useState } from 'react';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather, FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Public details of another passenger
interface Friend {
  _id: string;
  passengerId?: number;
  firstName: string;
  lastName: string;
  email: string;
}

const FriendsScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const myId = String(params.Pid ?? "");

  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // All passengers except the one who is logged in
  const loadFriends = useCallback(async () => {
    if (!myId) {
      setError("Your login details are missing. Please sign in again.");
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      setError("");
      const res = await fetch(`${API_URL}/passengers/others/${encodeURIComponent(myId)}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Could not load passengers");
      setFriends(Array.isArray(data.data) ? data.data : []);
    } catch (e: any) {
      setError(e?.message || "Unable to connect to server");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [myId]);

  useFocusEffect(
    useCallback(() => {
      loadFriends();
    }, [loadFriends])
  );

  const shown = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter((f) =>
      `${f.firstName} ${f.lastName} ${f.email}`.toLowerCase().includes(q)
    );
  }, [friends, searchQuery]);

  const renderFriendItem = ({ item }: { item: Friend }) => {
    const initials = `${item.firstName?.charAt(0) ?? ""}${item.lastName?.charAt(0) ?? ""}`.toUpperCase();
    return (
      <View style={styles.friendRow}>
        <View style={styles.profileCircle}>
          <Text style={styles.initials}>{initials || "?"}</Text>
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.friendName} numberOfLines={1}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.friendEmail} numberOfLines={1}>{item.email}</Text>
        </View>

        <TouchableOpacity
          style={styles.iconButton}
          accessibilityLabel={`Email ${item.firstName}`}
          onPress={() => Linking.openURL(`mailto:${item.email}`)}
        >
          <MaterialCommunityIcons name="email-outline" size={24} color="#FFA500" />
        </TouchableOpacity>
      </View>
    );
  };

  const navParams = {
    Pid: params.Pid,
    Pid1: params.Pid1,
    pfirstName: params.pfirstName,
    plastName: params.plastName,
    pphoneNumber: params.pphoneNumber,
    pemail: params.pemail,
    NIC: params.NIC,
  };

  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={["#173C79", "#155B8A", "#159B79"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.title}>Jetlink</Text>
        </LinearGradient>

        {/* Sub-header: title or search */}
        <View style={styles.subHeader}>
          {isSearching ? (
            <TextInput
              style={styles.searchBarInput}
              placeholder="Search passengers..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
            />
          ) : (
            <Text style={styles.subHeaderTitle}>
              Friends{!loading && !error ? `  ·  ${friends.length}` : ""}
            </Text>
          )}
          <TouchableOpacity
            onPress={() => {
              if (isSearching) setSearchQuery("");
              setIsSearching(!isSearching);
            }}
          >
            <FontAwesome name={isSearching ? "close" : "search"} size={22} color="#173C79" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#159B79" />
            <Text style={styles.muted}>Loading passengers…</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Ionicons name="alert-circle-outline" size={44} color="#E5484D" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retry} onPress={() => { setLoading(true); loadFriends(); }}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            style={styles.list}
            data={shown}
            renderItem={renderFriendItem}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 6, paddingBottom: 200, flexGrow: 1 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadFriends(); }} />
            }
            ListEmptyComponent={
              <View style={styles.center}>
                <Ionicons name="people-outline" size={48} color="#98A2B3" />
                <Text style={styles.muted}>
                  {searchQuery ? "No passengers match your search." : "No other passengers yet."}
                </Text>
              </View>
            }
          />
        )}

        {/* Bottom nav */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.item} onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={24} color="#8A8A8A" />
            <Text style={styles.label1}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => setIsSearching(true)}>
            <FontAwesome name="search" size={22} color="#8A8A8A" />
            <Text style={styles.label1}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.centerButton} onPress={() => router.push({ pathname: "/passenger/index1", params: navParams })}>
            <Ionicons name="home-outline" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => router.push({ pathname: "/notifications", params: { role: "passenger" } })}>
            <Ionicons name="notifications-outline" size={24} color="#8A8A8A" />
            <Text style={styles.label1}>Alerts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => router.push({ pathname: "/passenger/passengerProfile", params: { role: "passenger", NIC: params.NIC } })}>
            <Feather name="user" size={24} color="#8A8A8A" />
            <Text style={styles.label1}>Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerGraphic}>
          <LinearGradient colors={["#173C79", "#155B8A", "#159B79"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.submitGradient} />
        </View>
        <View style={styles.footerGraphic1}>
          <LinearGradient colors={["#173C79", "#155B8A", "#159B79"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.submitGradient} />
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    paddingBottom: 24,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#ffffff', letterSpacing: 0.5 },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  subHeaderTitle: { fontSize: 18, fontWeight: '700', color: '#173C79' },
  searchBarInput: {
    flex: 1,
    height: 42,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
  },

  list: { flex: 1, paddingHorizontal: 15 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  muted: { color: '#64748B', fontSize: 14, textAlign: 'center' },
  errorText: { color: '#B4232A', textAlign: 'center' },
  retry: { backgroundColor: '#159B79', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20 },
  retryText: { color: '#fff', fontWeight: '700' },

  friendRow: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: '#32CD32',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  profileCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#32CD32',
    backgroundColor: '#F0FBF2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: { color: '#159B79', fontWeight: '800', fontSize: 15 },
  friendName: { fontSize: 16.5, color: '#0047AB', fontWeight: '600' },
  friendEmail: { fontSize: 12.5, color: '#64748B', marginTop: 2 },
  iconButton: { marginLeft: 10, padding: 4 },

  bottomNav: {
    position: "absolute",
    bottom: 15,
    left: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 60,
    height: 75,
    backgroundColor: "#fff",
    borderRadius: 25,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 10,
  },
  item: { alignItems: "center", justifyContent: "center", flex: 1 },
  label1: { marginTop: 4, fontSize: 13, color: "#8A8A8A" },
  centerButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#2F80ED",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -28,
    shadowColor: "#2F80ED",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 12,
  },
  submitGradient: { paddingVertical: 16 },
  footerGraphic: { position: 'absolute', bottom: 0, width: '100%', overflow: 'hidden' },
  footerGraphic1: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    overflow: 'hidden',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
});

export default FriendsScreen;
