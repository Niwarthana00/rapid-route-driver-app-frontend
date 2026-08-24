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
  Bus,
  Users,
  Fuel,
  AlertTriangle,
  Play,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
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
    vehicleNo,
    activeRoute,
    activeRouteName,
    passengersToday,
    fuelLoggedToday,
    documents,
    tripStatus,
  } = useAppState();

  // Find expiring revenue license or any document with warning/expired
  const expiringDoc = documents.find(
    d => d.status === 'warning' || d.status === 'expired'
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Driver Header */}
        <View style={styles.headerRow}>
          <View style={styles.driverProfile}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {driverName
                  .split(' ')
                  .map(n => n[0])
                  .join('')}
              </Text>
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.driverName}>{driverName}</Text>
            </View>
          </View>

          <View style={styles.statusBadge}>
            <View style={styles.activeDot} />
            <Text style={styles.statusText}>Scheduled Duty</Text>
          </View>
        </View>

        {/* Assigned Route Card */}
        <View style={styles.routeCard}>
          <View style={styles.routeCardHeader}>
            <View style={styles.routeBadge}>
              <Bus size={18} color={COLORS.white} />
              <Text style={styles.routeBadgeText}>{activeRoute}</Text>
            </View>
            <Text style={styles.vehicleNo}>{vehicleNo}</Text>
          </View>

          <Text style={styles.routeName}>{activeRouteName}</Text>

          <View style={styles.routeStatsRow}>
            <Text style={styles.routeDetail}>8 Halts Scheduled</Text>
            <Text style={styles.routeDetail}>•  Estimated 1h 35m</Text>
          </View>
        </View>

        {/* KPI Stats Grid */}
        <Text style={styles.sectionTitle}>Daily Overview</Text>
        <View style={styles.kpiRow}>
          {/* Passengers Today Card */}
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBadge, { backgroundColor: '#E0F2FE' }]}>
              <Users size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.kpiValue}>{passengersToday}</Text>
            <Text style={styles.kpiLabel}>Passengers Today</Text>
          </View>

          {/* Fuel Logged Card */}
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBadge, { backgroundColor: '#DCFCE7' }]}>
              <Fuel size={22} color={COLORS.success} />
            </View>
            <Text style={styles.kpiValue}>{fuelLoggedToday} L</Text>
            <Text style={styles.kpiLabel}>Fuel Logged</Text>
          </View>
        </View>

        {/* Licence Expiry Warning Card */}
        {expiringDoc && (
          <View
            style={[
              styles.warningCard,
              expiringDoc.status === 'expired'
                ? { borderColor: COLORS.alert, backgroundColor: '#FEF2F2' }
                : { borderColor: COLORS.warning, backgroundColor: '#FFFBEB' },
            ]}
          >
            <View style={styles.warningHeader}>
              <AlertTriangle
                size={22}
                color={expiringDoc.status === 'expired' ? COLORS.alert : COLORS.warning}
              />
              <Text style={styles.warningTitle}>
                {expiringDoc.name} {expiringDoc.status === 'expired' ? 'Expired' : 'Expiring Soon'}
              </Text>
            </View>
            <Text style={styles.warningDesc}>
              {expiringDoc.status === 'expired'
                ? `Expired on ${expiringDoc.expiryDate}. Please renew immediately.`
                : `${expiringDoc.daysRemaining} days remaining (Expires ${expiringDoc.expiryDate}).`}
            </Text>
          </View>
        )}

        {/* Primary Action Button */}
        {tripStatus === 'active' ? (
          <TouchableOpacity
            style={[styles.primaryActionBtn, { backgroundColor: COLORS.success }]}
            onPress={onNavigateToActiveMap}
          >
            <CheckCircle2 size={24} color={COLORS.white} style={{ marginRight: 8 }} />
            <Text style={styles.primaryActionText}>Resume Active Trip (Route 138)</Text>
            <ArrowRight size={20} color={COLORS.white} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.primaryActionBtn}
            onPress={onNavigateToHalts}
          >
            <Play size={22} color={COLORS.white} style={{ marginRight: 8 }} />
            <Text style={styles.primaryActionText}>Start Trip</Text>
            <ArrowRight size={20} color={COLORS.white} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  driverProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.darkBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 18,
  },
  greeting: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  driverName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
  },
  routeCard: {
    backgroundColor: COLORS.darkBlue,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#0055A5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  routeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  routeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  routeBadgeText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6,
  },
  vehicleNo: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontWeight: '600',
  },
  routeName: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  routeStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeDetail: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 13,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 14,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  kpiIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  kpiLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  warningCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  warningDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  primaryActionBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryActionText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
});
