import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Bus, MapPin, ShieldAlert, Fuel, ArrowRight, CheckCircle2 } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onFinish: () => void;
}

const slides = [
  {
    icon: MapPin,
    title: 'Real-time GPS Tracking',
    description: 'Stream live location coordinates continuously to waiting passengers along Route 138.',
  },
  {
    icon: ShieldAlert,
    title: 'Document Expiry Alerts',
    description: 'Automatic smart alerts for revenue licence, insurance, and fitness certificate renewals.',
  },
  {
    icon: Fuel,
    title: 'Instant Cost & Fuel Logging',
    description: 'Track daily fuel consumption, expenses, and log station fill-ups with ease.',
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      setActiveIndex(prev => prev + 1);
    } else {
      onFinish();
    }
  };

  const CurrentIcon = slides[activeIndex].icon;

  return (
    <LinearGradient
      colors={[COLORS.darkBlue, COLORS.primary, '#0369A1']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoBadge}>
            <Bus size={38} color={COLORS.white} />
          </View>
          <Text style={styles.brandTitle}>SmartBus Driver</Text>
          <Text style={styles.brandSubtitle}>Your route. Your control.</Text>
        </View>

        {/* Feature Carousel Card */}
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <CurrentIcon size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.slideTitle}>{slides[activeIndex].title}</Text>
          <Text style={styles.slideDesc}>{slides[activeIndex].description}</Text>

          {/* Dots Indicator */}
          <View style={styles.dotsRow}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === activeIndex ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.skipButton} onPress={onFinish}>
            <Text style={styles.skipText}>Skip setup</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextText}>
              {activeIndex === slides.length - 1 ? 'Get Started' : 'Continue'}
            </Text>
            {activeIndex === slides.length - 1 ? (
              <CheckCircle2 size={20} color={COLORS.white} style={{ marginLeft: 6 }} />
            ) : (
              <ArrowRight size={20} color={COLORS.white} style={{ marginLeft: 6 }} />
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    fontWeight: '500',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 36,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    marginVertical: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  slideTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  slideDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#CBD5E1',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 15,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextText: {
    color: COLORS.darkBlue,
    fontSize: 16,
    fontWeight: '700',
  },
});
