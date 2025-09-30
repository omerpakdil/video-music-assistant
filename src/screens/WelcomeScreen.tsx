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
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

interface Props {
  navigation: WelcomeScreenNavigationProp;
}

export default function WelcomeScreen({ navigation }: Props) {
  const handleGetStarted = () => {
    navigation.navigate('OnboardingStep1');
  };

  const handleSkip = () => {
    navigation.navigate('FinalOnboarding');
  };

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
            {/* Header with Skip */}
            <View style={styles.header}>
              <View style={styles.placeholder} />
              <TouchableOpacity onPress={handleSkip}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            </View>

            {/* Main Content */}
            <View style={styles.mainContent}>
              {/* Logo/Icon */}
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={['rgba(168, 85, 247, 0.3)', 'rgba(139, 92, 246, 0.3)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.logoBackground}
                >
                  <Ionicons name="musical-notes" size={64} color="#A855F7" />
                </LinearGradient>
              </View>

              {/* Welcome Text */}
              <View style={styles.textContent}>
                <Text style={styles.title}>Welcome to{'\n'}AI Music Assistant</Text>
                <Text style={styles.description}>
                  Discover how AI can transform your videos with custom-generated music that perfectly matches your content.
                </Text>
              </View>
            </View>

            {/* Get Started Button */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
                <LinearGradient
                  colors={['#A855F7', '#8B5CF6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.getStartedGradient}
                >
                  <Text style={styles.getStartedText}>Get Started</Text>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </LinearGradient>
              </TouchableOpacity>

              {/* Feature Highlights */}
              <View style={styles.featuresContainer}>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.featureText}>AI-Powered Music Generation</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.featureText}>Royalty-Free & Commercial Use</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.featureText}>Perfect Video Sync</Text>
                </View>
              </View>
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
    marginBottom: 40,
  },
  placeholder: {
    width: 60,
  },
  skipText: {
    fontSize: 16,
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
  logoContainer: {
    marginBottom: 50,
  },
  logoBackground: {
    width: 140,
    height: 140,
    borderRadius: 70,
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
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 38,
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Button Container
  buttonContainer: {
    paddingTop: 20,
  },
  getStartedButton: {
    borderRadius: 16,
    marginBottom: 30,
  },
  getStartedGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
  },
  getStartedText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },

  // Features
  featuresContainer: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    fontWeight: '500',
  },
});