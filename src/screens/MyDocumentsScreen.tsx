import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Image,
} from 'react-native';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Upload,
  Eye,
  X,
  FileCheck,
} from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { useAppState, DocumentItem } from '../context/AppStateContext';

export const MyDocumentsScreen: React.FC = () => {
  const { documents } = useAppState();

  const [activeCategory, setActiveCategory] = useState<'all' | 'driver' | 'vehicle'>('all');
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  const filteredDocs = documents.filter(d =>
    activeCategory === 'all' ? true : d.category === activeCategory
  );

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
            <AlertTriangle size={14} color={COLORS.warning} />
            <Text style={[styles.statusText, { color: '#92400E' }]}>
              Expires in {doc.daysRemaining} days
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
      {/* Top Bar Header */}
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>My Documents</Text>
        <Text style={styles.headerSubtitle}>Manage driver and vehicle compliance records</Text>

        {/* Category Filters */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, activeCategory === 'all' && styles.activeChip]}
            onPress={() => setActiveCategory('all')}
          >
            <Text style={[styles.filterChipText, activeCategory === 'all' && styles.activeChipText]}>
              All Documents
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeCategory === 'driver' && styles.activeChip]}
            onPress={() => setActiveCategory('driver')}
          >
            <Text style={[styles.filterChipText, activeCategory === 'driver' && styles.activeChipText]}>
              Driver Files
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeCategory === 'vehicle' && styles.activeChip]}
            onPress={() => setActiveCategory('vehicle')}
          >
            <Text style={[styles.filterChipText, activeCategory === 'vehicle' && styles.activeChipText]}>
              Vehicle Files
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredDocs.map(doc => (
          <View key={doc.id} style={styles.docCard}>
            <View style={styles.docCardHeader}>
              <View style={styles.docIconBg}>
                <FileText size={22} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.docName}>{doc.name}</Text>
                <Text style={styles.expiryText}>Expires: {doc.expiryDate}</Text>
              </View>
              {renderStatusBadge(doc)}
            </View>

            <View style={styles.docCardActions}>
              <TouchableOpacity
                style={styles.viewBtn}
                onPress={() => setSelectedDoc(doc)}
              >
                <Eye size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                <Text style={styles.viewBtnText}>View Document</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.uploadBtn}
                onPress={() => setSelectedDoc(doc)}
              >
                <Upload size={16} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
                <Text style={styles.uploadBtnText}>Upload New</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Document View / Replace Modal */}
      <Modal visible={!!selectedDoc} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalDocTitle}>{selectedDoc?.name}</Text>
              <TouchableOpacity onPress={() => setSelectedDoc(null)}>
                <X size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Document Image Mock Preview */}
            <View style={styles.docPreviewPlaceholder}>
              <FileCheck size={48} color={COLORS.primary} />
              <Text style={styles.previewTitle}>Verified Digital Copy</Text>
              <Text style={styles.previewMeta}>Document ID: {selectedDoc?.id.toUpperCase()}-SRI-LANKA</Text>
              <Text style={styles.previewDate}>Expires on: {selectedDoc?.expiryDate}</Text>
            </View>

            <TouchableOpacity style={styles.reUploadActionBtn} onPress={() => setSelectedDoc(null)}>
              <Upload size={18} color={COLORS.white} style={{ marginRight: 8 }} />
              <Text style={styles.reUploadText}>Replace Document Image</Text>
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
    marginBottom: 14,
  },
  filterRow: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  activeChip: {
    backgroundColor: COLORS.darkBlue,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeChipText: {
    color: COLORS.white,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  docCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  docCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  docIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  expiryText: {
    fontSize: 12,
    color: COLORS.textSecondary,
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
  docCardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  viewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 6,
  },
  viewBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  uploadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 10,
    borderRadius: 10,
    marginLeft: 6,
  },
  uploadBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
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
  modalDocTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  docPreviewPlaceholder: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  previewMeta: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  previewDate: {
    fontSize: 13,
    color: COLORS.darkBlue,
    fontWeight: '600',
    marginTop: 2,
  },
  reUploadActionBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reUploadText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
