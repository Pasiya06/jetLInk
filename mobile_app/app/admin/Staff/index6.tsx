import React, { useState } from "react";
import { Image } from 'react-native';
import SearchPanel from "../../../components/SearchPanel";
import { Alert } from "../../../components/JetAlert";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
   SafeAreaView,
  ScrollView
} from "react-native";

import {  } from "react-native-safe-area-context";
import { Stack,useRouter,useLocalSearchParams } from "expo-router";
import { Ionicons, FontAwesome, FontAwesome5, Feather, Feather as Icon } from '@expo/vector-icons';

import DateTimePicker from '@react-native-community/datetimepicker';
import { addConductor } from "../../../services/conductorService";
import { LinearGradient } from 'expo-linear-gradient';
import AlertBadge from "../../../components/AlertBadge";





import FieldError from "../../../components/FieldError";
import { useFieldErrors } from "../../../utils/validation";
import { ScreenHeader, Avatar, Pill, GradientButton, C } from "../../../components/JetUI";
const AddConductor = () => {
 
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAdress] = useState("");
  const [NIC, setNIC] = useState("");
  const [Birthday, setBirthday] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [date, setDate] = useState(new Date());
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState('');
  const params = useLocalSearchParams();
  const router = useRouter();
  const { validate: validateFields, errorFor: fieldError } = useFieldErrors();
  

  const handleAddConductor = async () => {
    if (!validateFields([
      { key: "firstName", label: "First name", value: firstName },
      { key: "lastName", label: "Last name", value: lastName },
      { key: "phoneNumber", label: "Phone number", value: phoneNumber, type: "phone" },
      { key: "address", label: "Address", value: address },
      { key: "NIC", label: "NIC", value: NIC, type: "nic" },
      { key: "email", label: "Email", value: email, type: "email" },
      { key: "password", label: "Password", value: password, type: "password" },
    ])) return;


  if (!firstName || !lastName || !phoneNumber) {
    Alert.alert("Missing details", "Please fill in all the required fields.");
    return;
  }

  try {
    
    const data = await addConductor({
      firstName,
      lastName,
      phoneNumber,
      address,
      NIC,
      Birthday,
      email,
      password,
    });

    if (data.success) {

      Alert.alert("Conductor added", "The conductor was added successfully.");

      router.push({
        pathname: "/admin/Staff/index5",
        params: {
          Aid: params.Aid,
          firstName: params.firstName,
          lastName: params.lastName,
          email: params.email,
        },
      });

    } else {

      Alert.alert("Couldn't add conductor", String(data.message || "Please check the details and try again."));

    }

  } catch (err) {

    Alert.alert("Connection failed", "Couldn't reach the server. Please check your internet connection and try again.");

  }

};

  return (
    <>
    <Stack.Screen options={{ title: "", headerShown: false }} />
    <SafeAreaView style={styles.container}>
      <ScreenHeader eyebrow="Add a new" title={"Conductor"} />
      <View style={styles.card}>

        <ScrollView
          style={styles.svw}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.previewCard}>
            <Avatar name={`${firstName} ${lastName}`.trim() || "Conductor"} size={56} />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.previewName} numberOfLines={1}>
                {`${firstName} ${lastName}`.trim() || "New conductor"}
              </Text>
              <Text style={styles.previewSub} numberOfLines={1}>
                {email || phoneNumber || "Fill in the details below"}
              </Text>
            </View>
            <Pill text="Conductor" bg={C.greenSoft} color={C.green} />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Ionicons name="person-outline" size={18} color={C.blue} />
              <Text style={styles.sectionTitle}>Personal details</Text>
            </View>
           
              
            <Text style={styles.inputLabel}>First Name</Text>  
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={19} color={C.muted} style={styles.fieldIcon} />
                  
                  <View style={styles.inputInnerWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder="Deshith"
                      placeholderTextColor="#A3A3A3"
                    />
                  </View>
                </View>
                <FieldError message={fieldError("firstName", firstName)} />

                <Text style={styles.inputLabel}>Last Name</Text>  
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={19} color={C.muted} style={styles.fieldIcon} />
                  
                  <View style={styles.inputInnerWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Sandakelum"
                      placeholderTextColor="#A3A3A3"
                    />
                  </View>
                </View>
                <FieldError message={fieldError("lastName", lastName)} />

                <Text style={styles.inputLabel}>Phone Number</Text>  
                <View style={styles.inputWrapper}>
                  <Ionicons name="call-outline" size={19} color={C.muted} style={styles.fieldIcon} />
                  
                  <View style={styles.inputInnerWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      placeholder="077 1234567"
                      placeholderTextColor="#A3A3A3"
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                  </View>
                </View>
                <FieldError message={fieldError("phoneNumber", phoneNumber)} />

                <Text style={styles.inputLabel}>Address</Text>  
                <View style={styles.inputWrapper}>
                  <Ionicons name="home-outline" size={19} color={C.muted} style={styles.fieldIcon} />
                  
                  <View style={styles.inputInnerWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={address}
                      onChangeText={setAdress}
                      placeholder="15/2 Galle road, Colombo"
                      placeholderTextColor="#A3A3A3"
                    />
                  </View>
                </View>
                <FieldError message={fieldError("address", address)} />

          </View>

          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Ionicons name="card-outline" size={18} color={C.blue} />
              <Text style={styles.sectionTitle}>Identity</Text>
            </View>
                <Text style={styles.inputLabel}>NIC</Text>  
                <View style={styles.inputWrapper}>
                  <Ionicons name="id-card-outline" size={19} color={C.muted} style={styles.fieldIcon} />
                  
                  <View style={styles.inputInnerWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={NIC}
                      onChangeText={setNIC}
                      placeholder="123456789012"
                      placeholderTextColor="#A3A3A3"
                    />
                  </View>
                </View>
                <FieldError message={fieldError("NIC", NIC)} />

                <Text style={styles.inputLabel}>Birth Day</Text>                
                <View style={styles.inputWrapper}>
                  <Ionicons name="calendar-outline" size={19} color={C.muted} style={styles.fieldIcon} />
                  
                  <View style={styles.inputInnerWrapper}>
                    <Text style={[styles.textInputG, Birthday ? { color: C.ink } : null]}>{Birthday || "DD-MM-YYYY"}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowCalendar(true)}>
                    <FontAwesome5 name="calendar-alt" size={20} color={C.blue} />  
                  </TouchableOpacity>
                </View>

                {showCalendar && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowCalendar(false);
                      if (selectedDate) {
                        setDate(selectedDate);
                        setBirthday(selectedDate.toLocaleDateString());
                      }
                    }}
                  />
                )}

                

          </View>

          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Ionicons name="lock-closed-outline" size={18} color={C.blue} />
              <Text style={styles.sectionTitle}>Login details</Text>
            </View>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={19} color={C.muted} style={styles.fieldIcon} />
                  
                  <View style={styles.inputInnerWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={email}
                      placeholder="ABC@gmail.com"
                      placeholderTextColor="#A3A3A3"
                      keyboardType="email-address"
                      onChangeText={(text) => setEmail(text.replace(/\s/g, "").toLowerCase())} 
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>
                <FieldError message={fieldError("email", email)} />

                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="key-outline" size={19} color={C.muted} style={styles.fieldIcon} />
                  
                  <View style={styles.inputInnerWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Abc@123"
                      placeholderTextColor="#A3A3A3"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                  </View>
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Icon name={showPassword ? 'eye' : 'eye-off'} size={20} color={C.muted} />
                  </TouchableOpacity>
                </View>
                <FieldError message={fieldError("password", password)} /> 
      
          </View>
        </ScrollView>

    </View>

    <GradientButton label="Add conductor" icon="person-add-outline" onPress={handleAddConductor} style={styles.saveButton} />

      <SearchPanel
          visible={isSearching}
          query={searchQuery}
          onChangeQuery={setSearchQuery}
          onClose={() => { setIsSearching(false); setSearchQuery(""); }}
          role={"admin"}
          params={params}
        />
  

    <View style={styles.bottomNav}>

      
      <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("home"); if (isSearching) {
              setIsSearching(false); setSearchQuery(""); 
            }

            else {
              router.push({
                pathname: "/admin/Staff/index5",
                params: {
                  Aid: params.Aid,
                  firstName: params.firstName,
                  lastName: params.lastName,
                  email: params.email,
                },                    
              });
            };}}>
        <Ionicons name={isSearching ? "arrow-back" : "arrow-back-outline"} size={24} color={activeTab === "home" ? "#0057D9" : "#8A8A8A"}/>
        <Text style={[styles.label1,activeTab === "home" && styles.activeLabel,]}>
          Back
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("routes"); if (isSearching) setSearchQuery(""); setIsSearching(!isSearching); }}>
        <FontAwesome name={isSearching ? "close" : "search"} size={24} color={activeTab  === "routes" ? "#0057D9" : "#8A8A8A"}/>
        <Text style={[ styles.label1,activeTab === "routes" && styles.activeLabel,]}>
          Search
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.centerButton} onPress={() => {setActiveTab("tickets"); router.push({
                pathname: "/admin/index1",
                params: {
                  Aid: params.Aid,
                  firstName: params.firstName,
                  lastName: params.lastName,
                  email: params.email,
                },                    
              });}} > 
        <Ionicons name="home-outline" size={28} color="#fff" />             
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => { setActiveTab("alerts"); router.push({ pathname: "/notifications", params: { role: "admin" } }); }}>
        <View><Ionicons name="notifications-outline" size={24} color={activeTab === "alerts" ? "#0057D9" : "#8A8A8A"}/><AlertBadge role="admin" /></View>
        <Text style={[styles.label1,activeTab === "alerts" && styles.activeLabel, ]}>
          Alerts
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => {setActiveTab("profile"); router.push({
                      pathname: "/admin/Profile/adminProfile",
                      params: {
                        Aid: params.Aid,
                        firstName: params.firstName,
                        lastName: params.lastName,
                        email: params.email,
                      },
                    });}}>
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
      >
      </LinearGradient>
    </View>
    <View style={styles.footerGraphic1}>
      <LinearGradient
        colors={["#173C79","#155B8A","#159B79",]}
          start={{x: 0, y: 0,}}
          end={{x: 1, y: 1,}}
        style={styles.submitGradient}
      >
      </LinearGradient>
    </View>

    </SafeAreaView>

    </>
  );
};

