import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { UserSubscription } from '../types';
import { useAuth } from '../hooks/useAuth';
import CustomAlert from '../components/CustomAlert';
import { CommonActions } from '@react-navigation/native';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

export default function ProfileScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(false);

  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message?: string;
    type: 'success' | 'error' | 'warning' | 'info';
    buttons?: Array<{
      text: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }>;
  }>({
    title: '',
    type: 'info',
  });

  const showAlert = (
    title: string,
    message?: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    buttons?: Array<{
      text: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }>
  ) => {
    setAlertConfig({ title, message, type, buttons });
    setAlertVisible(true);
  };

  const [subscription] = useState<UserSubscription>({
    isActive: false,
    plan: 'free',
    generationsLeft: 3,
  });

  const [userStats] = useState({
    totalTracks: 12,
    totalListens: 245,
    joinedDate: 'March 2024',
  });

  const handleUpgrade = () => {
    navigation.navigate('Paywall');
  };

  const handleSupport = () => {
    showAlert(
      'Support',
      'How can we help you?',
      'info',
      [
        { text: 'FAQ', onPress: () => console.log('Open FAQ') },
        { text: 'Contact Us', onPress: () => console.log('Open contact') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleLogout = () => {
    showAlert(
      'Sign Out',
      'Are you sure you want to sign out?',
      'warning',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              setAlertVisible(false);
              await logout();

              // Reset navigation stack and go to Welcome screen
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Welcome' }],
                })
              );
            } catch (error: any) {
              showAlert('Error', error.message || 'Failed to sign out. Please try again.', 'error');
            }
          }
        },
      ]
    );
  };

  const menuItems = [
    {
      id: 'profile',
      title: 'Edit Profile',
      icon: 'person',
      onPress: () => console.log('Edit profile'),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'notifications',
      onPress: () => console.log('Notifications'),
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: 'shield-checkmark',
      onPress: () => console.log('Privacy'),
    },
    {
      id: 'billing',
      title: 'Billing & Payments',
      icon: 'card',
      onPress: () => console.log('Billing'),
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: 'help-circle',
      onPress: handleSupport,
    },
    {
      id: 'about',
      title: 'About',
      icon: 'information-circle',
      onPress: () => console.log('About'),
    },
  ];

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
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Profile</Text>
              <TouchableOpacity style={styles.settingsButton}>
                <Ionicons name="settings" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Profile Info */}
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['#A855F7', '#8B5CF6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>
                    {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                  </Text>
                </LinearGradient>
              </View>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{userStats.totalTracks}</Text>
                <Text style={styles.statLabel}>Tracks Created</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{userStats.totalListens}</Text>
                <Text style={styles.statLabel}>Total Listens</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{userStats.joinedDate}</Text>
                <Text style={styles.statLabel}>Member Since</Text>
              </View>
            </View>

            {/* Subscription Status */}
            <View style={styles.subscriptionCard}>
              <View style={styles.subscriptionHeader}>
                <View style={styles.subscriptionInfo}>
                  <Text style={styles.planName}>
                    {subscription.plan === 'free' ? 'Free Plan' : 'Premium Plan'}
                  </Text>
                  <Text style={styles.planDetail}>
                    {subscription.plan === 'free'
                      ? `${subscription.generationsLeft} generations left`
                      : 'Unlimited generations'
                    }
                  </Text>
                </View>
                <Ionicons
                  name={subscription.plan === 'free' ? 'star-outline' : 'star'}
                  size={24}
                  color={subscription.plan === 'free' ? 'rgba(255, 255, 255, 0.6)' : '#FFD700'}
                />
              </View>

              {subscription.plan === 'free' && (
                <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
                  <LinearGradient
                    colors={['#A855F7', '#8B5CF6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.upgradeGradient}
                  >
                    <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
                    <Ionicons name="arrow-forward" size={16} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>

            {/* Menu Items */}
            <View style={styles.menuSection}>
              {menuItems.map((item) => (
                <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
                  <View style={styles.menuItemLeft}>
                    <View style={styles.menuIcon}>
                      <Ionicons name={item.icon as any} size={18} color="#A855F7" />
                    </View>
                    <Text style={styles.menuItemText}>{item.title}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.4)" />
                </TouchableOpacity>
              ))}
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out" size={20} color="#EF4444" />
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>

            {/* Version */}
            <Text style={styles.version}>Version 1.0.0</Text>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={alertConfig.buttons}
        onDismiss={() => setAlertVisible(false)}
      />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 80, // Extra space for navbar
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Profile Section
  profileSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginBottom: 8,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.7,
    textAlign: 'center',
  },

  // Subscription
  subscriptionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  subscriptionInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  planDetail: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  upgradeButton: {
    borderRadius: 8,
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  // Menu
  menuSection: {
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  menuItemText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  logoutText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },

  // Version
  version: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.5,
    textAlign: 'center',
    marginBottom: 10,
  },
});