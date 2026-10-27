import React, { useState, useCallback } from 'react';

import {
  Stack,
  useRouter,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";

import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import SearchPanel, { filterBySearch } from "../../../components/SearchPanel";

import {
  Ionicons,
  Feather,
  FontAwesome,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import { LinearGradient } from 'expo-linear-gradient';
import { ScreenHeader, EmptyState, ParcelRow, C } from "../../../components/JetUI";

interface parcel {
  _id: string;
  parcelId: string;
  sendername: string;
  Smobilenumber?: string;
  Semail?: string;
  receivername?: string;
  Rmobilenumber?: string;
  Remail?: string;
  weight?: string;
  pickup?: string;
  drop?: string;
  date?: string;
  time?: string;
  Bnumber?: string;
  totalFare?: number;
}

type ParcelListItem =
  | {
      type: "date";
      date: string;
      title: string;
    }
  | {
      type: "parcel";
      parcel: parcel;
    };

const JetLinkInterface: React.FC = () => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('');
  const [parcelData, setParcelData] = useState<parcel[]>([]);
  const [deliveryData, setDeliveryData] = useState<parcel[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isactiveTab, setIsactiveTab] = useState<boolean>(true);

  const Semail = params.pemail as string;

  const getParcelByEmailAndUsed = async () => {
    try {
      const status = "Pending";
      const response = await fetch(`${API_URL}/parcel/${encodeURIComponent(Semail)}/${status}`);
      const data = await response.json();
      console.log("Pending Parcel Data:", data);
      if (!response.ok) {
        throw new Error(data.message || "Failed to get pending parcels");
      }

      setParcelData(data.data || []);
    }

    catch (error) {
      console.log("Get Pending Parcel Error:", error);
      setParcelData([]);
    }
  };

  const getParcelByEmailAnddelivery = async () => {
    try {
      const status = "Delivered";
      const response = await fetch(`${API_URL}/parcel/${encodeURIComponent(Semail)}/${status}`);
      const data = await response.json();
      console.log("Delivered Parcel Data:", data);
      if (!response.ok) {
        throw new Error(data.message || "Failed to get delivered parcels");
      }

      setDeliveryData(data.data || []);
    }

    catch (error) {
      console.log("Get Delivered Parcel Error:", error);
      setDeliveryData([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getParcelByEmailAndUsed();
      getParcelByEmailAnddelivery();
    }, [Semail])
  );

  const getDateOnly = (dateString: string) => {
    if (!dateString) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      return date;
    }

    const parts = dateString.split('/');

    if (parts.length === 3) {
      const month = Number(parts[0]);
      const day = Number(parts[1]);
      const year = Number(parts[2]);
      const date = new Date(
        year,
        month - 1,
        day
      );
      date.setHours(0, 0, 0, 0);
      return date;
    }

    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const getDateTitle = (dateString: string) => {
    const parcelDate = getDateOnly(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (parcelDate.getTime() === today.getTime()) {
      return "TODAY";
    }

    if (parcelDate.getTime() === tomorrow.getTime()) {
      return "TOMORROW";
    }

    return dateString;
  };

  const dateWiseParcels: ParcelListItem[] = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const grouped: Record<string, parcel[]> = {};
    parcelData.forEach((parcelItem) => {
      if (!parcelItem.date) {
        return;
      }

      const parcelDate = getDateOnly(parcelItem.date);

      if (parcelDate.getTime() < today.getTime()) {
        return;
      }

      if (!grouped[parcelItem.date]) {
        grouped[parcelItem.date] = [];
      }

      grouped[parcelItem.date].push(parcelItem);
    });

    const sortedDates = Object.keys(grouped).sort((a, b) => {
      return (
        getDateOnly(a).getTime() -
        getDateOnly(b).getTime()
      );
    });

    const result: ParcelListItem[] = [];

    sortedDates.forEach((date) => {
      result.push({
        type: "date",
        date: date,
        title: getDateTitle(date),
      });

      const sortedParcels = [...grouped[date]].sort((a, b) => {
        return (
          (a.time || "") .localeCompare(b.time || "")
        );
      });

      sortedParcels.forEach((parcelItem) => {
        result.push({
          type: "parcel",
          parcel: parcelItem,
        });
      });
    });

    return result;
  }, [parcelData]);

  const dateWiseDeliveredParcels: ParcelListItem[] = React.useMemo(() => {
    const grouped: Record<string, parcel[]> = {};

    deliveryData.forEach((parcelItem) => {
      if (!parcelItem.date) {
        return;
      }

      if (!grouped[parcelItem.date]) {
        grouped[parcelItem.date] = [];
      }

      grouped[parcelItem.date].push(parcelItem);
    });

    const sortedDates = Object.keys(grouped).sort((a, b) => {
      return (
        getDateOnly(b).getTime() - getDateOnly(a).getTime()
      );
    });

    const result: ParcelListItem[] = [];

    sortedDates.forEach((date) => {
      result.push({
        type: "date",
        date: date,
        title: getDateTitle(date),
      });

      const sortedParcels = [...grouped[date]].sort((a, b) => {
        return (
          (b.time || "") .localeCompare(a.time || "")
        );
      });

      sortedParcels.forEach((parcelItem) => {
        result.push({
          type: "parcel",
          parcel: parcelItem,
        });
      });
    });

    return result;
  }, [deliveryData]);

  const openPendingParcel = (item: parcel) => {
    router.push({
      pathname: "/passenger/receipt/parcelQr",
      params: {
        parId: item._id,
        parcelId: item.parcelId,
        sendername: item.sendername,
        Smobilenumber: item.Smobilenumber || "",
        Semail: item.Semail || "",
        receivername: item.receivername || "",
        Rmobilenumber: item.Rmobilenumber || "",
        Remail: item.Remail || "",
        weight: item.weight || "",
        pickup: item.pickup || "",
        drop: item.drop || "",
        date: item.date || "",
        time: item.time || "",
        Bnumber: item.Bnumber || "",
        totalFare: item.totalFare || "",

        Pid: params.Pid,
        Pid1: params.Pid1,
        pfirstName: params.pfirstName,
        plastName: params.plastName,
        pemail: params.pemail,
        pphoneNumber: params.pphoneNumber,
      },
    });
  };

  const openDeliveredParcel = (item: parcel) => {
    router.push({
      pathname: "/passenger/receipt/deliveredParcel",
      params: {
        parId: item._id,
        parcelId: item.parcelId,
        sendername: item.sendername,
        Smobilenumber: item.Smobilenumber || "",
        Semail: item.Semail || "",
        receivername: item.receivername || "",
        Rmobilenumber: item.Rmobilenumber || "",
        Remail: item.Remail || "",
        weight: item.weight || "",
        pickup: item.pickup || "",
        drop: item.drop || "",
        date: item.date || "",
        time: item.time || "",
        Bnumber: item.Bnumber || "",
        totalFare: item.totalFare || "",
        // Passenger parameters

        Pid: params.Pid,
        Pid1: params.Pid1,
        pfirstName: params.pfirstName,
        plastName: params.plastName,
        pemail: params.pemail,
        pphoneNumber: params.pphoneNumber,
      },
    });
  };

  const renderPendingParcel = (item: parcel) => (
    <TouchableOpacity onPress={() =>
        openPendingParcel(item)
      }
    >

      <ParcelRow
        id={item.parcelId}
        from={item.pickup}
        to={item.drop}
        date={item.date}
        time={item.time}
        bus={item.Bnumber}
      />
    </TouchableOpacity>
  );

  const renderDateWiseParcel = ({item,}: {item: ParcelListItem;}) => {
    if (item.type === "date") {
      return (
        <View style={styles.dateHeader}>
          <Text style={styles.dateHeaderText}>
            {item.title}
          </Text>
        </View>
      );
    }

    return renderPendingParcel(item.parcel);
  };

  const renderDeliveredParcel = (item: parcel) => (
    <TouchableOpacity onPress={() => openDeliveredParcel(item)}>
      <ParcelRow
        id={item.parcelId}
        from={item.pickup}
        to={item.drop}
        date={item.date}
        time={item.time}
        bus={item.Bnumber}
        delivered
      />
    </TouchableOpacity>
  );

  const renderDateWiseDeliveredParcel = ({item,}: {item: ParcelListItem;}) => {
    if (item.type === "date") {
      return (
        <View style={styles.dateHeader}>
          <Text style={styles.dateHeaderText}>
            {item.title}
          </Text>
        </View>
      );
    }

    return renderDeliveredParcel(item.parcel);
  };

  return (
    <>
      <Stack.Screen options={{title: "", headerShown: false,}}/>
      <SafeAreaView style={styles.container}>

        <ScreenHeader eyebrow="Your parcels" title="Parcels" />

        <View style={styles.card}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, isactiveTab && styles.activeTabButton,]}
              onPress={() => setIsactiveTab(true)}
            >
              <Ionicons name="time-outline" size={17} color={isactiveTab ? "#FFFFFF" : C.blue} />
              <Text style={[styles.tabButtonText, isactiveTab && styles.activeTabButtonText,]}>
                Pending
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, !isactiveTab && styles.activeTabButton,]}
              onPress={() => setIsactiveTab(false)}
            >
              <Ionicons name="checkmark-done" size={17} color={!isactiveTab ? "#FFFFFF" : C.blue} />
              <Text style={[styles.tabButtonText, !isactiveTab && styles.activeTabButtonText,]}>
                Delivered
              </Text>
            </TouchableOpacity>
          </View>

          {isactiveTab && (

            <FlatList
              style={styles.svw}
              data={filterBySearch(dateWiseParcels, searchQuery)}
              renderItem={renderDateWiseParcel}
              keyExtractor={( item, index) => {
                if (item.type === "date") {
                  return `date-${item.date}`;
                }

                return `parcel-${item.parcel.parcelId}-${index}`;
              }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{paddingVertical: 10, paddingBottom: 180,}}
              ListEmptyComponent={
                <EmptyState
                  icon={<Feather name="gift" size={26} color={C.amber} />}
                  title="No pending parcels"
                  subtitle="Parcels you send will appear here."
                />
              }
            />
          )}

          {!isactiveTab && (
            <FlatList
              style={styles.svw}

              data={filterBySearch(dateWiseDeliveredParcels, searchQuery)}

              renderItem={
                renderDateWiseDeliveredParcel
              }

              keyExtractor={(
                item,
                index
              ) => {

                if (
                  item.type ===
                  "date"
                ) {

                  return `date-${item.date}`;

                }


                return `parcel-${item.parcel.parcelId}-${index}`;

              }}

              showsVerticalScrollIndicator={
                false
              }

              contentContainerStyle={{
                paddingVertical: 10,

                paddingBottom: 180,
              }}


              ListEmptyComponent={

                <EmptyState
                  icon={<Ionicons name="checkmark-done" size={28} color={C.amber} />}
                  title="No delivered parcels"
                  subtitle="Delivered parcels are listed here by date."
                />

              }

            />

          )}

        </View>


        {/* ==========================================
            SEARCH
        ========================================== */}

        <SearchPanel
          visible={isSearching}
          query={searchQuery}
          onChangeQuery={setSearchQuery}
          onClose={() => { setIsSearching(false); setSearchQuery(""); }}
          role={"passenger"}
          params={params}
          listLabel="parcels"
        />


        {/* ==========================================
            BOTTOM NAVIGATION
        ========================================== */}

        <View
          style={styles.bottomNav}
        >


          {/* BACK */}

          <TouchableOpacity
            style={styles.item}

            onPress={() => {

              setActiveTab("home");


              if (isSearching) {

                setIsSearching(false); setSearchQuery("");

              }

              else {

                router.push({

                  pathname:
                    "/passenger/receipt/index1",

                  params: {

                    Pid:
                      params.Pid,

                    Pid1:
                      params.Pid1,

                    pfirstName:
                      params.pfirstName,

                    plastName:
                      params.plastName,

                    pemail:
                      params.pemail,

                    pphoneNumber:
                      params.pphoneNumber,

                  },

                });

              }

            }}
          >

            <Ionicons
              name={
                isSearching
                  ? "arrow-back"
                  : "arrow-back-outline"
              }
              size={24}
              color={
                activeTab === "home"
                  ? "#0057D9"
                  : "#8A8A8A"
              }
            />

            <Text
              style={[
                styles.label1,

                activeTab === "home" &&
                  styles.activeLabel,
              ]}
            >
              Back
            </Text>

          </TouchableOpacity>


          {/* SEARCH */}

          <TouchableOpacity
            style={styles.item}

            onPress={() => {

              setActiveTab("routes");

              setIsSearching(
                !isSearching
              );

            }}
          >

            <FontAwesome
              name={
                isSearching
                  ? "close"
                  : "search"
              }
              size={24}
              color={
                activeTab === "routes"
                  ? "#0057D9"
                  : "#8A8A8A"
              }
            />

            <Text
              style={[
                styles.label1,

                activeTab === "routes" &&
                  styles.activeLabel,
              ]}
            >
              Search
            </Text>

          </TouchableOpacity>


          {/* CENTER HOME */}

          <TouchableOpacity
            style={
              styles.centerButton
            }

            onPress={() => {

              setActiveTab(
                "tickets"
              );

              router.push({

                pathname:
                  "/passenger/index1",

                params: {

                  Pid:
                    params.Pid,

                  Pid1:
                    params.Pid1,

                  pfirstName:
                    params.pfirstName,

                  plastName:
                    params.plastName,

                  pphoneNumber:
                    params.pphoneNumber,

                  pemail:
                    params.pemail,

                },

              });

            }}
          >

            <Ionicons
              name="home-outline"
              size={28}
              color="#fff"
            />

          </TouchableOpacity>


          {/* ALERTS */}

          <TouchableOpacity
            style={styles.item}

            onPress={() => {

              setActiveTab(
                "routes"
              );

              router.push({ pathname: "/notifications", params: { role: "passenger" } });

            }}
          >

            <Ionicons
              name="notifications-outline"
              size={24}
              color={
                activeTab === "alerts"
                  ? "#0057D9"
                  : "#8A8A8A"
              }
            />

            <Text
              style={[
                styles.label1,

                activeTab === "alerts" &&
                  styles.activeLabel,
              ]}
            >
              Alerts
            </Text>

          </TouchableOpacity>


          {/* PROFILE */}

          <TouchableOpacity
            style={styles.item}

            onPress={() => {

              setActiveTab(
                "profile"
              );

              router.push({ pathname: "/passenger/passengerProfile", params: { role: "passenger",NIC: params.NIC } });

            }}
          >

            <Feather
              name="user"
              size={24}
              color={
                activeTab === "profile"
                  ? "#0057D9"
                  : "#8A8A8A"
              }
            />

            <Text
              style={[
                styles.label1,

                activeTab === "profile" &&
                  styles.activeLabel,
              ]}
            >
              Profile
            </Text>
          </TouchableOpacity>
        </View>


        {/* ==========================================
            FOOTER GRAPHIC
        ========================================== */}

        <View style={styles.footerGraphic}>
          <LinearGradient
            colors={["#173C79","#155B8A","#159B79",]}
          start={{x: 0, y: 0,}}
          end={{x: 1, y: 1,}}
            style={styles.submitGradient}
          />
        </View>

        <View style={styles.footerGraphic1}>
          <LinearGradient
            colors={["#173C79","#155B8A","#159B79",]}
          start={{x: 0, y: 0,}}
          end={{x: 1, y: 1,}}
            style={styles.submitGradient}
          />
        </View>
      </SafeAreaView>
    </>
  );
};


