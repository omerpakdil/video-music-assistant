import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface OnboardingTemplateProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  description: string;
  icon: string;
  onNext: () => void;
  onSkip?: () => void;
  onBack?: () => void;
  isLastStep?: boolean;
  nextButtonText?: string;
}

// Animated Button Component
const AnimatedButton = ({ onPress, children, style }: any) => {
  const scaleAnim = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      style={style}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function OnboardingTemplate({
  currentStep,
  totalSteps,
  title,
  description,
  icon,
  onNext,
  onSkip,
  onBack,
  isLastStep = false,
  nextButtonText = "Next"
}: OnboardingTemplateProps) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#4A5B3A', '#2A1A3E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            {/* Header with Skip and Back */}
            <View style={styles.header}>
              {currentStep > 1 && onBack ? (
                <AnimatedButton style={styles.headerButton} onPress={onBack}>
                  <View style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
                  </View>
                </AnimatedButton>
              ) : (
                <View style={styles.headerButton} />
              )}

              {onSkip && (
                <AnimatedButton onPress={onSkip}>
                  <Text style={styles.skipText}>Skip</Text>
                </AnimatedButton>
              )}
            </View>

            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(currentStep / totalSteps) * 100}%` }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{currentStep} of {totalSteps}</Text>
            </View>

            {/* Main Content */}
            <View style={styles.mainContent}>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={['rgba(168, 85, 247, 0.3)', 'rgba(139, 92, 246, 0.3)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconBackground}
                >
                  <Ionicons name={icon as any} size={48} color="#A855F7" />
                </LinearGradient>
              </View>

              {/* Text Content */}
              <View style={styles.textContent}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
              </View>
            </View>

            {/* Next Button */}
            <View style={styles.buttonContainer}>
              <AnimatedButton style={styles.nextButton} onPress={onNext}>
                <LinearGradient
                  colors={['#A855F7', '#8B5CF6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.nextGradient}
                >
                  <Text style={styles.nextButtonText}>{nextButtonText}</Text>
                  {!isLastStep && (
                    <Ionicons name="arrow-forward" size={18} color="white" />
                  )}
                </LinearGradient>
              </AnimatedButton>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.7,
    fontWeight: '500',
  },

  // Progress
  progressContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#A855F7',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
    fontWeight: '500',
  },

  // Main Content
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  textContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Button
  buttonContainer: {
    paddingTop: 20,
  },
  nextButton: {
    borderRadius: 16,
  },
  nextGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});