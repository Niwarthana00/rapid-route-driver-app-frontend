import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import {
  Bus,
  Clock,
  MapPin,
  Users,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Navigation,
} from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { useAppState } from '../context/AppStateContext';

const { width } = Dimensions.get('window');

interface ActiveTripMapScreenProps {
  onReportBreakdown: () => void;
  onFinishTrip: () => void;
}

export const ActiveTripMapScreen: React.FC<ActiveTripMapScreenProps> = ({
  onReportBreakdown,
  onFinishTrip,
}) => {
  const {
    activeRoute,
    tripElapsedTime,
    halts,
    currentHaltIndex,
    markHaltComplete,
  } = useAppState();

  const currentHalt = halts[currentHaltIndex] || halts[0];
  const isLastHalt = currentHaltIndex >= halts.length - 1;

  const handleMarkComplete = () => {
    markHaltComplete(currentHalt.id);
    if (isLastHalt) {
      onFinishTrip();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <View style={styles.routeHeaderInfo}>
          <View style={styles.liveBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.liveText}>GPS LIVE</Text>
          </View>
          <Text style={styles.headerRouteTitle}>{activeRoute} Tracking</Text>
        </View>

        <View style={styles.timerBadge}>
          <Clock size={16} color={COLORS.darkBlue} />
          <Text style={styles.timerText}>{tripElapsedTime}</Text>
        </View>
      </View>

      {/* Vector Line-Based Map Visualization Box */}
      <View style={styles.mapContainer}>
        <View style={styles.mapGridBackground}>
          {/* Simulated Grid Lines */}
          <View style={[styles.gridLine, { top: 40 }]} />
          <View style={[styles.gridLine, { top: 100 }]} />
          <View style={[styles.gridLine, { top: 160 }]} />
        </View>

        {/* Vector Route Line */}
        <View style={styles.vectorRouteLine}>
          {halts.map((h, i) => {
            const isPassed = i < currentHaltIndex;
            const isCurrent = i === currentHaltIndex;
            return (
              <View key={h.id} style={styles.vectorStopNodeWrapper}>
                <View
                  style={[
                    styles.vectorLineSegment,
                    i === 0 && { backgroundColor: 'transparent' },
                    isPassed || isCurrent
                      ? { backgroundColor: COLORS.primary }
                      : { backgroundColor: '#CBD5E1' },
                  ]}
                />
                <View
                  style={[
                    styles.vectorNodeCircle,
                    isPassed && styles.nodePassed,
                    isCurrent && styles.nodeCurrent,
                  ]}
                >
                  {isCurrent ? (
                    <Bus size={16} color={COLORS.white} />
                  ) : isPassed ? (
                    <CheckCircle2 size={14} color={COLORS.white} />
                  ) : (
                    <View style={styles.futureNodeDot} />
                  )}
                </View>
                <Text
                  style={[
                    styles.vectorNodeLabel,
                    isCurrent && styles.vectorNodeLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {h.name.split(' ')[0]}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Distance & ETA Floating Badge */}
        <View style={styles.etaFloatingBadge}>
          <Navigation size={16} color={COLORS.primary} />
          <Text style={styles.etaText}>1.2 km away • 4 mins ETA</Text>
        </View>
      </View>

      {/* Active Halt Card Section */}
      <ScrollView contentContainerStyle={styles.bottomContent}>
        <View style={styles.activeHaltCard}>
          <View style={styles.cardTopHeader}>
            <View style={styles.currentHaltBadge}>
              <Text style={styles.currentHaltBadgeText}>
                Active Stop ({currentHaltIndex + 1}/{halts.length})
              </Text>
            </View>
            <View style={styles.scheduledBadge}>
              <Clock size={12} color={COLORS.textSecondary} />
              <Text style={styles.scheduledText}>{currentHalt.scheduledTime}</Text>
            </View>
          </View>

          <Text style={styles.haltTitle}>{currentHalt.name}</Text>

          {/* Passenger & Odometer Details Row */}
          <View style={styles.passengerMetricsRow}>
            <View style={styles.metricItem}>
              <View style={[styles.metricIconBg, { backgroundColor: '#E0F2FE' }]}>
                <Users size={20} color={COLORS.primary} />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.metricValue}>
                  {currentHalt.passengersWaiting} Passengers
                </Text>
                <Text style={styles.metricLabel}>Waiting at Stop</Text>
              </View>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <View style={[styles.metricIconBg, { backgroundColor: '#F1F5F9' }]}>
                <UserCheck size={20} color={COLORS.textSecondary} />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.metricValue}>
                  {currentHalt.passengersAlighting} Passengers
                </Text>
                <Text style={styles.metricLabel}>Getting Off</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsCol}>
            <TouchableOpacity
              style={styles.markCompleteBtn}
              onPress={handleMarkComplete}
            >
              <CheckCircle2 size={22} color={COLORS.white} style={{ marginRight: 8 }} />
              <Text style={styles.markCompleteText}>
                {isLastHalt ? 'Mark Last Halt & Finish Trip' : 'Mark Halt Complete'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.reportBreakdownBtn}
              onPress={onReportBreakdown}
            >
              <AlertTriangle size={18} color={COLORS.alert} style={{ marginRight: 8 }} />
              <Text style={styles.reportBreakdownText}>Report Breakdown</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  routeHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 10,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.alert,
    marginRight: 6,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.alert,
  },
  headerRouteTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.darkBlue,
    marginLeft: 6,
  },
  mapContainer: {
    height: 210,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  mapGridBackground: {
    ...StyleSheet.absoluteFill,
    opacity: 0.15,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: COLORS.white,
  },
  vectorRouteLine: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  vectorStopNodeWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  vectorLineSegment: {
    position: 'absolute',
    top: 15,
    left: '-50%',
    right: '50%',
    height: 3,
    zIndex: 1,
  },
  vectorNodeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  nodePassed: {
    backgroundColor: COLORS.success,
  },
  nodeCurrent: {
    backgroundColor: COLORS.primary,
    transform: [{ scale: 1.15 }],
  },
  futureNodeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#94A3B8',
  },
  vectorNodeLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 6,
    fontWeight: '500',
  },
  vectorNodeLabelActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  etaFloatingBadge: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  etaText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 6,
  },
  bottomContent: {
    padding: 20,
  },
  activeHaltCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  currentHaltBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currentHaltBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.darkBlue,
  },
  scheduledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduledText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
    fontWeight: '600',
  },
  haltTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  passengerMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  metricItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  metricDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 10,
  },
  actionButtonsCol: {},
  markCompleteBtn: {
    backgroundColor: COLORS.success,
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  markCompleteText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  reportBreakdownBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.alert,
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportBreakdownText: {
    color: COLORS.alert,
    fontSize: 15,
    fontWeight: '700',
  },
});
