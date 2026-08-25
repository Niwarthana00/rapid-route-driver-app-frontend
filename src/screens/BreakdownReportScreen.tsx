import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AlertCircle,
  MapPin,
  CheckCircle2,
  Info,
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
  const { reportBreakdown } = useAppState();

  const [selectedReason, setSelectedReason] = useState('Engine issue');
  const [notes, setNotes] = useState('');
  const [isAlertSent, setIsAlertSent] = useState(false);

  const handleSubmit = () => {
    reportBreakdown(selectedReason, notes);
    setIsAlertSent(true);

    setTimeout(() => {
      onAlertSent();
    }, 2800);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Title with Alert Circle Icon */}
        <View style={styles.headerRow}>
          <AlertCircle size={28} color="#EF4444" style={{ marginRight: 10 }} />
          <Text style={styles.headerTitle}>Report Breakdown</Text>
        </View>

        {/* Current Location Card */}
        <View style={styles.locationCard}>
          <MapPin size={22} color={COLORS.primary} />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.locationLabel}>Current Location</Text>
            <Text style={styles.locationName}>Rajagiriya Junction, Colombo</Text>
          </View>
        </View>

        {/* Breakdown Reason Choices */}
        <Text style={styles.sectionLabel}>Breakdown Reason</Text>
        <View style={styles.reasonGrid}>
          {breakdownReasons.map(reason => {
            const isSelected = selectedReason === reason;
            return (
              <TouchableOpacity
                key={reason}
                style={[
                  styles.reasonButton,
                  isSelected ? styles.selectedReasonBtn : styles.unselectedReasonBtn,
                ]}
                onPress={() => setSelectedReason(reason)}
              >
                <Text
                  style={[
                    styles.reasonText,
                    isSelected ? styles.selectedReasonText : styles.unselectedReasonText,
                  ]}
                >
                  {reason}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Notes (Optional) */}
        <Text style={styles.sectionLabel}>Notes (Optional)</Text>
        <View style={styles.textAreaContainer}>
          <TextInput
            style={styles.textArea}
            placeholder="Add any additional details..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        {/* Send Alert to Admin Button */}
        <TouchableOpacity style={styles.sendAlertBtn} onPress={handleSubmit}>
          <Text style={styles.sendAlertText}>Send Alert to Admin</Text>
        </TouchableOpacity>

        {/* Status Confirmation Cards matching exact reference image */}
        {isAlertSent && (
          <View style={styles.alertsContainer}>
            {/* Green Admin Notified Card */}
            <View style={styles.adminNotifiedCard}>
              <CheckCircle2 size={20} color="#10B981" style={{ marginRight: 10 }} />
              <Text style={styles.adminNotifiedText}>
                Admin notified. Alternative bus being arranged.
              </Text>
            </View>

            {/* Blue Passengers Auto-Notified Card */}
            <View style={styles.passengersNotifiedCard}>
              <Info size={20} color={COLORS.primary} style={{ marginRight: 10 }} />
              <Text style={styles.passengersNotifiedText}>
                Passengers auto-notified
              </Text>
            </View>
          </View>
        )}

      </ScrollView>
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
    paddingVertical: 24,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#EF4444',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  locationLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  locationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  reasonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  reasonButton: {
    width: '48%',
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
  },
  selectedReasonBtn: {
    backgroundColor: '#F0F9FF',
    borderColor: COLORS.primary,
  },
  unselectedReasonBtn: {
    backgroundColor: COLORS.white,
    borderColor: '#E2E8F0',
  },
  reasonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  selectedReasonText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  unselectedReasonText: {
    color: '#64748B',
  },
  textAreaContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 28,
  },
  textArea: {
    fontSize: 15,
    color: '#0F172A',
    minHeight: 90,
  },
  sendAlertBtn: {
    backgroundColor: '#E55353', // Soft red matching reference image
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#E55353',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  sendAlertText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
  alertsContainer: {
    marginTop: 8,
  },
  adminNotifiedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  adminNotifiedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
    flex: 1,
  },
  passengersNotifiedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 16,
    padding: 16,
  },
  passengersNotifiedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0369A1',
    flex: 1,
  },
});
