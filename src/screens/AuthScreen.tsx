import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  Alert,
} from 'react-native';
import { Bus, MapPin, Eye, EyeOff, ShieldCheck, ChevronDown, Check } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { useAppState } from '../context/AppStateContext';

export const AuthScreen: React.FC = () => {
  const { login, signup, setHasLocationPermission } = useAppState();
  const [tab, setTab] = useState<'login' | 'signup'>('login');

  // Login form state
  const [loginInput, setLoginInput] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Signup form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [nic, setNic] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [licenseClass, setLicenseClass] = useState('B (Route Bus)');
  const [licenseExpiry, setLicenseExpiry] = useState('2028-11-15');
  const [signupPassword, setSignupPassword] = useState('');

  // Dropdown & Permission Dialog
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  const licenseClasses = ['A (Motorcycle)', 'B (Route Bus)', 'C (Heavy Vehicle)', 'D (Trailer)'];

  const handleLoginSubmit = () => {
    if (!loginInput || !loginPassword) {
      Alert.alert('Required Fields', 'Please enter your phone/email and password.');
      return;
    }
    triggerLocationPrompt(login);
  };

  const handleSignupSubmit = () => {
    if (!fullName || !phone || !nic || !licenseNo || !signupPassword) {
      Alert.alert('Required Fields', 'Please fill in all mandatory signup details.');
      return;
    }
    triggerLocationPrompt(() => signup({ fullName, phone, email, nic, licenseNo }));
  };

  const triggerLocationPrompt = (authCallback: () => void) => {
    setPendingCallback(() => authCallback);
    setShowPermissionModal(true);
  };

  const acceptLocationPermission = () => {
    setHasLocationPermission(true);
    setShowPermissionModal(false);
    if (pendingCallback) {
      pendingCallback();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header Branding */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Bus size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>SmartBus Driver</Text>
          <Text style={styles.subtitle}>Sign in to access assigned route trips</Text>
        </View>

        {/* Tab Toggle */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, tab === 'login' && styles.activeTab]}
            onPress={() => setTab('login')}
          >
            <Text style={[styles.tabText, tab === 'login' && styles.activeTabText]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, tab === 'signup' && styles.activeTab]}
            onPress={() => setTab('signup')}
          >
            <Text style={[styles.tabText, tab === 'signup' && styles.activeTabText]}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Login Form */}
        {tab === 'login' ? (
          <View style={styles.formContainer}>
            <Text style={styles.label}>Phone Number or Email</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 0771234567 or driver@smartbus.lk"
              placeholderTextColor="#94A3B8"
              value={loginInput}
              onChangeText={setLoginInput}
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Enter password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                value={loginPassword}
                onChangeText={setLoginPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color={COLORS.textSecondary} />
                ) : (
                  <Eye size={20} color={COLORS.textSecondary} />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleLoginSubmit}>
              <Text style={styles.submitBtnText}>Continue to Dashboard</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Signup Form */
          <View style={styles.formContainer}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Kusum Perera"
              placeholderTextColor="#94A3B8"
              value={fullName}
              onChangeText={setFullName}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0771234567"
                  keyboardType="phone-pad"
                  placeholderTextColor="#94A3B8"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 6 }}>
                <Text style={styles.label}>Email (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="driver@smartbus.lk"
                  keyboardType="email-address"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <Text style={styles.label}>NIC Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="199012345678"
                  placeholderTextColor="#94A3B8"
                  value={nic}
                  onChangeText={setNic}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 6 }}>
                <Text style={styles.label}>License Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="B1234567"
                  placeholderTextColor="#94A3B8"
                  value={licenseNo}
                  onChangeText={setLicenseNo}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <Text style={styles.label}>License Class</Text>
                <TouchableOpacity
                  style={styles.dropdownPicker}
                  onPress={() => setShowClassPicker(!showClassPicker)}
                >
                  <Text style={styles.dropdownText}>{licenseClass}</Text>
                  <ChevronDown size={18} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={{ flex: 1, marginLeft: 6 }}>
                <Text style={styles.label}>License Expiry Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94A3B8"
                  value={licenseExpiry}
                  onChangeText={setLicenseExpiry}
                />
              </View>
            </View>

            {/* License Class Picker Inline Options */}
            {showClassPicker && (
              <View style={styles.classOptionsCard}>
                {licenseClasses.map(cls => (
                  <TouchableOpacity
                    key={cls}
                    style={styles.classOptionItem}
                    onPress={() => {
                      setLicenseClass(cls);
                      setShowClassPicker(false);
                    }}
                  >
                    <Text style={styles.classOptionText}>{cls}</Text>
                    {licenseClass === cls && <Check size={16} color={COLORS.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="Create strong password"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              value={signupPassword}
              onChangeText={setSignupPassword}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleSignupSubmit}>
              <Text style={styles.submitBtnText}>Register & Continue</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Location Permission Dialog Modal */}
      <Modal
        visible={showPermissionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPermissionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.permissionCard}>
            <View style={styles.locationIconBadge}>
              <MapPin size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.permissionTitle}>Allow Location Access</Text>
            <Text style={styles.permissionDesc}>
              SmartBus Driver requires continuous foreground & background location access while on an active trip to broadcast live bus positions to passengers waiting at stops.
            </Text>

            <TouchableOpacity
              style={styles.allowBtn}
              onPress={acceptLocationPermission}
            >
              <ShieldCheck size={20} color={COLORS.white} style={{ marginRight: 8 }} />
              <Text style={styles.allowBtnText}>Grant Location Permission</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.denyBtn}
              onPress={() => {
                setShowPermissionModal(false);
                if (pendingCallback) pendingCallback();
              }}
            >
              <Text style={styles.denyBtnText}>Skip for Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 12,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.darkBlue,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.darkBlue,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eyeIcon: {
    position: 'absolute',
    right: 14,
  },
  row: {
    flexDirection: 'row',
  },
  dropdownPicker: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dropdownText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  classOptionsCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
  },
  classOptionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
  },
  classOptionText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  permissionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  locationIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  permissionDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  allowBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    marginBottom: 10,
  },
  allowBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  denyBtn: {
    paddingVertical: 10,
  },
  denyBtnText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
