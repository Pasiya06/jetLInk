import React from 'react';
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// const InfoRow = ({ icon, iconSet = 'ion', label, value, color = '#3B82F6' }) => {
//   const IconComponent = iconSet === 'material' ? MaterialCommunityIcons : Ionicons;
//   return (
//     <View style={styles.row}>
//       <View style={[styles.iconWrap, { backgroundColor: `${color}18` }]}>
//         <IconComponent name={icon} size={18} color={color} />
//       </View>
//       <View style={styles.rowText}>
//         <Text style={styles.label}>{label}</Text>
//         <Text style={styles.value}>{value || '—'}</Text>
//       </View>
//     </View>
//   );
// };

const BusDetailsCard = () => {
  const params = useLocalSearchParams();
  const isOnline = params.status === 'online';

  return (
    <View style={styles.card}>
      {/* Header */}
      <LinearGradient
        colors={['#F4F7FC', '#F4F7FC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header1}
      >
        
            <View style={styles.avatar}>
                <MaterialCommunityIcons name="bus" size={32} color="#ffffff" />
            </View>

            <Text style={styles.fullName}>{params.busNumber || 'N/A'}</Text>

            <View
                style={[
                styles.badge,
                { backgroundColor: isOnline ? '#EAFBEF' : '#FDEDED' },
                ]}
            >
                <View
                style={[
                    styles.statusDot,
                    { backgroundColor: isOnline ? '#22C55E' : '#EF4444' },
                ]}
                />
                <Text
                style={[
                    styles.badgeText,
                    { color: isOnline ? '#2F9E44' : '#DC2626' },
                ]}
                >
                {isOnline ? 'Online' : 'Offline'}
                </Text>
            </View>
        
      </LinearGradient>

      {/* Body */}
      <View style={styles.body}>
       
        
        <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: "#8B5CF618" }]}>
            <Ionicons name="person-circle-outline" size={18} color="#8B5CF6" />
        </View>
        <View style={styles.rowText}>
            <Text style={styles.label}>Conductor</Text>
            <Text style={styles.value}>not yet</Text>
        </View>
        </View>

        <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: "#F59E0B18" }]}>
            <Ionicons name="car-outline" size={18} color="#F59E0B" />
        </View>
        <View style={styles.rowText}>
            <Text style={styles.label}>Driver</Text>
            <Text style={styles.value}>not yet</Text>
        </View>
        </View>

        <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: "#06B6D418" }]}>
            <Ionicons name="barcode-outline" size={18} color="#06B6D4" />
        </View>
        <View style={styles.rowText}>
            <Text style={styles.label}>Chassis Number</Text>
            <Text style={styles.value}>not yet</Text>
        </View>
        </View>

        <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: "#EF444418" }]}>
            <MaterialCommunityIcons name ="engine-outline" size={18} color="#EF4444" />
        </View>
        <View style={styles.rowText}>
            <Text style={styles.label}>Engine Number</Text>
            <Text style={styles.value}>not yet</Text>
        </View>
        </View>

        <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: "#EC489918" }]}>
            <Ionicons name="color-palette-outline" size={18} color="#EC4899" />
        </View>
        <View style={styles.rowText}>
            <Text style={styles.label}>Colour</Text>
            <Text style={styles.value}>not yet</Text>
        </View>
        </View>

        <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: "#10B98118" }]}>
            <Ionicons name="calendar-outline" size={18} color="#10B981" />
        </View>
        <View style={styles.rowText}>
            <Text style={styles.label}>Service Date</Text>
            <Text style={styles.value}>not yet</Text>
        </View>
        </View>

        <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: "#3B82F618" }]}>
            <Ionicons name="document-text-outline" size={18} color="#3B82F6" />
        </View>
        <View style={styles.rowText}>
            <Text style={styles.label}>License Date</Text>
            <Text style={styles.value}>not yet</Text>
        </View>
        </View>

        <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: "#84CC1618" }]}>
            <Ionicons name="leaf-outline" size={18} color="#84CC16" />
        </View>
        <View style={styles.rowText}>
            <Text style={styles.label}>Emission Date</Text>
            <Text style={styles.value}>not yet</Text>
        </View>
        </View>





      </View>

      {/* Edit Button */}
      <TouchableOpacity activeOpacity={0.85} >
        <LinearGradient
          colors={['#2563EB', '#1E40AF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.searchButton}
        >
          <Ionicons name="create-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.searchButtonText}>Edit Details</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  header1: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 20,
    backgroundColor: '#F4F7FC',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  avatar: {
    width: 64, 
    height: 64, 
    borderRadius: 32,
    backgroundColor: '#4A6FA5',
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: { 
    color: '#FFF', 
    fontSize: 22, 
    fontWeight: '700' 
  },

  fullName: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#1E293B' 
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF7EC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    gap: 4,
  },

  badgeText: { 
    fontSize: 11, 
    color: '#2F9E44', 
    fontWeight: '600', 
    marginLeft: 4 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  busNumber: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  body: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowText: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 8,
  },
  searchButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    marginHorizontal: 18,
    marginTop: 8,
    marginBottom: 18,
    borderRadius: 14,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default BusDetailsCard;