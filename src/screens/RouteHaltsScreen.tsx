import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Edit2, Play, Check, ChevronLeft, RefreshCw } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { useAppState } from '../context/AppStateContext';

interface RouteHaltsScreenProps {
  onBack: () => void;
  onConfirmStart: () => void;
}

export const RouteHaltsScreen: React.FC<RouteHaltsScreenProps> = ({
  onBack,
  onConfirmStart,
}) => {
  const { activeRoute, activeRouteName, halts, isSyncing, refreshHalts, updateHaltName, confirmStartTrip } = useAppState();

  const [editingHaltId, setEditingHaltId] = useState<string | null>(null);
  const [editingHaltName, setEditingHaltName] = useState('');

  useEffect(() => {
    refreshHalts();
  }, [refreshHalts]);

  const openEditModal = (id: string, currentName: string) => {
    setEditingHaltId(id);
    setEditingHaltName(currentName);
  };

  const saveHaltEdit = () => {
    if (editingHaltId && editingHaltName.trim()) {
      updateHaltName(editingHaltId, editingHaltName.trim());
    }
    setEditingHaltId(null);
  };

  const handleStartTrip = () => {
    confirmStartTrip();
    onConfirmStart();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Bar with Back Button */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <ChevronLeft size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Route Itinerary</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => refreshHalts()}>
            {isSyncing ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <RefreshCw size={18} color="#64748B" />
            )}
          </TouchableOpacity>
        </View>

        {/* Header Title & Subtitle */}
        <View style={styles.header}>
          <Text style={styles.routeCodeTitle}>{activeRoute}</Text>
          <View style={styles.routeDetailsRow}>
            <Text style={styles.routeLocationText}>
              {activeRouteName.split(' to ')[0]}
            </Text>
            <View style={styles.locationDivider} />
            <Text style={styles.routeLocationText}>
              {activeRouteName.split(' to ')[1] || 'Destination'}
            </Text>
          </View>
        </View>

        {/* Halts List */}
        <View style={styles.haltsList}>
          {isSyncing && halts.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={{ marginTop: 12, fontSize: 14, color: '#64748B', fontWeight: '500' }}>
                Fetching route halts from database...
              </Text>
            </View>
          ) : halts.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <Text style={{ fontSize: 15, color: '#64748B', fontWeight: '600' }}>
                No active route halts found.
              </Text>
              <TouchableOpacity
                style={{ marginTop: 12, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#E0F2FE', borderRadius: 10 }}
                onPress={() => refreshHalts()}
              >
                <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Tap to Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            halts.map((halt, index) => (
              <View key={halt.id} style={styles.haltCard}>
                <View style={styles.numberCircle}>
                  <Text style={styles.numberText}>{index + 1}</Text>
                </View>

                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.haltName}>{halt.name}</Text>
                  {halt.scheduledTime && <Text style={styles.scheduledTime}>{halt.scheduledTime}</Text>}
                </View>

                <TouchableOpacity
                  style={styles.editIconBtn}
                  onPress={() => openEditModal(halt.id, halt.name)}
                >
                  <Edit2 size={18} color="#64748B" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Bottom Confirm & Start Trip Button */}
        {halts.length > 0 && (
          <TouchableOpacity style={styles.confirmStartBtn} onPress={handleStartTrip}>
            <Text style={styles.confirmStartText}>Confirm & Start Trip</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Edit Halt Modal */}
      <Modal visible={!!editingHaltId} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Halt Name</Text>
            <TextInput
              style={styles.modalInput}
              value={editingHaltName}
              onChangeText={setEditingHaltName}
              placeholder="Halt Name"
              placeholderTextColor="#94A3B8"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setEditingHaltId(null)}
              >
                <Text style={styles.cancelModalText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveModalBtn} onPress={saveHaltEdit}>
                <Check size={18} color={COLORS.white} style={{ marginRight: 4 }} />
                <Text style={styles.saveModalText}>Save Changes</Text>
              </TouchableOpacity>
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
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  header: {
    marginBottom: 20,
    marginTop: 4,
  },
  routeCodeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  routeDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  routeLocationText: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  locationDivider: {
    width: 2,
    height: 14,
    backgroundColor: '#94A3B8',
    marginHorizontal: 8,
  },
  haltsList: {
    marginBottom: 24,
  },
  haltCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1.5,
  },
  numberCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  haltName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  scheduledTime: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  editIconBtn: {
    padding: 8,
  },
  confirmStartBtn: {
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
  confirmStartText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 14,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelModalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  cancelModalText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  saveModalBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  saveModalText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
