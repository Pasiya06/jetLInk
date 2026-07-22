// import React from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';

// const BusScheduleCard = ({ item, onDelete }) => {
//   return (
//     <View style={styles.card}>
//       {/* Bus number + date pill row */}
//       <View style={styles.topRow}>
//         <View style={styles.busNoPill}>
//           <Ionicons name="bus" size={14} color="#4B7BEC" />
//           <Text style={styles.busNoText}>{item.busNo}</Text>
//         </View>
//         <Text style={styles.dateText}>{item.busdate}</Text>
//       </View>

//       {/* Route visual */}
//       <View style={styles.routeRow}>
//         <View style={styles.routeLine}>
//           <View style={styles.dotFilled} />
//           <View style={styles.connector} />
//           <View style={styles.dotOutline} />
//         </View>

//         <View style={styles.routeDetails}>
//           <View style={styles.routeStop}>
//             <Text style={styles.locationText}>{item.pickuploca}</Text>
//             <Text style={styles.timeText}>{item.depaturetime}</Text>
//           </View>

//           <View style={[styles.routeStop, { marginTop: 22 }]}>
//             <Text style={styles.locationText}>{item.dropoffloca}</Text>
//             <Text style={styles.timeText}>{item.arrivaltime}</Text>
//           </View>
//         </View>
//       </View>

//       {/* Stops row */}
//       <View style={styles.infoRow}>
//         <View style={styles.iconWrap}>
//           <Ionicons name="location-outline" size={16} color="#4B7BEC" />
//         </View>
//         <View style={{ flex: 1 }}>
//           <Text style={styles.infoLabel}>Stops</Text>
//           <Text style={styles.infoValue}>{item.stops}</Text>
//         </View>
//       </View>

//       {/* Delete button */}
//       <TouchableOpacity
//         style={styles.deleteBtn}
//         onPress={() => onDelete(item.scheduleId)}
//       >
//         <Ionicons name="trash-outline" size={18} color="#FF5252" />
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 18,
//     padding: 18,
//     marginVertical: 8,
//     marginHorizontal: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.06,
//     shadowRadius: 10,
//     elevation: 3,
//   },
//   topRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   busNoPill: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#EAF1FF',
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 20,
//     gap: 6,
//   },
//   busNoText: {
//     color: '#4B7BEC',
//     fontWeight: '700',
//     fontSize: 13,
//   },
//   dateText: {
//     color: '#8A94A6',
//     fontSize: 13,
//     fontWeight: '500',
//   },
//   routeRow: {
//     flexDirection: 'row',
//     marginBottom: 16,
//   },
//   routeLine: {
//     alignItems: 'center',
//     width: 20,
//     marginRight: 12,
//   },
//   dotFilled: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: '#4B7BEC',
//   },
//   connector: {
//     width: 2,
//     flex: 1,
//     minHeight: 30,
//     backgroundColor: '#D8E2F5',
//     marginVertical: 4,
//   },
//   dotOutline: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     borderWidth: 2,
//     borderColor: '#4B7BEC',
//     backgroundColor: '#FFFFFF',
//   },
//   routeDetails: {
//     flex: 1,
//     justifyContent: 'space-between',
//   },
//   routeStop: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//   },
//   locationText: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: '#1A1F36',
//     flex: 1,
//     marginRight: 8,
//   },
//   timeText: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#4B7BEC',
//   },
//   infoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F7F9FC',
//     borderRadius: 12,
//     padding: 10,
//     marginTop: 4,
//   },
//   iconWrap: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     backgroundColor: '#EAF1FF',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 10,
//   },
//   infoLabel: {
//     fontSize: 11,
//     color: '#8A94A6',
//     fontWeight: '600',
//   },
//   infoValue: {
//     fontSize: 13,
//     color: '#1A1F36',
//     fontWeight: '500',
//   },
//   deleteBtn: {
//     position: 'absolute',
//     top: 16,
//     right: 16,
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     backgroundColor: '#FFF0F0',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });

// export default BusScheduleCard;