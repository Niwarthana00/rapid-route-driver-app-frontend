import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
} from 'react-native';
import {
  AlertTriangle,
  FileText,
  CheckCircle2,
  XCircle,
  Upload,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { useAppState, DocumentItem } from '../context/AppStateContext';

export const MyDocumentsScreen: React.FC = () => {
  const { documents } = useAppState();

  const [showAlertModal, setShowAlertModal] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  // Find document with 3 days remaining (or closest warning)
  const expiringDoc = documents.find(d => d.status === 'warning') || documents[1];

  const renderStatusBadge = (doc: DocumentItem) => {
    switch (doc.status) {
      case 'valid':
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7' }]}>
            <CheckCircle2 size={14} color={COLORS.success} />
            <Text style={[styles.statusText, { color: '#166534' }]}>Valid</Text>
          </View>
        );
      case 'warning':
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7' }]}>
            <AlertTriangle size={14} color="#D97706" />
            <Text style={[styles.statusText, { color: '#B45309' }]}>
              {doc.daysRemaining || 3} days remaining
            </Text>
          </View>
        );
      case 'expired':
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#FEF2F2' }]}>
            <XCircle size={14} color={COLORS.alert} />
            <Text style={[styles.statusText, { color: '#991B1B' }]}>Expired</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Documents</Text>
          <Text style={styles.headerSubtitle}>Manage driver and vehicle compliance files</Text>
        </View>

        {/* Highlight Banner for Expiring Document matching Image 1 */}
        {expiringDoc && (
          <TouchableOpacity
            style={styles.expiryAlertBanner}
            onPress={() => setShowAlertModal(true)}
          >
            <View style={styles.alertIconCircle}>
              <AlertTriangle size={22} color="#D97706" />
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.alertBannerTitle}>{expiringDoc.name} Expiring Soon!</Text>
              <Text style={styles.alertBannerSubtitle}>
                Expires on {expiringDoc.expiryDate} • 3 days remaining
              </Text>
            </View>

            <ArrowRight size={20} color={COLORS.primary} />
          </TouchableOpacity>
        )}

        {/* Modern Document Cards List */}
        <Text style={styles.sectionTitle}>Compliance File Records</Text>
        {documents.map(doc => (
          <View key={doc.id} style={styles.docCard}>
            <View style={styles.docCardRow}>
              <View style={styles.docIconCircle}>
                <FileText size={22} color={COLORS.primary} />
              </View>

              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.docName}>{doc.name}</Text>
                <Text style={styles.docExpiry}>Expires: {doc.expiryDate}</Text>
              </View>

              {renderStatusBadge(doc)}
            </View>

            <View style={styles.docActionRow}>
              <TouchableOpacity style={styles.updateDocBtn} onPress={() => setSelectedDoc(doc)}>
                <Upload size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                <Text style={styles.updateDocText}>Update Document</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* 3-Days Remaining Warning Modal matching Image 1 */}
      <Modal visible={showAlertModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.alertModalCard}>
            <View style={styles.alertWarningCircle}>
              <Text style={styles.exclamationMark}>!</Text>
            </View>

            <Text style={styles.modalAlertTitle}>Document Expiring Soon!</Text>

            {/* Inner Revenue License Card */}
            <View style={styles.modalInnerCard}>
              <Text style={styles.innerDocName}>{expiringDoc?.name || 'Revenue Licence'}</Text>
              <Text style={styles.innerExpiryDate}>
                Expires: {expiringDoc?.expiryDate || 'June 12, 2026'}
              </Text>

              <View style={styles.orangePillBadge}>
                <Text style={styles.orangePillText}>3 days remaining</Text>
              </View>
            </View>

            {/* Primary Update Now Button */}
            <TouchableOpacity
              style={styles.modalUpdateBtn}
              onPress={() => setShowAlertModal(false)}
            >
              <Text style={styles.modalUpdateText}>Update Now</Text>
            </TouchableOpacity>

            {/* Remind Me Later Text Link */}
            <TouchableOpacity
              style={styles.remindBtn}
              onPress={() => setShowAlertModal(false)}
            >
              <Text style={styles.remindText}>Remind Me Later</Text>
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
    paddingTop: 16,
    paddingBottom: 90,
  },
  header: {
    marginBottom: 20,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  expiryAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  alertIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#B45309',
  },
  alertBannerSubtitle: {
    fontSize: 12,
    color: '#D97706',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
  },
  docCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  docCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  docIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  docExpiry: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  docActionRow: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  updateDocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    paddingVertical: 10,
    borderRadius: 12,
  },
  updateDocText: {
    fontSize: 13,
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
  alertModalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  alertWarningCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  exclamationMark: {
    fontSize: 36,
    fontWeight: '700',
    color: '#D97706',
  },
  modalAlertTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 20,
  },
  modalInnerCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    marginBottom: 24,
  },
  innerDocName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  innerExpiryDate: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 16,
  },
  orangePillBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  orangePillText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D97706',
  },
  modalUpdateBtn: {
    backgroundColor: COLORS.primary, // #0E86D4
    height: 54,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  modalUpdateText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  remindBtn: {
    paddingVertical: 8,
  },
  remindText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
});
