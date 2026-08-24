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
import { ArrowLeft, Clock, Edit2, Play, MapPin, Check } from 'lucide-react-native';
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
  const { activeRoute, activeRouteName, halts, updateHaltName, confirmStartTrip } = useAppState();

  const [editingHaltId, setEditingHaltId] = useState<string | null>(null);
  const [editingHaltName, setEditingHaltName] = useState('');

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
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Route Halts Review</Text>
          <Text style={styles.headerSubtitle}>{activeRoute} - {activeRouteName}</Text>
        </View>
      </View>

      {/* Halts List */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoBanner}>
          <MapPin size={18} color={COLORS.primary} />
          <Text style={styles.infoBannerText}>
            Review schedule and edit stop labels before starting trip tracking.
          </Text>
        </View>

        <View style={styles.timelineContainer}>
          {halts.map((halt, index) => {
            const isFirst = index === 0;
            const isLast = index === halts.length - 1;

            return (
              <View key={halt.id} style={styles.timelineItem}>
                {/* Timeline node line */}
                <View style={styles.nodeColumn}>
                  <View
                    style={[
                      styles.nodeCircle,
                      isFirst && styles.startNode,
                      isLast && styles.endNode,
                    ]}
                  >
                    <Text
                      style={[
                        styles.nodeNumber,
                        (isFirst || isLast) && { color: COLORS.white },
                      ]}
                    >
                      {index + 1}
                    </Text>
                  </View>
                  {!isLast && <View style={styles.nodeLine} />}
                </View>

                {/* Halt Card */}
                <View style={styles.haltCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.haltName}>{halt.name}</Text>
                    <View style={styles.timeRow}>
                      <Clock size={14} color={COLORS.textSecondary} />
                      <Text style={styles.timeText}>{halt.scheduledTime}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => openEditModal(halt.id, halt.name)}
                  >
                    <Edit2 size={16} color={COLORS.primary} />
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View style={styles.footerBar}>
        <TouchableOpacity style={styles.confirmStartBtn} onPress={handleStartTrip}>
          <Play size={20} color={COLORS.white} style={{ marginRight: 8 }} />
          <Text style={styles.confirmStartText}>Confirm & Start Trip</Text>
        </TouchableOpacity>
      </View>

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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoBannerText: {
    fontSize: 13,
    color: '#0369A1',
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  timelineContainer: {
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  nodeColumn: {
    alignItems: 'center',
    marginRight: 14,
  },
  nodeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  startNode: {
    backgroundColor: COLORS.primary,
  },
  endNode: {
    backgroundColor: COLORS.darkBlue,
  },
  nodeNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  nodeLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 4,
  },
  haltCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  haltName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 4,
  },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  confirmStartBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmStartText: {
    color: COLORS.white,
    fontSize: 16,
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
