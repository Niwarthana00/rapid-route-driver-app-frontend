import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {
  Bus,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  CheckCircle,
  AlertCircle,
  Phone,
  User,
  CreditCard,
  ChevronDown,
  Mail,
} from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { useAppState } from '../context/AppStateContext';

export const AuthScreen: React.FC = () => {
  const { login, signup, hasLocationPermission, setHasLocationPermission } = useAppState();

  const [isSignUp, setIsSignUp] = useState(false);

  // Form states (Pre-filled with test credentials)
  const [identifier, setIdentifier] = useState('driver@rapidroute.com');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);

  // Signup extra states
  const [fullName, setFullName] = useState('Kamal Perera');
  const [phone, setPhone] = useState('0771234567');
  const [nic, setNic] = useState('881234567V');
  const [licenseNo, setLicenseNo] = useState('B9482910');
  const [licenseClass, setLicenseClass] = useState('B (Route Bus)');

  const [showClassPicker, setShowClassPicker] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const licenseClasses = ['A (Motorcycle)', 'B (Route Bus)', 'C (Heavy Vehicle)', 'D (Trailer)'];

  const handleContinue = async () => {
    setFeedbackMsg(null);
    if (!hasLocationPermission) {
      setShowPermissionModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      if (!isSignUp) {
        if (!identifier || !password) {
          setFeedbackMsg({ text: 'Please enter your email/phone and password', isError: true });
          return;
        }
        const res = await login(identifier, password);
        if (!res.success && res.message) {
          setFeedbackMsg({ text: res.message, isError: true });
        }
      } else {
        if (!fullName || !phone || !identifier || !password) {
          setFeedbackMsg({ text: 'Please fill in all required fields', isError: true });
          return;
        }
        const res = await signup({
          fullName,
          phone,
          email: identifier,
          password,
          nicNumber: nic,
          licenseNumber: licenseNo,
          licenseClass,
        });
        if (!res.success && res.message) {
          setFeedbackMsg({ text: res.message, isError: true });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGrantPermission = () => {
    setHasLocationPermission(true);
    setShowPermissionModal(false);
    handleContinue();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Brand Logo */}
          <View style={styles.brandHeader}>
            <View style={styles.logoBadge}>
              <Bus size={36} color={COLORS.white} />
            </View>
            <Text style={styles.brandTitle}>SmartBus Driver</Text>
            <Text style={styles.brandSubtitle}>
              {isSignUp ? 'Create your driver account' : 'Your route. Your control.'}
            </Text>
          </View>

          {/* Feedback banner */}
          {feedbackMsg && (
            <View style={[styles.feedbackBanner, feedbackMsg.isError ? styles.errorBanner : styles.successBanner]}>
              <AlertCircle size={16} color={feedbackMsg.isError ? '#EF4444' : '#10B981'} style={{ marginRight: 8 }} />
              <Text style={[styles.feedbackText, { color: feedbackMsg.isError ? '#B91C1C' : '#047857' }]}>
                {feedbackMsg.text}
              </Text>
            </View>
          )}

          {/* Form Card */}
          <View style={styles.formCard}>
            {isSignUp && (
              <>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <User size={18} color="#94A3B8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Kamal Perera"
                    placeholderTextColor="#94A3B8"
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>

                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={styles.inputWrapper}>
                  <Phone size={18} color="#94A3B8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="0771234567"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>

                <Text style={styles.inputLabel}>Driving License Number</Text>
                <View style={styles.inputWrapper}>
                  <CreditCard size={18} color="#94A3B8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. B9482910"
                    placeholderTextColor="#94A3B8"
                    value={licenseNo}
                    onChangeText={setLicenseNo}
                  />
                </View>
              </>
            )}

            <Text style={styles.inputLabel}>Email or Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="driver@rapidroute.com"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                value={identifier}
                onChangeText={setIdentifier}
              />
            </View>

            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword ? (
                  <EyeOff size={18} color="#94A3B8" />
                ) : (
                  <Eye size={18} color="#94A3B8" />
                )}
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && { opacity: 0.8 }]}
              onPress={handleContinue}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isSignUp ? 'Create Account' : 'Continue'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Toggle View Link */}
            <View style={styles.switchAuthRow}>
              <Text style={styles.switchAuthText}>
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              </Text>
              <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                <Text style={styles.switchAuthLink}>
                  {isSignUp ? 'Log in' : 'Create new account'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Location Permission Modal */}
      <Modal visible={showPermissionModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.permissionCard}>
            <View style={styles.permissionIconCircle}>
              <MapPin size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.permissionTitle}>Allow Location Access</Text>
            <Text style={styles.permissionBody}>
              SmartBus Driver requires your background location to broadcast live bus tracking and
              manage halt arrivals for passengers.
            </Text>
            <TouchableOpacity
              style={styles.grantButton}
              onPress={handleGrantPermission}
            >
              <Text style={styles.grantButtonText}>Grant & Continue</Text>
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
    paddingTop: 40,
    paddingBottom: 40,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.primary, // #0E86D4
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  brandSubtitle: {
    fontSize: 15,
    color: '#64748B',
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  successBanner: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
  },
  eyeBtn: {
    padding: 6,
  },
  submitButton: {
    backgroundColor: COLORS.primary, // #0E86D4
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
  switchAuthRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  switchAuthText: {
    fontSize: 14,
    color: '#64748B',
  },
  switchAuthLink: {
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
  permissionIconCircle: {
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
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  permissionBody: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  grantButton: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grantButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
