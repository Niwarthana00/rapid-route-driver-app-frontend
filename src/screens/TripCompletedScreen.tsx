import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {
  CheckCircle2,
  AlertCircle,
  Bus,
  Clock,
  Users,
  Fuel,
  Wrench,
  ArrowRight,
} from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { useAppState } from '../context/AppStateContext';

interface TripCompletedScreenProps {
  onDone: () => void;
}

export const TripCompletedScreen: React.FC<TripCompletedScreenProps> = ({ onDone }) => {
  const {
    activeRoute,
    passengersToday,
    totalFuelToday,
    totalRepairToday,
    documents,
  } = useAppState();

  const expiringDoc = documents.find(d => d.status === 'warning' || d.status === 'expired');

  const totalCost = totalFuelToday + totalRepairToday;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Success Row matching exact reference screenshot */}
        <View style={styles.headerRow}>
          <CheckCircle2 size={32} color="#34D399" style={{ marginRight: 10 }} />
          <Text style={styles.headerTitle}>Trip Completed!</Text>
        </View>

        {/* Trip Stats Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Trip Stats</Text>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Route</Text>
            <Text style={styles.statValue}>{activeRoute}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Duration</Text>
            <View style={styles.durationValueRow}>
              <Text style={styles.statValue}>06:00 AM</Text>
              <View style={styles.timeDivider} />
              <Text style={styles.statValue}>07:25 AM</Text>
            </View>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Halts Completed</Text>
            <Text style={styles.statValue}>7 / 7</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Passengers Carried</Text>
            <Text style={styles.statValue}>{passengersToday}</Text>
          </View>
        </View>

        {/* Today's Costs Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Today's Costs</Text>

          <View style={styles.statRow}>
            <View style={styles.iconLabelRow}>
              <Fuel size={18} color="#64748B" style={{ marginRight: 8 }} />
              <Text style={styles.statLabel}>Fuel Cost</Text>
            </View>
            <Text style={styles.statValue}>LKR {totalFuelToday.toLocaleString()}</Text>
          </View>

          <View style={styles.statRow}>
            <View style={styles.iconLabelRow}>
              <Wrench size={18} color="#64748B" style={{ marginRight: 8 }} />
              <Text style={styles.statLabel}>Repair Cost</Text>
            </View>
            <Text style={styles.statValue}>LKR {totalRepairToday.toLocaleString()}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>LKR {totalCost.toLocaleString()}</Text>
          </View>
        </View>

        {/* Document Status Warning Card matching reference image */}
        {expiringDoc && (
          <View style={styles.documentWarningCard}>
            <AlertCircle size={22} color="#D97706" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.docWarningTitle}>Document Status</Text>
              <Text style={styles.docWarningSubtitle}>
                {expiringDoc.name} expires in {expiringDoc.daysRemaining || 18} days
              </Text>
            </View>
          </View>
        )}

        {/* Primary Done Action Button */}
        <TouchableOpacity style={styles.doneBtn} onPress={onDone}>
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
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
    fontSize: 28,
    fontWeight: '800',
    color: '#34D399', // Emerald Green matching reference image
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  iconLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeDivider: {
    width: 2,
    height: 12,
    backgroundColor: '#94A3B8',
    marginHorizontal: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#059669', // Darker Green total
  },
  documentWarningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  docWarningTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#92400E',
  },
  docWarningSubtitle: {
    fontSize: 13,
    color: '#B45309',
    marginTop: 2,
  },
  doneBtn: {
    backgroundColor: COLORS.primary, // #0E86D4
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  doneBtnText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
});
