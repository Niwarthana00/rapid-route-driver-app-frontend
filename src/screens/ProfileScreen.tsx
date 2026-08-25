import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Phone,
  Bus,
  FileText,
  Bell,
  Globe,
  HelpCircle,
  LogOut,
  ChevronRight,
  Edit2,
  X,
  Check,
  Camera,
} from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { useAppState } from '../context/AppStateContext';

export const ProfileScreen: React.FC = () => {
  const { driverName, driverPhone, vehicleNo, logout } = useAppState();

  const [name, setName] = useState(driverName);
  const [phoneStr, setPhoneStr] = useState(driverPhone);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleSaveProfile = () => {
    setShowEditModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Title */}
        <Text style={styles.screenTitle}>Profile</Text>

        {/* Profile Card Header matching Passenger App image format */}
        <View style={styles.headerProfileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>

          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.profileName}>{name}</Text>
            <Text style={styles.profilePhone}>{phoneStr}</Text>
          </View>

          <TouchableOpacity style={styles.editProfileBtn} onPress={() => setShowEditModal(true)}>
            <Edit2 size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Main Settings Options Group matching image format */}
        <View style={styles.optionsCard}>
          {/* Assigned Bus Info */}
          <TouchableOpacity style={styles.optionRow}>
            <View style={styles.optionIconCircle}>
              <Bus size={20} color="#0F172A" />
            </View>
            <Text style={styles.optionTitle}>Assigned Bus ({vehicleNo.split(' ')[0]})</Text>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* Driver License Details */}
          <TouchableOpacity style={styles.optionRow}>
            <View style={styles.optionIconCircle}>
              <FileText size={20} color="#0F172A" />
            </View>
            <Text style={styles.optionTitle}>Driving License & Documents</Text>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* Notifications */}
          <TouchableOpacity style={styles.optionRow}>
            <View style={styles.optionIconCircle}>
              <Bell size={20} color="#0F172A" />
            </View>
            <Text style={styles.optionTitle}>Notifications</Text>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* Language */}
          <TouchableOpacity style={styles.optionRow}>
            <View style={styles.optionIconCircle}>
              <Globe size={20} color="#0F172A" />
            </View>
            <Text style={styles.optionTitle}>Language</Text>
            <Text style={styles.optionValue}>English</Text>
            <ChevronRight size={18} color="#94A3B8" style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* Help & Support */}
          <TouchableOpacity style={styles.optionRow}>
            <View style={styles.optionIconCircle}>
              <HelpCircle size={20} color="#0F172A" />
            </View>
            <Text style={styles.optionTitle}>Help & Support</Text>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Separate Log Out Card matching exact image format */}
        <TouchableOpacity style={styles.logoutCard} onPress={logout}>
          <View style={styles.logoutIconCircle}>
            <LogOut size={20} color="#EF4444" />
          </View>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Details Modal */}
      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile Details</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Full Name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputField}
                value={name}
                onChangeText={setName}
                placeholder="Driver Name"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <Text style={styles.fieldLabel}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputField}
                value={phoneStr}
                onChangeText={setPhoneStr}
                keyboardType="phone-pad"
                placeholder="Phone Number"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
              <Check size={18} color={COLORS.white} style={{ marginRight: 6 }} />
              <Text style={styles.saveBtnText}>Save Profile Changes</Text>
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
    paddingHorizontal: 20,
    paddingTop: 36, // Safe Top Spacing
    paddingBottom: 90,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 20,
  },
  headerProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#2D6A4F', // Dark green outline circle matching image format
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D6A4F',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  profilePhone: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  editProfileBtn: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
  },
  optionsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  optionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  optionValue: {
    fontSize: 14,
    color: '#94A3B8',
    marginRight: 4,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  logoutCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  logoutIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 12,
  },
  inputField: {
    fontSize: 15,
    color: '#0F172A',
    width: '100%',
  },
  saveBtn: {
    backgroundColor: COLORS.primary, // #0E86D4
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
