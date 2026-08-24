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

type TabType = 'home' | 'active_map' | 'documents' | 'fuel';

function MainAppContent() {
  const { isAuthenticated, isLoadingSession, tripStatus, logout } = useAppState();

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('home');

  // Sub-screens state within Dashboard flow
  const [currentFlow, setCurrentFlow] = useState<'dashboard' | 'halts_review' | 'active_map' | 'breakdown'>('dashboard');

  if (isLoadingSession) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <Text style={{ fontSize: 16, color: COLORS.textSecondary, fontWeight: '600' }}>Loading Driver Session...</Text>
      </View>
    );
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingScreen onFinish={() => setHasCompletedOnboarding(true)} />;
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
        return (
          <ActiveTripMapScreen
            onReportBreakdown={() => setCurrentFlow('breakdown')}
            onFinishTrip={() => {
              setCurrentFlow('dashboard');
              setActiveTab('home');
            }}
          />
        );

      case 'documents':
        return <MyDocumentsScreen />;

      case 'fuel':
        return <FuelLogScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.appContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Main Screen Body */}
      <View style={styles.body}>{renderTabContent()}</View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => {
            setActiveTab('home');
            if (currentFlow !== 'halts_review' && currentFlow !== 'breakdown') {
              setCurrentFlow('dashboard');
            }
          }}
        >
          <Home
            size={22}
            color={activeTab === 'home' ? COLORS.primary : COLORS.textSecondary}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'home' && styles.activeNavLabel,
            ]}
          >
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('active_map')}
        >
          <View>
            <Navigation
              size={22}
              color={activeTab === 'active_map' ? COLORS.primary : COLORS.textSecondary}
            />
            {tripStatus === 'active' && <View style={styles.activeDotBadge} />}
          </View>
          <Text
            style={[
              styles.navLabel,
              activeTab === 'active_map' && styles.activeNavLabel,
            ]}
          >
            Trip Map
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('documents')}
        >
          <FileText
            size={22}
            color={activeTab === 'documents' ? COLORS.primary : COLORS.textSecondary}
          />
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
          <Fuel
            size={22}
            color={activeTab === 'fuel' ? COLORS.primary : COLORS.textSecondary}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'fuel' && styles.activeNavLabel,
            ]}
          >
            Fuel Log
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={logout}>
          <LogOut size={22} color={COLORS.alert} />
          <Text style={[styles.navLabel, { color: COLORS.alert }]}>Logout</Text>
        </TouchableOpacity>
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
    backgroundColor: COLORS.background,
  },
  body: {
    flex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  activeNavLabel: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  activeDotBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
});
