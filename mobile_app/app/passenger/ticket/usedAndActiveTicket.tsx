
import React, { useState, useCallback } from 'react';
import {
  Stack,
  useRouter,
  useFocusEffect,
  useLocalSearchParams
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

import {
  Ionicons,
  Feather,
  FontAwesome,
  MaterialCommunityIcons
} from '@expo/vector-icons';

import { LinearGradient } from 'expo-linear-gradient';

interface ticket {
  _id: string;
  ticketId: string;
  pickup: string;
  drop: string;
  date: string;
  time: string;
  pemail: string;
  bNumber: string;
  seatNumbers: string;
  busType: string;
  noOfTicket: string;
  totalFare: number;
}

type TicketListItem =
  | {
      type: "date";
      date: string;
      title: string;
    }
  | {
      type: "ticket";
      ticket: ticket;
    };

const JetLinkInterface: React.FC = () => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const params = useLocalSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('');
  const [activeticketData, setactiveTickets] = useState<ticket[]>([]);
  const [usedticketData, setusedTickets] = useState<ticket[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isactiveTab, setIsactiveTab] = useState<boolean>(true);
  const pemail = params.pemail as string;
  const busType = params.busType as string;

  const getActiveTickets = async () => {
    try {
      const used: boolean = false;
      const response = await fetch(`${API_URL}/tickets/email/${encodeURIComponent(pemail)}/${busType}/${used}`);
      const data = await response.json();
      console.log("Active Tickets:", data);
      if (data.success !== false) {
        setactiveTickets(data.data || []);
      } else {
        setactiveTickets([]);
      }
    } 
    catch (error) {
      console.log(error);
      Alert.alert(
        "Error",
        "Something went wrong."
      );
    }
  };

  const getUsedTickets = async () => {
    try {
      const used: boolean = true;
      const response = await fetch(`${API_URL}/tickets/email/${encodeURIComponent(pemail)}/${busType}/${used}`);
      const data = await response.json();
      console.log("Used Tickets:", data);
      if (data.success !== false) {
        setusedTickets(data.data || []);
      } else {
        setusedTickets([]);
      }
    }

    catch (error) {
      console.log(error);
      Alert.alert(
        "Error",
        "Something went wrong."
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      getActiveTickets();
      getUsedTickets();
    }, [])
  );

  const getDateOnly = (dateString: string) => {
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

    // Fallback
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const getDateTitle = (dateString: string) => {
    const ticketDate = getDateOnly(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // TODAY
    if (
      ticketDate.getTime() ===
      today.getTime()
    ) {
      return "TODAY";
    }

    // TOMORROW
    if (
      ticketDate.getTime() ===
      tomorrow.getTime()
    ) {
      return "TOMORROW";
    }

    // OTHER DATE
    return dateString;
  };


  const dateWiseTickets: TicketListItem[] = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const grouped: Record<string,ticket[]> = {};
    activeticketData.forEach(
      (ticketItem) => {
        const ticketDate =
          getDateOnly(ticketItem.date);

        if (
          ticketDate.getTime() <
          today.getTime()
        ) {
          return;
        }

        if (
          !grouped[ticketItem.date]
        ) 
        {
          grouped[ticketItem.date] = [];
        }
        grouped[ticketItem.date].push(ticketItem);
      }
    );

    const sortedDates = Object.keys(grouped).sort(
      (a, b) => {

        return (
          getDateOnly(a).getTime() -
          getDateOnly(b).getTime()
        );

      }
    );

    const result: TicketListItem[] = [];

    sortedDates.forEach(
      (date) => {

        // Date heading
        result.push({
          type: "date",
          date: date,
          title: getDateTitle(date),
        });

        // Tickets under date
        grouped[date].forEach(
          (ticketItem) => {
            result.push({
              type: "ticket",
              ticket: ticketItem,
            });
          }
        );
      }
    );
    return result;
  }, [activeticketData]);

  const dateWiseTickets1: TicketListItem[] = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const grouped: Record<string,ticket[]> = {};
    usedticketData.forEach(
      (ticketItem) => {
        const ticketDate =
          getDateOnly(ticketItem.date);

        // if (
        //   ticketDate.getTime() <
        //   today.getTime()
        // ) {
        //   return;
        // }

        if (
          !grouped[ticketItem.date]
        ) 
        {
          grouped[ticketItem.date] = [];
        }
        grouped[ticketItem.date].push(ticketItem);
      }
    );

    const sortedDates = Object.keys(grouped).sort(
      (a, b) => {

        return (
          getDateOnly(b).getTime() -
          getDateOnly(a).getTime()
        );

      }
    );

    const result: TicketListItem[] = [];

    sortedDates.forEach(
      (date) => {

        // Date heading
        result.push({
          type: "date",
          date: date,
          title: getDateTitle(date),
        });

        // Tickets under date
        grouped[date].forEach(
          (ticketItem) => {
            result.push({
              type: "ticket",
              ticket: ticketItem,
            });
          }
        );
      }
    );
    return result;
  }, [usedticketData]); 

  const openActiveTicket = (item: ticket) => {
    router.push({
      pathname:"/passenger/ticket/ticketQr",
      params: {
        tikId: item._id,
        ticketId: item.ticketId,
        pickup: item.pickup,
        drop: item.drop,
        date: item.date,
        time: item.time,
        bNumber: item.bNumber,
        seatNumbers: item.seatNumbers,
        busType: item.busType,
        noOfTicket: item.noOfTicket,
        totalFare: item.totalFare,
        Pid: params.Pid,
        Pid1: params.Pid1,
        pfirstName: params.pfirstName,
        plastName: params.plastName,
        pemail: params.pemail,
        pphoneNumber: params.pphoneNumber,
        busTypeTopic: params.busTypeTopic,
      },
    });
  };

  const openUsedTicket = ( item: ticket) => {
    router.push({
      pathname:"/passenger/ticket/usedTicket",
      params: {
        tikId: item._id,
        ticketId: item.ticketId,
        pickup: item.pickup,
        drop: item.drop,
        date: item.date,
        time: item.time,
        bNumber: item.bNumber,
        seatNumbers: item.seatNumbers,
        busType: item.busType,
        noOfTicket: item.noOfTicket,
        totalFare: item.totalFare,
        Pid: params.Pid,
        Pid1: params.Pid1,
        pfirstName: params.pfirstName,
        plastName: params.plastName,
        pemail: params.pemail,
        pphoneNumber: params.pphoneNumber,
        busTypeTopic: params.busTypeTopic,
      },
    });
  };

  const renderActiveTicket = ( item: ticket) => (
    <TouchableOpacity onPress={() => openActiveTicket(item)}>
      <View style={styles.friendRow}>
        <View style={styles.icon}>
          <View style={[ styles.iconWrap,{ backgroundColor:"#F59E0B18"}]}>
            <Ionicons name="ticket-outline" size={50} color="#F59E0B"/>
          </View>
          <View>
            <Text style={styles.friendName1}>
              {item.ticketId}
            </Text>

            <Text style={styles.friendName}>
              {item.pickup} - {item.drop}
            </Text>

            <Text style={styles.friendName}>
              {item.date} - {item.time}
            </Text>

            <Text style={styles.friendName}>
              {item.bNumber}
            </Text>
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC"/>
      </View>
    </TouchableOpacity>
  );

  const renderDateWiseItem = ({item,}: {item: TicketListItem}) => {
    if (item.type === "date") {
      return (
        <View style={styles.dateHeader}>
          <Text style={ styles.dateHeaderText}>
            {item.title}
          </Text>
        </View>
      );
    }

    return renderActiveTicket(item.ticket);
  };

  const renderUsedTicketItem = ( item: ticket) => (
    <TouchableOpacity onPress={() => openUsedTicket(item)}>
      <View style={styles.friendRow}>
        <View style={styles.icon}>
          <View style={[styles.iconWrap,{ backgroundColor: "#F59E0B18"}]}>
            <Ionicons name="ticket-outline" size={50} color="#F59E0B"/>
          </View>

          <View>
            <Text style={styles.friendName1}>
              {item.ticketId}
            </Text>

            <Text style={styles.friendName}>
              {item.pickup} - {item.drop}
            </Text>

            <Text style={styles.friendName}>
              {item.date} - {item.time}
            </Text>

            <Text style={ styles.friendName}>
              {item.bNumber}
            </Text>
          </View>
        </View>

        <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC"/>
      </View>
    </TouchableOpacity>
  );

  const renderDateWiseItem2 = ({item,}: {item: TicketListItem}) => {
    if (item.type === "date") {
      return (
        <View style={styles.dateHeader}>
          <Text style={ styles.dateHeaderText}>
            {item.title}
          </Text>
        </View>
      );
    }

    return renderUsedTicketItem(item.ticket);
  };

  return (
    <>
      <Stack.Screen options={{title: "", headerShown: false}}/>
      <SafeAreaView style={styles.container}>

        <LinearGradient
          colors={["#173C79","#155B8A","#159B79",]}
          start={{x: 0, y: 0,}}
          end={{x: 1, y: 1,}}
          style={ styles.submitGradient1}
        >
          <View style={styles.header}>
            <TouchableOpacity>
              <Text style={styles.title}>
                {params.busTypeTopic} Ticket
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.card}>
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[ styles.tabButton, isactiveTab && styles.activeTabButton]} 
              onPress={() => setIsactiveTab(true)}
            >
              <Text style={[styles.tabButtonText, isactiveTab && styles.activeTabButtonText]}>
                Active
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[ styles.tabButton,!isactiveTab && styles.activeTabButton]}
              onPress={() => setIsactiveTab(false)}
            >
              <Text style={[ styles.tabButtonText, !isactiveTab && styles.activeTabButtonText]}>
                Used
              </Text>
            </TouchableOpacity>
          </View>

          {isactiveTab && (
            <FlatList
              style={styles.svw}
              data={dateWiseTickets}
              renderItem={renderDateWiseItem}
              keyExtractor={(item, index) => {
                if (
                  item.type === "date"
                ) 
                {
                  return `date-${item.date}`;
                }
                return `ticket-${item.ticket.ticketId}-${index}`;
              }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{paddingVertical: 10, paddingBottom: 180,}}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="ticket-outline" size={55} color="#C7C7CC"/>
                  <Text style={ styles.emptyText}>
                    No active tickets
                  </Text>
                </View>
              }
            />
          )}

          {!isactiveTab && (
            <FlatList
              style={styles.svw}
              data={dateWiseTickets1}
              renderItem={renderDateWiseItem2}
              keyExtractor={(item, index) => {
                if (
                  item.type === "date"
                ) 
                {
                  return `date-${item.date}`;
                }
                return `ticket-${item.ticket.ticketId}-${index}`;
              }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 10, paddingBottom: 180,}}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="ticket-outline" size={55} color="#C7C7CC"/>
                  <Text style={styles.emptyText}>
                    No used tickets
                  </Text>
                </View>
              }
            />
          )}
        </View>

        {isSearching ? (
          <TextInput 
            style={styles.searchBarInput}
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
          />
        ) : null}

        <View style={styles.bottomNav}>

          {/* BACK */}
          <TouchableOpacity
            style={styles.item}
            onPress={() => {
              setActiveTab("home");
              if (isSearching) {
                setIsSearching(false);
              }

              else {
                router.push({
                  pathname: "/passenger/ticket/normalwayAndHighway",
                  params: {
                    Pid: params.Pid,
                    Pid1: params.Pid1,
                    pfirstName: params.pfirstName,
                    plastName: params.plastName,
                    pemail: params.pemail,
                    pphoneNumber: params.pphoneNumber,
                    busType: params.busType,
                    busTypeTopic: params.busTypeTopic,
                  },
                });
              }
            }}
          >
            <Ionicons name={isSearching ? "arrow-back" : "arrow-back-outline"} size={24} color={activeTab === "home" ? "#0057D9" : "#8A8A8A"}/>
            <Text style={[styles.label1, activeTab === "home" && styles.activeLabel,]}>
              Back
            </Text>
          </TouchableOpacity>


          {/* SEARCH */}

          <TouchableOpacity
            style={styles.item}
            onPress={() => {setActiveTab("routes"); setIsSearching(!isSearching);}}
          >
            <FontAwesome name={isSearching ? "close" : "search"} size={24} color={activeTab === "routes" ? "#0057D9" : "#8A8A8A"}/>
            <Text style={[styles.label1, activeTab === "routes" && styles.activeLabel,]}>
              Routes
            </Text>
          </TouchableOpacity>

          {/* HOME CENTER */}

          <TouchableOpacity
            style={styles.centerButton}
            onPress={() => {
              setActiveTab("tickets");
              router.push({
                pathname: "/passenger/index1",
                params: {
                  Pid: params.Pid,
                  Pid1: params.Pid1,
                  pfirstName: params.pfirstName,
                  plastName: params.plastName,
                  pphoneNumber: params.pphoneNumber,
                  pemail: params.pemail,
                },
              });
            }}
          >
            <Ionicons name="home-outline" size={28} color="#fff"/>
          </TouchableOpacity>

          {/* ALERTS */}

          <TouchableOpacity
            style={styles.item}
            onPress={() => {setActiveTab("routes"); router.push({ pathname: "/notifications", params: { role: "passenger" } });}}
          >
            <Ionicons name="notifications-outline" size={24} color={ activeTab === "alerts" ? "#0057D9" : "#8A8A8A"}/>
            <Text style={[styles.label1, activeTab === "alerts" && styles.activeLabel,]}>
              Alerts
            </Text>
          </TouchableOpacity>


          {/* PROFILE */}

          <TouchableOpacity
            style={styles.item}
            onPress={() => {router.push({ pathname: "/passenger/passengerProfile", params: { role: "passenger",NIC: params.NIC } });}}
          >
            <Feather name="user" size={24} color={activeTab === "profile" ? "#0057D9" : "#8A8A8A"}/>
            <Text style={[styles.label1, activeTab === "profile" && styles.activeLabel,]}>
              Profile
            </Text>
          </TouchableOpacity>
        </View>

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

  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

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

  card: {
    width: '100%',
    flex: 1,
    maxHeight: '100%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 55,
    borderTopRightRadius: 55,
    marginTop: -50,
    alignSelf: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  tabContainer: {
    marginLeft: 25,
    marginRight: 25,
    backgroundColor: '#F2F4F5',
    borderRadius: 12,
    flexDirection: 'row',
    padding: 6,
    marginTop: 22,
    marginBottom: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },


  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },


  activeTabButton: {
    backgroundColor: '#32CD32',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },


  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0056b3',
  },

  activeTabButtonText: {
    color: '#FFF',
  },

  svw: {
    width: '100%',
    marginBottom: 150,
    marginTop: 3,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  dateHeader: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 5,
    paddingVertical: 5,
  },


  dateHeaderText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0047AB',
    letterSpacing: 0.8,
  },

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
