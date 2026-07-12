import React, { useState } from 'react';
import { Stack, useRouter } from "expo-router";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const PaymentGateway = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'card' | 'qr'>('card');
  const [nameOnCard, setNameOnCard] = useState('Pasindu Sandaruwan');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const cardBrands = [
    { name: 'VISA', icon: 'credit-card' },
    { name: 'MC', icon: 'credit-card-outline' },
    { name: 'AMEX', icon: 'credit-card-check-outline' },
    { name: 'DINERS', icon: 'credit-card-multiple-outline' },
    { name: 'DISC', icon: 'credit-card-scan-outline' },
    { name: 'UPAY', icon: 'credit-card-wireless-outline' },
  ];

  return (
    <>
      <Stack.Screen options={{ title: "", headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#1E6091', '#2ECC91']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.profileButton}>
              <Ionicons name="person" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.headerTitle}>Payment Gateway</Text>
          <Text style={styles.headerSubtitle}>Pay for your parcel</Text>
        </LinearGradient>

        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.formCard}>

            {/* Tabs */}
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={styles.tabItem}
                onPress={() => setActiveTab('card')}
              >
                <Ionicons
                  name="card-outline"
                  size={16}
                  color={activeTab === 'card' ? '#1E6091' : '#A3A3A3'}
                />
                <Text style={[styles.tabText, activeTab === 'card' && styles.tabTextActive]}>
                  Card Payment
                </Text>
                {activeTab === 'card' && <View style={styles.tabUnderline} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tabItem}
                onPress={() => setActiveTab('qr')}
              >
                <MaterialCommunityIcons
                  name="qrcode"
                  size={16}
                  color={activeTab === 'qr' ? '#1E6091' : '#A3A3A3'}
                />
                <Text style={[styles.tabText, activeTab === 'qr' && styles.tabTextActive]}>
                  QR Payment
                </Text>
                {activeTab === 'qr' && <View style={styles.tabUnderline} />}
              </TouchableOpacity>
            </View>

            {activeTab === 'card' ? (
              <>
                {/* Card brand row */}
                <View style={styles.brandRow}>
                  {cardBrands.map((brand, index) => (
                    <View key={index} style={styles.brandChip}>
                      <MaterialCommunityIcons name={brand.icon as any} size={16} color="#5A5A5A" />
                    </View>
                  ))}
                </View>

                {/* Name on card */}
                <Text style={styles.inputLabel}>Name on card</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    value={nameOnCard}
                    onChangeText={setNameOnCard}
                    placeholder="Name on card"
                    placeholderTextColor="#B0B0B0"
                  />
                </View>

                {/* Card number */}
                <Text style={styles.inputLabel}>Card number</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    placeholder="•••• •••• •••• 4831"
                    placeholderTextColor="#B0B0B0"
                    keyboardType="number-pad"
                    maxLength={19}
                  />
                </View>

                {/* Expiry / CVC row */}
                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>Expiry</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.textInput}
                        value={expiry}
                        onChangeText={setExpiry}
                        placeholder="MM / YY"
                        placeholderTextColor="#B0B0B0"
                        keyboardType="number-pad"
                        maxLength={5}
                      />
                    </View>
                  </View>

                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>CVC</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.textInput}
                        value={cvc}
                        onChangeText={setCvc}
                        placeholder="•••"
                        placeholderTextColor="#B0B0B0"
                        keyboardType="number-pad"
                        secureTextEntry
                        maxLength={3}
                      />
                    </View>
                  </View>
                </View>

                <TouchableOpacity style={styles.submitButton}>
                  <LinearGradient
                    colors={['#4B6CF5', '#3454D1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitGradient}
                  >
                    <Text style={styles.submitText}>Submit payment</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <Text style={styles.secureText}>
                  Securely processed and powered by{' '}
                  <Text style={styles.secureBold}>BANCSTAC</Text>
                </Text>
              </>
            ) : (
              <View style={styles.qrPlaceholder}>
                <MaterialCommunityIcons name="qrcode-scan" size={120} color="#D0D0D0" />
                <Text style={styles.qrText}>Scan to pay with your banking app</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },

  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 60,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },

  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },

  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 20,
    
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },

  tabRow: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 12,
    marginRight: 24,
  },

  tabText: {
    fontSize: 14,
    color: '#A3A3A3',
    fontWeight: '500',
    marginLeft: 6,
  },

  tabTextActive: {
    color: '#1E6091',
    fontWeight: '700',
  },

  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#1E6091',
    borderRadius: 2,
  },

  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  brandChip: {
    width: 40,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#F5F6FA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  inputLabel: {
    fontSize: 13,
    color: '#5A5A5A',
    fontWeight: '600',
    marginBottom: 8,
  },

  inputWrapper: {
    backgroundColor: '#F5F6FA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },

  textInput: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
    padding: 0,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  halfInput: {
    width: '48%',
  },

  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },

  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  secureText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#A3A3A3',
    marginTop: 14,
  },

  secureBold: {
    fontWeight: '700',
    color: '#5A5A5A',
  },

  qrPlaceholder: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  qrText: {
    fontSize: 13,
    color: '#A3A3A3',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default PaymentGateway;