import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
} from 'react-native';
import {
  Fuel,
  Plus,
  Calendar,
  MapPin,
  X,
  Check,
  TrendingUp,
} from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { useAppState } from '../context/AppStateContext';

export const FuelLogScreen: React.FC = () => {
  const { fuelLogs, totalFuelToday, totalFuelMonth, addFuelLog } = useAppState();

  const [showAddModal, setShowAddModal] = useState(false);
  const [liters, setLiters] = useState('');
  const [cost, setCost] = useState('');
  const [station, setStation] = useState('');

  const handleSaveLog = () => {
    if (!liters || !cost || !station) {
      return;
    }
    addFuelLog({
      date: 'May 25, 2026',
      amount: parseFloat(cost),
      liters: parseFloat(liters),
      station,
    });
    setLiters('');
    setCost('');
    setStation('');
    setShowAddModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>Costs & Fuel Log</Text>
        <Text style={styles.headerSubtitle}>Track bus fuel expenses and refill logs</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* KPI Summary Cards */}
        <View style={styles.kpiContainer}>
          <View style={[styles.kpiCard, { backgroundColor: COLORS.darkBlue }]}>
            <Text style={styles.kpiHeaderLabel}>Today's Fuel Cost</Text>
            <Text style={styles.kpiMainValue}>LKR {totalFuelToday.toLocaleString()}</Text>
            <View style={styles.kpiSubRow}>
              <TrendingUp size={14} color="#93C5FD" />
              <Text style={styles.kpiSubText}>45 Liters pumped today</Text>
            </View>
          </View>

          <View style={[styles.kpiCard, { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border }]}>
            <Text style={[styles.kpiHeaderLabel, { color: COLORS.textSecondary }]}>Monthly Total</Text>
            <Text style={[styles.kpiMainValue, { color: COLORS.textPrimary }]}>
              LKR {totalFuelMonth.toLocaleString()}
            </Text>
            <Text style={[styles.kpiSubText, { color: COLORS.textSecondary }]}>May 2026 cumulative</Text>
          </View>
        </View>

        {/* Transaction History List */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Fuel Entries</Text>
          <Text style={styles.logCountText}>{fuelLogs.length} Records</Text>
        </View>

        {fuelLogs.map(log => (
          <View key={log.id} style={styles.logCard}>
            <View style={styles.logIconCircle}>
              <Fuel size={20} color={COLORS.primary} />
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.stationName}>{log.station}</Text>
              <View style={styles.metaRow}>
                <Calendar size={12} color={COLORS.textSecondary} />
                <Text style={styles.metaText}>{log.date}</Text>
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={styles.litersText}>{log.liters} Liters</Text>
              </View>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.amountText}>LKR {log.amount.toLocaleString()}</Text>
              <View style={styles.receiptTag}>
                <Text style={styles.receiptTagText}>Logged</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Floating Plus Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
        <Plus size={26} color={COLORS.white} />
      </TouchableOpacity>

      {/* Add Fuel Transaction Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Fuel Transaction</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Station Name / Location</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Pettah Fuel Station"
              placeholderTextColor="#94A3B8"
              value={station}
              onChangeText={setStation}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <Text style={styles.label}>Fuel Volume (L)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="45"
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
                  value={liters}
                  onChangeText={setLiters}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 6 }}>
                <Text style={styles.label}>Total Amount (LKR)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="9450"
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
                  value={cost}
                  onChangeText={setCost}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.saveLogBtn} onPress={handleSaveLog}>
              <Check size={18} color={COLORS.white} style={{ marginRight: 6 }} />
              <Text style={styles.saveLogText}>Save Fuel Record</Text>
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
  topHeader: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  kpiContainer: {
    marginBottom: 20,
  },
  kpiCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 10,
  },
  kpiHeaderLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  kpiMainValue: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
    marginVertical: 4,
  },
  kpiSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kpiSubText: {
    fontSize: 13,
    color: '#93C5FD',
    marginLeft: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  logCountText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  logCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stationName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  dotSeparator: {
    marginHorizontal: 6,
    color: COLORS.textSecondary,
  },
  litersText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.darkBlue,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  receiptTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  receiptTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
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
    color: COLORS.textPrimary,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
    marginTop: 8,
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
  row: {
    flexDirection: 'row',
  },
  saveLogBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  saveLogText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