const styles = StyleSheet.create({

  container: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 70,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  submitGradient1: {
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },

  card: { flex: 1, marginTop: -64, paddingHorizontal: 16 },

  tabContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    flexDirection: 'row',
    padding: 6,
    gap: 6,
    height: 58,
    marginBottom: 6,
    elevation: 6,
    shadowColor: '#0F1B2D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
  },

  tabButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeTabButton: { backgroundColor: C.blue },

  tabButtonText: { fontSize: 15, fontWeight: '700', color: C.blue },


  activeTabButtonText: { color: '#FFFFFF' },

  svw: { flex: 1, width: '100%' },

  dateHeader: { marginTop: 14, marginBottom: 8, marginHorizontal: 4 },

  dateHeaderText: { fontSize: 13, fontWeight: '700', color: C.muted, letterSpacing: 0.5 },

  friendRow: {
    backgroundColor: '#ffffff',
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: '#32CD32',
    marginLeft: 20,
    marginRight: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  icon: {
    flex: 1,
    flexDirection: 'row',
  },


  friendName: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },


  friendName1: {
    fontSize: 20,
    color: '#0047AB',
    fontWeight: '500',
  },


  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },


  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#999",
    fontWeight: "500",
  },

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
    shadowOffset: {
      width: 0,
      height: -2,
    },
    elevation: 10,
  },

  item: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  label1: {
    marginTop: 4,
    fontSize: 13,
    color: "#8A8A8A",
  },

  activeLabel: {
    color: "#0057D9",
    fontWeight: "600",
  },

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
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 12,
  },

  searchBarInput: {
    position: "absolute",
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginLeft: 15,
    marginTop: 45,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    width: '90%',
  },

  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },


  footerGraphic: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    overflow: 'hidden',
  },


  footerGraphic1: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    overflow: 'hidden',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
});
export default JetLinkInterface;