const styles = StyleSheet.create({
  saveButton: { position: 'absolute', left: 20, right: 20, bottom: 165 },
  fieldIcon: { marginRight: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: C.ink },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 12,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    paddingBottom: 8,
    elevation: 3,
    shadowColor: '#0F1B2D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  previewSub: { fontSize: 13, fontWeight: '500', color: C.muted, marginTop: 2 },
  previewName: { fontSize: 18, fontWeight: '800', color: C.navy },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    elevation: 6,
    shadowColor: '#0F1B2D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
  },
  formContent: { paddingHorizontal: 16, paddingBottom: 260, gap: 14 },

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

  card: { flex: 1, marginTop: -64 },

  svw: { flex: 1 },

  formContainer: {
    width: '100%',
    marginTop: 14,
    paddingBottom: 20,
  },
  inputWrapper: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
    borderWidth: 1.5,
    borderColor: '#E3E9F1',
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 4,
  },
  input3dIcon: {
    marginRight: 12,
    width: 25,
    height: 25
  },
  input3dIcon1: {
    marginRight: -4,
    width: 25,
    height: 25
  },
  inputInnerWrapper: { flex: 1 },
  inputLabel: { fontSize: 13, color: C.muted, fontWeight: '700', marginBottom: 6, marginLeft: 2 },
  textInput: { fontSize: 15, color: C.ink, fontWeight: '600', paddingVertical: 12 },
  textInputG: { fontSize: 15, color: '#8A97A8', fontWeight: '600', paddingVertical: 12 },
  eyeIcon: { padding: 6, marginLeft: 4 },
  underIcon: {
    marginRight: -11,   
  },

  label:{
    color:"#0047AB",
    fontSize:14,
    marginBottom: 5,
  },

  

  input: {
    flex: 1,
    height: '100%',
    color: '#333',
  },

  inputIcon: {
    fontSize: 18,
    color: '#999',
  },

  searchButton: {
    justifyContent: "space-around",
    marginLeft: 20,
    marginRight: 20,  
    height: 55,
    overflow: 'hidden',
    borderRadius: 25,
    marginTop: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    elevation: 10,
  },

  searchButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
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

  searchBarInput: {
    position: "absolute",
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginLeft: 15,
    marginTop: 45,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    width:'90%' 
  },

  subHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
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


export default AddConductor;