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
import { MapPin, Eye, EyeOff, ShieldCheck, ChevronDown, Check } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { useAppState } from '../context/AppStateContext';

export const AuthScreen: React.FC = () => {
  const { login, signup, setHasLocationPermission } = useAppState();
  const [isSignUp, setIsSignUp] = useState(false);

  // Login form state
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
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
    if (!emailInput || !passwordInput) {
      Alert.alert('Required Fields', 'Please enter your email/phone and password.');
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
        
        {!isSignUp ? (
          /* LOGIN SCREEN matching image style */
          <View style={styles.contentWrapper}>
            <Text style={styles.welcomeTitle}>Welcome back</Text>
            <Text style={styles.welcomeSubtitle}>Enter your email & password to continue</Text>

            {/* Email Field */}
            <Text style={styles.fieldLabel}>Email or Phone</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputField}
                placeholder="77 123 4567 or driver@smartbus.lk"
                placeholderTextColor="#94A3B8"
                value={emailInput}
                onChangeText={setEmailInput}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Field */}
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.inputField, { flex: 1 }]}
                placeholder="Enter password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                value={passwordInput}
                onChangeText={setPasswordInput}
              />
              <TouchableOpacity
                style={styles.eyeIconBtn}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color={COLORS.textSecondary} />
                ) : (
                  <Eye size={20} color={COLORS.textSecondary} />
                )}
              </TouchableOpacity>
            </View>

            {/* Continue Primary Button */}
            <TouchableOpacity style={styles.primaryContinueBtn} onPress={handleLoginSubmit}>
              <Text style={styles.continueBtnText}>Continue</Text>
            </TouchableOpacity>

            {/* Create New Account Link */}
            <View style={styles.linkContainer}>
              <Text style={styles.noAccountText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => setIsSignUp(true)}>
                <Text style={styles.createAccountLink}>Create new account</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* SIGNUP SCREEN */
          <View style={styles.contentWrapper}>
            <Text style={styles.welcomeTitle}>Create account</Text>
            <Text style={styles.welcomeSubtitle}>Register as an authorized SmartBus Driver</Text>

            <Text style={styles.fieldLabel}>Full Name *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputField}
                placeholder="Kusum Perera"
                placeholderTextColor="#94A3B8"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <Text style={styles.fieldLabel}>Phone Number *</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.inputField}
                    placeholder="0771234567"
                    keyboardType="phone-pad"
                    placeholderTextColor="#94A3B8"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>
              </View>

              <View style={{ flex: 1, marginLeft: 6 }}>
                <Text style={styles.fieldLabel}>Email (Optional)</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.inputField}
                    placeholder="driver@smartbus.lk"
                    keyboardType="email-address"
                    placeholderTextColor="#94A3B8"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <Text style={styles.fieldLabel}>NIC Number *</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.inputField}
                    placeholder="199012345678"
                    placeholderTextColor="#94A3B8"
                    value={nic}
                    onChangeText={setNic}
                  />
                </View>
              </View>

              <View style={{ flex: 1, marginLeft: 6 }}>
                <Text style={styles.fieldLabel}>License Number *</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.inputField}
                    placeholder="B1234567"
                    placeholderTextColor="#94A3B8"
                    value={licenseNo}
                    onChangeText={setLicenseNo}
                  />
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <Text style={styles.fieldLabel}>License Class</Text>
                <TouchableOpacity
                  style={styles.dropdownPicker}
                  onPress={() => setShowClassPicker(!showClassPicker)}
                >
                  <Text style={styles.dropdownText}>{licenseClass}</Text>
                  <ChevronDown size={18} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={{ flex: 1, marginLeft: 6 }}>
                <Text style={styles.fieldLabel}>License Expiry</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.inputField}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#94A3B8"
                    value={licenseExpiry}
                    onChangeText={setLicenseExpiry}
                  />
                </View>
              </View>
            </View>

            {/* License Class Dropdown Options */}
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

            <Text style={styles.fieldLabel}>Password *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputField}
                placeholder="Create strong password"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                value={signupPassword}
                onChangeText={setSignupPassword}
              />
            </View>

            {/* Primary Register Button */}
            <TouchableOpacity style={styles.primaryContinueBtn} onPress={handleSignupSubmit}>
              <Text style={styles.continueBtnText}>Register & Continue</Text>
            </TouchableOpacity>

            {/* Back to Login Link */}
            <View style={styles.linkContainer}>
              <Text style={styles.noAccountText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => setIsSignUp(false)}>
                <Text style={styles.createAccountLink}>Log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Location Permission Modal */}
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
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 36,
    flexGrow: 1,
    justifyContent: 'center',
  },
  contentWrapper: {
    width: '100%',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 28,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    marginBottom: 8,
  },
  inputField: {
    fontSize: 15,
    color: '#0F172A',
    width: '100%',
  },
  eyeIconBtn: {
    position: 'absolute',
    right: 16,
  },
  dropdownPicker: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dropdownText: {
    fontSize: 14,
    color: '#0F172A',
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
    color: '#0F172A',
  },
  row: {
    flexDirection: 'row',
  },
  primaryContinueBtn: {
    backgroundColor: COLORS.primary, // #0E86D4
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  continueBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  noAccountText: {
    fontSize: 14,
    color: '#64748B',
  },
  createAccountLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
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
