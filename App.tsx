import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Home, Navigation, FileText, Fuel, LogOut } from 'lucide-react-native';

import { COLORS } from './src/constants/theme';
import { AppStateProvider, useAppState } from './src/context/AppStateContext';

// Import Screens
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { RouteHaltsScreen } from './src/screens/RouteHaltsScreen';
import { ActiveTripMapScreen } from './src/screens/ActiveTripMapScreen';
import { BreakdownReportScreen } from './src/screens/BreakdownReportScreen';
import { MyDocumentsScreen } from './src/screens/MyDocumentsScreen';
import { FuelLogScreen } from './src/screens/FuelLogScreen';

import { ProfileScreen } from './src/screens/ProfileScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { User as UserIcon } from 'lucide-react-native';

type TabType = 'home' | 'active_map' | 'documents' | 'fuel' | 'profile';

import { TripCompletedScreen } from './src/screens/TripCompletedScreen';

function MainAppContent() {
  const { isAuthenticated, isLoadingSession, tripStatus, logout } = useAppState();

  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('home');

  // Sub-screens state within Dashboard flow
  const [currentFlow, setCurrentFlow] = useState<'dashboard' | 'halts_review' | 'active_map' | 'breakdown' | 'trip_completed'>('dashboard');

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (isLoadingSession) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <Text style={{ fontSize: 16, color: COLORS.textSecondary, fontWeight: '600' }}>Loading Driver Session...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        if (currentFlow === 'halts_review') {
          return (
            <RouteHaltsScreen
              onBack={() => setCurrentFlow('dashboard')}
              onConfirmStart={() => {
                setCurrentFlow('active_map');
                setActiveTab('active_map');
              }}
            />
          );
        }
        if (currentFlow === 'breakdown') {
          return (
            <BreakdownReportScreen
              onBack={() => setCurrentFlow('active_map')}
              onAlertSent={() => {
                setCurrentFlow('dashboard');
                setActiveTab('home');
              }}
            />
          );
        }
        if (currentFlow === 'trip_completed') {
          return (
            <TripCompletedScreen
              onDone={() => {
                setCurrentFlow('dashboard');
                setActiveTab('home');
              }}
            />
          );
        }
        return (
          <DashboardScreen
            onNavigateToHalts={() => setCurrentFlow('halts_review')}
            onNavigateToActiveMap={() => {
              setCurrentFlow('active_map');
              setActiveTab('active_map');
            }}
          />
        );

      case 'active_map':
        if (currentFlow === 'breakdown') {
          return (
            <BreakdownReportScreen
              onBack={() => setCurrentFlow('active_map')}
              onAlertSent={() => {
                setCurrentFlow('dashboard');
                setActiveTab('home');
              }}
            />
          );
        }
        if (currentFlow === 'trip_completed') {
          return (
            <TripCompletedScreen
              onDone={() => {
                setCurrentFlow('dashboard');
                setActiveTab('home');
              }}
            />
          );
        }
        return (
          <ActiveTripMapScreen
            onReportBreakdown={() => setCurrentFlow('breakdown')}
            onFinishTrip={() => {
              setCurrentFlow('trip_completed');
            }}
          />
        );

      case 'documents':
        return <MyDocumentsScreen />;

      case 'fuel':
        return <FuelLogScreen />;

      case 'profile':
        return <ProfileScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.appContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Main Screen Body */}
      <View style={styles.body}>{renderTabContent()}</View>

      {/* Modern Floating Bottom Navigation Bar matching Passenger App */}
      <View style={styles.bottomBarWrapper}>
        <View style={styles.bottomBarContainer}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              setActiveTab('home');
              if (currentFlow !== 'halts_review' && currentFlow !== 'breakdown') {
                setCurrentFlow('dashboard');
              }
            }}
          >
            <View style={[styles.iconWrapper, activeTab === 'home' && styles.activeIconWrapper]}>
              <Home
                size={22}
                color={activeTab === 'home' ? COLORS.primary : '#64748B'}
              />
            </View>
            <Text
              style={[
                styles.navLabel,
                activeTab === 'home' && styles.activeNavLabel,
              ]}
            >
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('active_map')}
          >
            <View style={[styles.iconWrapper, activeTab === 'active_map' && styles.activeIconWrapper]}>
              <Navigation
                size={22}
                color={activeTab === 'active_map' ? COLORS.primary : '#64748B'}
              />
              {tripStatus === 'active' && <View style={styles.activeDotBadge} />}
            </View>
            <Text
              style={[
                styles.navLabel,
                activeTab === 'active_map' && styles.activeNavLabel,
              ]}
            >
              Trip
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('documents')}
          >
            <View style={[styles.iconWrapper, activeTab === 'documents' && styles.activeIconWrapper]}>
              <FileText
                size={22}
                color={activeTab === 'documents' ? COLORS.primary : '#64748B'}
              />
            </View>
            <Text
              style={[
                styles.navLabel,
                activeTab === 'documents' && styles.activeNavLabel,
              ]}
            >
              Documents
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('fuel')}
          >
            <View style={[styles.iconWrapper, activeTab === 'fuel' && styles.activeIconWrapper]}>
              <Fuel
                size={22}
                color={activeTab === 'fuel' ? COLORS.primary : '#64748B'}
              />
            </View>
            <Text
              style={[
                styles.navLabel,
                activeTab === 'fuel' && styles.activeNavLabel,
              ]}
            >
              Costs
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('profile')}
          >
            <View style={[styles.iconWrapper, activeTab === 'profile' && styles.activeIconWrapper]}>
              <UserIcon
                size={22}
                color={activeTab === 'profile' ? COLORS.primary : '#64748B'}
              />
            </View>
            <Text
              style={[
                styles.navLabel,
                activeTab === 'profile' && styles.activeNavLabel,
              ]}
            >
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <AppStateProvider>
        <MainAppContent />
      </AppStateProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  body: {
    flex: 1,
  },
  bottomBarWrapper: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },
  bottomBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.white,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconWrapper: {
    backgroundColor: '#E0F2FE',
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  activeNavLabel: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  activeDotBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
});
