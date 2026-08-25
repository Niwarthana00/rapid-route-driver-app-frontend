import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Fuel,
  Wrench,
  Plus,
  X,
  Check,
} from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { useAppState, CostItem } from '../context/AppStateContext';

export const FuelLogScreen: React.FC = () => {
  const { costs, totalFuelToday, totalRepairToday, totalFuelMonth, addCostLog } = useAppState();

  const [showAddModal, setShowAddModal] = useState(false);
  const [costType, setCostType] = useState<'FUEL' | 'REPAIR'>('FUEL');
  const [amount, setAmount] = useState('');
  const [liters, setLiters] = useState('');
  const [description, setDescription] = useState('');

  const handleSaveCost = () => {
    if (!amount || !description) {
      return;
    }
    addCostLog({
      type: costType,
      date: 'May 25, 2026',
      amount: parseFloat(amount),
      liters: costType === 'FUEL' && liters ? parseFloat(liters) : undefined,
      stationOrDescription: description,
    });
    setAmount('');
    setLiters('');
    setDescription('');
    setShowAddModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Header Bar */}
        <View style={styles.topHeader}>
          <Text style={styles.headerTitle}>Costs & Fuel Log</Text>
          <Text style={styles.headerSubtitle}>Track bus fuel expenses and repair logs</Text>
        </View>

        {/* KPI Summary Cards */}
        <View style={styles.kpiContainer}>
          <View style={[styles.kpiCard, { backgroundColor: COLORS.primary }]}>
            <Text style={styles.kpiHeaderLabel}>Today's Total Costs</Text>
            <Text style={styles.kpiMainValue}>
              LKR {(totalFuelToday + totalRepairToday).toLocaleString()}
            </Text>
            <View style={styles.kpiSubRow}>
              <Text style={styles.kpiSubText}>
                Fuel: LKR {totalFuelToday.toLocaleString()} • Repair: LKR {totalRepairToday.toLocaleString()}
              </Text>
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
          <Text style={styles.sectionTitle}>Recent Cost Logs</Text>
          <Text style={styles.logCountText}>{costs.length} Records</Text>
        </View>

        {costs.map(log => (
          <View key={log.id} style={styles.logCard}>
            <View
              style={[
                styles.logIconCircle,
                log.type === 'REPAIR' && { backgroundColor: '#FEF2F2' },
              ]}
            >
              {log.type === 'FUEL' ? (
                <Fuel size={20} color={COLORS.primary} />
              ) : (
                <Wrench size={20} color="#EF4444" />
              )}
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.stationName}>{log.stationOrDescription}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.metaText}>{log.date}</Text>
                {log.type === 'FUEL' && log.liters && (
                  <>
                    <Text style={styles.dotSeparator}>•</Text>
                    <Text style={styles.litersText}>{log.liters} Liters</Text>
                  </>
                )}
              </View>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.amountText}>LKR {log.amount.toLocaleString()}</Text>
              <View
                style={[
                  styles.receiptTag,
                  log.type === 'REPAIR' && { backgroundColor: '#FEE2E2' },
                ]}
              >
                <Text
                  style={[
                    styles.receiptTagText,
                    log.type === 'REPAIR' && { color: '#991B1B' },
                  ]}
                >
                  {log.type}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Floating Plus Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
        <Plus size={26} color={COLORS.white} />
      </TouchableOpacity>

      {/* Add Cost Transaction Modal (Fuel & Repair Toggle) */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Bus Expense</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Type Switcher Pills */}
            <View style={styles.typeSwitchRow}>
              <TouchableOpacity
                style={[styles.typePill, costType === 'FUEL' && styles.activeTypePill]}
                onPress={() => setCostType('FUEL')}
              >
                <Fuel size={16} color={costType === 'FUEL' ? COLORS.white : '#64748B'} style={{ marginRight: 6 }} />
                <Text style={[styles.typePillText, costType === 'FUEL' && styles.activeTypePillText]}>Fuel Log</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typePill, costType === 'REPAIR' && styles.activeRepairPill]}
                onPress={() => setCostType('REPAIR')}
              >
                <Wrench size={16} color={costType === 'REPAIR' ? COLORS.white : '#64748B'} style={{ marginRight: 6 }} />
                <Text style={[styles.typePillText, costType === 'REPAIR' && styles.activeTypePillText]}>Repair / Maintenance</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>
              {costType === 'FUEL' ? 'Station Name / Location' : 'Repair Description'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={costType === 'FUEL' ? 'e.g. Pettah Fuel Station' : 'e.g. Tire Replacement or Engine Repair'}
              placeholderTextColor="#94A3B8"
              value={description}
              onChangeText={setDescription}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <Text style={styles.label}>Total Amount (LKR)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="9450"
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>

              {costType === 'FUEL' && (
                <View style={{ flex: 1, marginLeft: 6 }}>
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
              )}
            </View>

            <TouchableOpacity style={styles.saveLogBtn} onPress={handleSaveCost}>
              <Check size={18} color={COLORS.white} style={{ marginRight: 6 }} />
              <Text style={styles.saveLogText}>Save Cost Entry</Text>
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
  topHeader: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  kpiContainer: {
    marginBottom: 24,
  },
  kpiCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
  },
  kpiHeaderLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
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
    color: '#E0F2FE',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  logCountText: {
    fontSize: 13,
    color: '#64748B',
  },
  logCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
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
  logIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#64748B',
  },
  dotSeparator: {
    marginHorizontal: 6,
    color: '#94A3B8',
  },
  litersText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  amountText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  receiptTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
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
    backgroundColor: COLORS.primary, // #0E86D4
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  typeSwitchRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  typePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  activeTypePill: {
    backgroundColor: COLORS.primary,
  },
  activeRepairPill: {
    backgroundColor: '#EF4444',
  },
  typePillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTypePillText: {
    color: COLORS.white,
    fontWeight: '700',
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
    marginBottom: 16,
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
