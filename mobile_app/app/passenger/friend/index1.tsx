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
import SearchPanel from "../../../components/SearchPanel";
import { Feather, FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenHeader, SearchBox, SectionLabel, Pill, EmptyState, Avatar, C, ui } from "../../../components/JetUI";

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
        <Avatar name={`${item.firstName ?? ""} ${item.lastName ?? ""}`} size={46} />

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
          <MaterialCommunityIcons name="email-outline" size={21} color={C.blue} />
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
        <ScreenHeader eyebrow="Passengers on JetLink" title="Friends" />

        <View style={[ui.body, { paddingHorizontal: 16 }]}>
        <SearchBox value={searchQuery} onChangeText={setSearchQuery} placeholder="Search by name or email" />
        <SectionLabel
          style={{ marginTop: 18, marginBottom: 10 }}
          right={!loading && !error ? <Pill text={`${shown.length} ${shown.length === 1 ? "person" : "people"}`} /> : null}
        >
          People
        </SectionLabel>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={C.blue} />
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
            contentContainerStyle={{ paddingBottom: 200, flexGrow: 1 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadFriends(); }} />
            }
            ListEmptyComponent={
              <EmptyState
                icon={<Ionicons name="people-outline" size={28} color={C.amber} />}
                title={searchQuery ? "No matches" : "No other passengers yet"}
                subtitle={searchQuery ? "No passengers match your search." : "Other passengers will appear here."}
              />
            }
          />
        )}

        </View>

        <SearchPanel
          visible={isSearching}
          query={searchQuery}
          onChangeQuery={setSearchQuery}
          onClose={() => { setIsSearching(false); setSearchQuery(""); }}
          role={"passenger"}
          params={params}
          listLabel="passengers"
        />

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
  container: { flex: 1, backgroundColor: C.bg },
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

  list: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  muted: { color: '#64748B', fontSize: 14, textAlign: 'center' },
  errorText: { color: '#B4232A', textAlign: 'center' },
  retry: { backgroundColor: '#159B79', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20 },
  retryText: { color: '#fff', fontWeight: '700' },

  friendRow: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: 10,
    borderRadius: 18,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#0F1B2D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
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
  friendName: { fontSize: 16, fontWeight: '800', color: C.ink },
  friendEmail: { fontSize: 12, fontWeight: '500', color: C.muted, marginTop: 1 },
  iconButton: { width: 44, height: 44, borderRadius: 13, backgroundColor: C.blueSoft, alignItems: 'center', justifyContent: 'center' },

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
