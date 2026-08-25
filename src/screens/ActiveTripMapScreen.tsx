import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Users,
  UserCheck,
  MapPin,
  AlertCircle,
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
    if (currentHaltIndex < halts.length - 1) {
      markHaltComplete(halts[currentHaltIndex].id);
    } else {
      markHaltComplete(halts[currentHaltIndex].id);
      onFinishTrip();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Header Row */}
        <View style={styles.topHeader}>
          <Text style={styles.routeTitle}>{activeRoute}</Text>
          <Text style={styles.timerText}>{tripElapsedTime}</Text>
        </View>

        {/* Map Visualization Card matching exact reference image */}
        <View style={styles.mapCard}>
          <View style={styles.mapBackground}>
            {/* Curved Path Line */}
            <View style={styles.curvedPathLine} />

            {/* Vector Nodes along path */}
            {halts.map((h, i) => {
              const isPassed = i < currentHaltIndex;
              const isCurrent = i === currentHaltIndex;

              // Diagonal node positioning matching design curve
              const leftPercent = 15 + i * 11;
              const topPercent = 80 - i * 11;

              return (
                <View
                  key={h.id}
                  style={[
                    styles.mapNode,
                    { left: `${leftPercent}%`, top: `${topPercent}%` },
                  ]}
                >
                  {isCurrent ? (
                    <View style={styles.currentActiveNodeBadge}>
                      <View style={styles.innerActiveDot} />
                    </View>
                  ) : isPassed ? (
                    <View style={styles.passedGreenNode} />
                  ) : (
                    <View style={styles.upcomingBlueOutlineNode} />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Active Halt Details Card */}
        <View style={styles.haltDetailsCard}>
          <Text style={styles.haltTitle}>{currentHalt.name}</Text>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Users size={20} color={COLORS.primary} />
              <Text style={styles.waitingText}>{currentHalt.passengersWaiting} waiting</Text>
            </View>

            <View style={styles.metricItem}>
              <Users size={20} color="#64748B" />
              <Text style={styles.gettingOffText}>{currentHalt.passengersAlighting} getting off</Text>
            </View>
          </View>

          <View style={styles.distanceRow}>
            <MapPin size={18} color="#64748B" />
            <Text style={styles.distanceText}>1.2 km • 4 min</Text>
          </View>
        </View>

        {/* Primary Mark Halt Complete Button */}
        <TouchableOpacity style={styles.markCompleteBtn} onPress={handleMarkComplete}>
          <Text style={styles.markCompleteText}>
            {isLastHalt ? 'Finish Trip' : 'Mark Halt Complete'}
          </Text>
        </TouchableOpacity>

        {/* Secondary Outline Report Breakdown Button */}
        <TouchableOpacity style={styles.reportBreakdownBtn} onPress={onReportBreakdown}>
          <AlertCircle size={20} color="#EF4444" style={{ marginRight: 8 }} />
          <Text style={styles.reportBreakdownText}>Report Breakdown</Text>
        </TouchableOpacity>
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
    paddingVertical: 16,
    paddingBottom: 90,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 8,
  },
  routeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  timerText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary, // #0E86D4
  },
  mapCard: {
    height: 310,
    backgroundColor: '#EEF7FF', // Light subtle blue map backdrop
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mapBackground: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  curvedPathLine: {
    position: 'absolute',
    left: '10%',
    bottom: '15%',
    width: '80%',
    height: '70%',
    borderLeftWidth: 4,
    borderTopWidth: 4,
    borderColor: COLORS.primary,
    borderRadius: 180,
    transform: [{ rotate: '-25deg' }],
  },
  mapNode: {
    position: 'absolute',
    zIndex: 10,
  },
  currentActiveNodeBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 6,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  innerActiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  passedGreenNode: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#6EE7B7', // Light soft green filled dot matching reference image
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  upcomingBlueOutlineNode: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.white,
    borderWidth: 4,
    borderColor: COLORS.primary,
  },
  haltDetailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  haltTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  waitingText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 8,
  },
  gettingOffText: {
    fontSize: 15,
    color: '#64748B',
    marginLeft: 8,
    fontWeight: '500',
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
    fontWeight: '500',
  },
  markCompleteBtn: {
    backgroundColor: COLORS.primary, // #0E86D4
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  markCompleteText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
  reportBreakdownBtn: {
    backgroundColor: COLORS.white,
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportBreakdownText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
  },
});
