import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type PaywallScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Paywall'>;

interface Props {
  navigation: PaywallScreenNavigationProp;
}

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  popular?: boolean;
  savings?: string;
}

export default function PaywallScreen({ navigation }: Props) {
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  const pricingPlans: PricingPlan[] = [
    {
      id: 'weekly',
      name: 'Weekly',
      price: '$4.99',
      period: '/week',
    },
    {
      id: 'monthly',
      name: 'Monthly',
      price: '$9.99',
      period: '/month',
      popular: true,
      savings: 'Save 50%',
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: '$59.99',
      period: '/year',
      savings: 'Save 75%',
    },
  ];

  const premiumFeatures = [
    { icon: 'infinite', text: 'Unlimited Music Generation' },
    { icon: 'diamond', text: 'High-Quality Audio Export' },
    { icon: 'business', text: 'Commercial License' },
    { icon: 'flash', text: 'Priority Processing' },
    { icon: 'musical-notes', text: 'Advanced Music Styles' },
    { icon: 'download', text: 'Batch Export' },
  ];

  const handleSubscribe = () => {
    const plan = pricingPlans.find(p => p.id === selectedPlan);
    Alert.alert(
      'Subscribe to Premium',
      `You selected ${plan?.name} plan for ${plan?.price}${plan?.period}. This will redirect to payment.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            // Simulate payment success and navigate to MainTabs
            Alert.alert(
              'Welcome to Premium!',
              'Your subscription is now active. Enjoy unlimited music generation!',
              [
                {
                  text: 'Start Creating',
                  onPress: () => navigation.replace('MainTabs')
                }
              ]
            );
          }
        },
      ]
    );
  };

  const handleRestore = () => {
    Alert.alert('Restore Purchases', 'Checking for previous purchases...');
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
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={() => navigation.replace('MainTabs')}>
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>Unlock Premium</Text>
              <Text style={styles.subtitle}>Create unlimited AI music with premium features</Text>
            </View>

            {/* Features Grid */}
            <View style={styles.featuresGrid}>
              {premiumFeatures.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <Ionicons name={feature.icon as any} size={14} color="#A855F7" />
                  </View>
                  <Text style={styles.featureText}>{feature.text}</Text>
                </View>
              ))}
            </View>

            {/* Pricing Plans */}
            <View style={styles.plansContainer}>
              {pricingPlans.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    styles.planCard,
                    selectedPlan === plan.id && styles.planCardSelected,
                    plan.popular && styles.planCardPopular,
                  ]}
                  onPress={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>Most Popular</Text>
                    </View>
                  )}
                  {plan.savings && (
                    <View style={styles.savingsBadge}>
                      <Text style={styles.savingsText}>{plan.savings}</Text>
                    </View>
                  )}
                  <View style={styles.planHeader}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <View style={styles.planPrice}>
                      <Text style={styles.priceText}>{plan.price}</Text>
                      <Text style={styles.periodText}>{plan.period}</Text>
                    </View>
                  </View>
                  <View style={styles.planSelection}>
                    <Ionicons
                      name={selectedPlan === plan.id ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={selectedPlan === plan.id ? '#A855F7' : 'rgba(255, 255, 255, 0.5)'}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Subscribe Button */}
            <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
              <LinearGradient
                colors={['#A855F7', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.subscribeGradient}
              >
                <Text style={styles.subscribeText}>Start Premium</Text>
                <Ionicons name="arrow-forward" size={16} color="white" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity onPress={handleRestore}>
                <Text style={styles.footerText}>Restore Purchases</Text>
              </TouchableOpacity>
              <Text style={styles.footerInfo}>Cancel anytime • No commitments</Text>
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
    paddingTop: 50,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },

  // Header
  header: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Title
  titleSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.7,
    textAlign: 'center',
  },

  // Features
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    width: '48%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  featureText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
  },

  // Plans
  plansContainer: {
    gap: 8,
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: '#A855F7',
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
  },
  planCardPopular: {
    borderColor: '#A855F7',
  },
  popularBadge: {
    position: 'absolute',
    top: -6,
    left: 12,
    backgroundColor: '#A855F7',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  popularText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  savingsBadge: {
    position: 'absolute',
    top: -6,
    right: 12,
    backgroundColor: '#10B981',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  savingsText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  planHeader: {
    flex: 1,
  },
  planName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  planPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#A855F7',
  },
  periodText: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.7,
    marginLeft: 2,
  },
  planSelection: {
    marginLeft: 12,
  },

  // Subscribe Button
  subscribeButton: {
    borderRadius: 12,
    marginBottom: 16,
  },
  subscribeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  subscribeText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },

  // Footer
  footer: {
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 13,
    color: '#A855F7',
    fontWeight: '500',
  },
  footerInfo: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
});