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
import {
  AlertTriangle,
  FileText,
  CheckCircle2,
  XCircle,
  Upload,
  ArrowRight,
  ShieldAlert,
  Plus,
  X,
  Check,
  Calendar,
} from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { useAppState, DocumentItem } from '../context/AppStateContext';

export const MyDocumentsScreen: React.FC = () => {
  const { documents, refreshDocuments, uploadDocument } = useAppState();

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  // Form states
  const [docType, setDocType] = useState('Heavy Driving License');
  const [category, setCategory] = useState<'driver' | 'vehicle'>('driver');
  const [expiryDate, setExpiryDate] = useState('2027-08-27');

  const commonDocTypes = [
    'Heavy Driving License',
    'Revenue License',
    'Passenger Service Permit',
    'Commercial Vehicle Insurance',
    'Vehicle Fitness Certificate',
    'Emission Test Certificate',
  ];

  // Find document with warning or expired status
  const expiringDoc = documents.find(d => d.status === 'warning' || d.status === 'expired');

  const handleOpenUpload = (doc?: DocumentItem) => {
    if (doc) {
      setDocType(doc.name);
      setCategory(doc.category);
      setExpiryDate(doc.expiryDate || '2027-08-27');
    } else {
      setDocType('Heavy Driving License');
      setCategory('driver');
      setExpiryDate('2027-08-27');
    }
    setFeedback(null);
    setShowUploadModal(true);
    setShowAlertModal(false);
  };

  const handleSaveUpload = async () => {
    if (!docType || !expiryDate) {
      setFeedback({ text: 'Please fill in document type and expiry date', isError: true });
      return;
    }
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await uploadDocument({
        document_type: docType,
        expires_at: expiryDate,
        category,
        file_url: `https://rapidroute.com/docs/${docType.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      });
      if (res.success) {
        setFeedback({ text: res.message || 'Document uploaded & saved to database!', isError: false });
        setTimeout(() => {
          setShowUploadModal(false);
          setFeedback(null);
        }, 1500);
      } else {
        setFeedback({ text: res.message || 'Failed to upload document', isError: true });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
              {doc.daysRemaining ?? 3} days remaining
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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={styles.headerTitle}>My Documents</Text>
              <Text style={styles.headerSubtitle}>Manage driver and vehicle compliance files</Text>
            </View>
            <TouchableOpacity style={styles.addDocHeaderBtn} onPress={() => handleOpenUpload()}>
              <Plus size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Highlight Banner for Expiring Document */}
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
                Expires on {expiringDoc.expiryDate} • {expiringDoc.daysRemaining ?? 3} days remaining
              </Text>
            </View>

            <ArrowRight size={20} color={COLORS.primary} />
          </TouchableOpacity>
        )}

        {/* Modern Document Cards List */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Text style={styles.sectionTitle}>Compliance File Records</Text>
          <Text style={{ fontSize: 13, color: '#64748B', fontWeight: '600' }}>{documents.length} Files</Text>
        </View>

        {documents.length === 0 ? (
          <View style={styles.emptyCard}>
            <FileText size={40} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Documents Uploaded Yet</Text>
            <Text style={styles.emptySubtitle}>Upload your driving license and vehicle revenue license to stay compliant.</Text>
            <TouchableOpacity style={styles.uploadNowBtn} onPress={() => handleOpenUpload()}>
              <Plus size={18} color={COLORS.white} style={{ marginRight: 6 }} />
              <Text style={styles.uploadNowText}>Upload Document</Text>
            </TouchableOpacity>
          </View>
        ) : (
          documents.map(doc => (
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
                <TouchableOpacity style={styles.updateDocBtn} onPress={() => handleOpenUpload(doc)}>
                  <Upload size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.updateDocText}>Update Document</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Expiry Warning Modal */}
      <Modal visible={showAlertModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.alertModalCard}>
            <View style={styles.alertWarningCircle}>
              <Text style={styles.exclamationMark}>!</Text>
            </View>

            <Text style={styles.modalAlertTitle}>Document Expiring Soon!</Text>

            <View style={styles.modalInnerCard}>
              <Text style={styles.innerDocName}>{expiringDoc?.name || 'Revenue License'}</Text>
              <Text style={styles.innerExpiryDate}>
                Expires: {expiringDoc?.expiryDate || 'Soon'}
              </Text>

              <View style={styles.orangePillBadge}>
                <Text style={styles.orangePillText}>{expiringDoc?.daysRemaining ?? 3} days remaining</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalUpdateBtn}
              onPress={() => handleOpenUpload(expiringDoc)}
            >
              <Text style={styles.modalUpdateText}>Update Now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.remindBtn}
              onPress={() => setShowAlertModal(false)}
            >
              <Text style={styles.remindText}>Remind Me Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Working Document Upload Modal */}
      <Modal visible={showUploadModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.uploadModalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.uploadModalTitle}>Upload / Update Document</Text>
              <TouchableOpacity onPress={() => setShowUploadModal(false)}>
                <X size={22} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {feedback && (
              <View style={[styles.feedbackBanner, feedback.isError ? styles.errorBanner : styles.successBanner]}>
                <Text style={[styles.feedbackText, { color: feedback.isError ? '#B91C1C' : '#047857' }]}>
                  {feedback.text}
                </Text>
              </View>
            )}

            {/* Category Toggle */}
            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.categoryToggleRow}>
              <TouchableOpacity
                style={[styles.categoryPill, category === 'driver' && styles.activeCategoryPill]}
                onPress={() => setCategory('driver')}
              >
                <Text style={[styles.categoryText, category === 'driver' && styles.activeCategoryText]}>Driver Document</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.categoryPill, category === 'vehicle' && styles.activeCategoryPill]}
                onPress={() => setCategory('vehicle')}
              >
                <Text style={[styles.categoryText, category === 'vehicle' && styles.activeCategoryText]}>Vehicle Document</Text>
              </TouchableOpacity>
            </View>

            {/* Document Type Selection */}
            <Text style={styles.fieldLabel}>Document Type / Name</Text>
            <TextInput
              style={styles.textInput}
              value={docType}
              onChangeText={setDocType}
              placeholder="e.g. Heavy Driving License"
              placeholderTextColor="#94A3B8"
            />

            {/* Quick Type Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {commonDocTypes.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.quickDocPill, docType === t && styles.activeQuickDocPill]}
                  onPress={() => setDocType(t)}
                >
                  <Text style={[styles.quickDocText, docType === t && styles.activeQuickDocText]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Expiry Date */}
            <Text style={styles.fieldLabel}>Expiry Date (YYYY-MM-DD)</Text>
            <View style={styles.inputWithIcon}>
              <Calendar size={18} color="#64748B" style={{ marginRight: 8 }} />
              <TextInput
                style={{ flex: 1, fontSize: 15, color: '#0F172A' }}
                value={expiryDate}
                onChangeText={setExpiryDate}
                placeholder="2027-08-27"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* File Attachment Simulated */}
            <View style={styles.attachmentBox}>
              <Upload size={20} color={COLORS.primary} />
              <Text style={styles.attachmentText}>Document file attached (PDF / JPG)</Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitDocBtn, isSubmitting && { opacity: 0.7 }]}
              onPress={handleSaveUpload}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Check size={18} color={COLORS.white} style={{ marginRight: 6 }} />
                  <Text style={styles.submitDocText}>Save & Upload to Database</Text>
                </>
              )}
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
  addDocHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    marginBottom: 18,
  },
  uploadNowBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  uploadNowText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
  uploadModalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 22,
    width: '100%',
    maxHeight: '90%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  uploadModalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
  },
  feedbackBanner: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  successBanner: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: '600',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 6,
  },
  categoryToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  categoryPill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeCategoryPill: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  activeCategoryText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 8,
  },
  quickDocPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeQuickDocPill: {
    backgroundColor: '#E0F2FE',
    borderColor: COLORS.primary,
  },
  quickDocText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  activeQuickDocText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 12,
  },
  attachmentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 14,
    padding: 12,
    marginBottom: 18,
  },
  attachmentText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  submitDocBtn: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitDocText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
