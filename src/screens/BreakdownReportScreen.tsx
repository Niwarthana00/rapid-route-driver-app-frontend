import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
} from 'react-native';
import {
  ArrowLeft,
  AlertTriangle,
  MapPin,
  Send,
  CheckCircle2,
  BellRing,
} from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { useAppState } from '../context/AppStateContext';

interface BreakdownReportScreenProps {
  onBack: () => void;
  onAlertSent: () => void;
}

const breakdownReasons = [
  'Engine issue',
  'Tyre puncture',
  'Accident',
  'Other',
];

export const BreakdownReportScreen: React.FC<BreakdownReportScreenProps> = ({
  onBack,
  onAlertSent,
}) => {
  const { reportBreakdown, activeRoute } = useAppState();

  const [selectedReason, setSelectedReason] = useState('Engine issue');
  const [notes, setNotes] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = () => {
    reportBreakdown(selectedReason, notes);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
      onAlertSent();
    }, 2500);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Breakdown</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Warning Hero Box */}
        <View style={styles.warningBox}>
          <AlertTriangle size={32} color={COLORS.alert} />
          <Text style={styles.warningBoxTitle}>Emergency / Vehicle Breakdown</Text>
          <Text style={styles.warningBoxDesc}>
            Submitting this report will notify SmartBus dispatch admin immediately and update trip status to CANCELLED.
          </Text>
        </View>

        {/* Current Location */}
        <Text style={styles.label}>Current Location</Text>
        <View style={styles.locationCard}>
          <MapPin size={20} color={COLORS.primary} />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.locationTitle}>Rajagiriya Junction, Colombo</Text>
            <Text style={styles.locationCoords}>6.9083° N, 79.8964° E • GPS Verified</Text>
          </View>
        </View>

        {/* Breakdown Reason Choices */}
        <Text style={styles.label}>Breakdown Reason</Text>
        <View style={styles.pillRow}>
          {breakdownReasons.map(reason => {
            const isSelected = selectedReason === reason;
            return (
              <TouchableOpacity
                key={reason}
                style={[styles.pillBtn, isSelected && styles.pillBtnSelected]}
                onPress={() => setSelectedReason(reason)}
              >
                <Text
                  style={[
                    styles.pillBtnText,
                    isSelected && styles.pillBtnTextSelected,
                  ]}
                >
                  {reason}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Optional Notes */}
        <Text style={styles.label}>Optional Notes & Observations</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Provide additional details regarding the incident or bus location..."
          placeholderTextColor="#94A3B8"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={notes}
          onChangeText={setNotes}
        />

        {/* Action Button */}
        <TouchableOpacity style={styles.sendAlertBtn} onPress={handleSubmit}>
          <Send size={20} color={COLORS.white} style={{ marginRight: 8 }} />
          <Text style={styles.sendAlertText}>Send Alert to Admin</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Toast Overlay Notification */}
      <Modal visible={showToast} transparent animationType="fade">
        <View style={styles.toastOverlay}>
          <View style={styles.toastCard}>
            <View style={styles.toastIconCircle}>
              <BellRing size={28} color={COLORS.white} />
            </View>
            <Text style={styles.toastTitle}>Breakdown Alert Transmitted</Text>
            
            <View style={styles.toastBadgeRow}>
              <View style={styles.toastBadge}>
                <CheckCircle2 size={16} color={COLORS.success} />
                <Text style={styles.toastBadgeText}>Admin Notified</Text>
              </View>
              <View style={styles.toastBadge}>
                <CheckCircle2 size={16} color={COLORS.success} />
                <Text style={styles.toastBadgeText}>Passengers Auto-Notified</Text>
              </View>
            </View>
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  warningBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginBottom: 24,
  },
  warningBoxTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.alert,
    marginTop: 10,
    marginBottom: 4,
  },
  warningBoxDesc: {
    fontSize: 13,
    color: '#991B1B',
    textAlign: 'center',
    lineHeight: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  locationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  locationCoords: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  pillBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 10,
  },
  pillBtnSelected: {
    backgroundColor: COLORS.alert,
    borderColor: COLORS.alert,
  },
  pillBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  pillBtnTextSelected: {
    color: COLORS.white,
  },
  textArea: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 28,
    minHeight: 100,
  },
  sendAlertBtn: {
    backgroundColor: COLORS.alert,
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.alert,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  sendAlertText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  toastOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  toastCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  toastIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.alert,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  toastTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  toastBadgeRow: {
    width: '100%',
  },
  toastBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  toastBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    marginLeft: 8,
  },
});
