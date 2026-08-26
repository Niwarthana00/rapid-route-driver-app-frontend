import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Users,
  Fuel,
  FileText,
  Play,
  ArrowRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Bus,
} from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { useAppState } from '../context/AppStateContext';

interface DashboardScreenProps {
  onNavigateToHalts: () => void;
  onNavigateToActiveMap: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigateToHalts,
  onNavigateToActiveMap,
}) => {
  const {
    driverName,
    driverPhone,
    vehicleNo,
    vehicleModel,
    activeRoute,
    activeRouteName,
    passengersToday,
    fuelLoggedToday,
    documents,
    tripStatus,
    refreshDashboard,
    refreshDocuments,
    refreshCosts,
  } = useAppState();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    refreshDashboard();
    refreshDocuments();
    refreshCosts();
  }, [refreshDashboard, refreshDocuments, refreshCosts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refreshDashboard(),
      refreshDocuments(),
      refreshCosts(),
    ]);
    setRefreshing(false);
  };

  const expiringDoc = documents.find(d => d.status === 'warning' || d.status === 'expired');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Header Greeting */}
        <View style={styles.header}>
          <Text style={styles.greetingTitle}>Good morning, {driverName ? driverName.split(' ')[0] : 'Driver'}</Text>
        </View>

        {/* Assigned Route Card */}
        <View style={styles.routeCard}>
          <View style={styles.routeHeaderRow}>
            <Text style={styles.routeCode}>{activeRoute || 'No Active Route'}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>
                {tripStatus === 'active' ? 'Trip Active' : 'Trip Not Started'}
              </Text>
            </View>
          </View>

          <View style={styles.routeDetailsRow}>
            <Text style={styles.routeLocationText}>
              {activeRouteName ? activeRouteName.split(' to ')[0] : 'Origin'}
            </Text>
            <View style={styles.locationDivider} />
            <Text style={styles.routeLocationText}>
              {activeRouteName ? (activeRouteName.split(' to ')[1] || 'Destination') : 'Destination'}
            </Text>
          </View>
        </View>

        {/* 3 KPI Stats Row */}
        <View style={styles.kpiRow}>
          {/* Passengers Today */}
          <View style={styles.kpiCard}>
            <Users size={24} color={COLORS.primary} style={{ marginBottom: 12 }} />
            <Text style={styles.kpiValue}>{passengersToday}</Text>
            <Text style={styles.kpiLabel}>Passengers Today</Text>
          </View>

          {/* Fuel Logged */}
          <View style={styles.kpiCard}>
            <Fuel size={24} color={COLORS.primary} style={{ marginBottom: 12 }} />
            <Text style={styles.kpiValue}>{fuelLoggedToday}L</Text>
            <Text style={styles.kpiLabel}>Fuel Logged</Text>
          </View>

          {/* Days to Expiry */}
          <View style={styles.kpiCard}>
            <FileText size={24} color={expiringDoc?.status === 'warning' ? '#F59E0B' : COLORS.primary} style={{ marginBottom: 12 }} />
            <Text style={styles.kpiValue}>{expiringDoc?.daysRemaining ?? (documents.length > 0 ? '0' : '-')}</Text>
            <Text style={styles.kpiLabel}>{expiringDoc?.status === 'warning' ? 'Days to Expiry' : 'Doc Warnings'}</Text>
          </View>
        </View>

        {/* Primary Action Button */}
        {tripStatus === 'active' ? (
          <TouchableOpacity
            style={[styles.primaryStartBtn, { backgroundColor: '#10B981' }]}
            onPress={onNavigateToActiveMap}
          >
            <Text style={styles.startBtnText}>Resume Active Trip</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.primaryStartBtn}
            onPress={onNavigateToHalts}
          >
            <Text style={styles.startBtnText}>Start Trip</Text>
          </TouchableOpacity>
        )}

        {/* Bottom Extra Information Section */}
        <View style={styles.extraSection}>
          <Text style={styles.sectionHeading}>Vehicle & Shift Summary</Text>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.iconCircleBg}>
                <Clock size={18} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.summaryTitle}>{activeRoute || 'Current Schedule'}</Text>
                <Text style={styles.summarySubtitle}>{activeRouteName || 'Assigned Bus Route'}</Text>
              </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.summaryRow}>
              <View style={[styles.iconCircleBg, { backgroundColor: '#DCFCE7' }]}>
                <ShieldCheck size={18} color="#166534" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.summaryTitle}>Assigned Vehicle</Text>
                <Text style={styles.summarySubtitle}>{vehicleNo ? `${vehicleNo} • ${vehicleModel}` : 'No Vehicle Assigned'}</Text>
              </View>
            </View>
          </View>
        </View>
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
    paddingVertical: 20,
    paddingBottom: 90,
  },
  header: {
    marginBottom: 20,
    marginTop: 10,
  },
  greetingTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  routeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  routeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  routeCode: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
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
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  primaryStartBtn: {
    backgroundColor: COLORS.primary, // #0E86D4
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  startBtnText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  extraSection: {
    marginTop: 4,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircleBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  summarySubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
});
