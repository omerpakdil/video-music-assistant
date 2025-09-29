import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserSubscription } from '../types';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(false);
  const [highQualityPreview, setHighQualityPreview] = useState(false);

  const [subscription] = useState<UserSubscription>({
    isActive: false,
    plan: 'free',
    generationsLeft: 3,
  });

  const handleUpgrade = () => {
    Alert.alert(
      'Upgrade to Premium',
      'Unlock unlimited music generation, high-quality exports, and commercial licensing.',
      [
        { text: 'Maybe Later', style: 'cancel' },
        { text: 'Upgrade Now', onPress: () => console.log('Navigate to subscription') },
      ]
    );
  };

  const handleSupport = () => {
    Alert.alert(
      'Support',
      'How can we help you?',
      [
        { text: 'FAQ', onPress: () => console.log('Open FAQ') },
        { text: 'Contact Us', onPress: () => console.log('Open contact') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => console.log('Logout') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Settings</Text>

          {/* Subscription Status */}
          <View style={styles.section}>
            <View style={styles.subscriptionCard}>
              <View style={styles.subscriptionHeader}>
                <View>
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
                  color={subscription.plan === 'free' ? '#999999' : '#FFD700'}
                />
              </View>

              {subscription.plan === 'free' && (
                <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
                  <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
                  <Ionicons name="arrow-forward" size={16} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications" size={20} color="#007AFF" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Push Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Get notified when your music is ready
                  </Text>
                </View>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="save" size={20} color="#007AFF" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Auto-Save Projects</Text>
                  <Text style={styles.settingDescription}>
                    Automatically save your work
                  </Text>
                </View>
              </View>
              <Switch
                value={autoSave}
                onValueChange={setAutoSave}
                trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="videocam" size={20} color="#007AFF" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>High Quality Preview</Text>
                  <Text style={styles.settingDescription}>
                    Better quality, uses more data
                  </Text>
                </View>
              </View>
              <Switch
                value={highQualityPreview}
                onValueChange={setHighQualityPreview}
                trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
              />
            </View>
          </View>

          {/* Account */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemInfo}>
                <Ionicons name="person" size={20} color="#007AFF" />
                <Text style={styles.menuItemText}>Profile</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#999999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemInfo}>
                <Ionicons name="folder" size={20} color="#007AFF" />
                <Text style={styles.menuItemText}>My Projects</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#999999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemInfo}>
                <Ionicons name="card" size={20} color="#007AFF" />
                <Text style={styles.menuItemText}>Billing</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#999999" />
            </TouchableOpacity>
          </View>

          {/* Support */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>

            <TouchableOpacity style={styles.menuItem} onPress={handleSupport}>
              <View style={styles.menuItemInfo}>
                <Ionicons name="help-circle" size={20} color="#007AFF" />
                <Text style={styles.menuItemText}>Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#999999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemInfo}>
                <Ionicons name="document-text" size={20} color="#007AFF" />
                <Text style={styles.menuItemText}>Terms of Service</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#999999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemInfo}>
                <Ionicons name="shield-checkmark" size={20} color="#007AFF" />
                <Text style={styles.menuItemText}>Privacy Policy</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#999999" />
            </TouchableOpacity>
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color="#FF3B30" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

          <View style={styles.version}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100, // Navbar için space (80px height + safe area)
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  subscriptionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  planDetail: {
    fontSize: 14,
    color: '#666666',
  },
  upgradeButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#666666',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '500',
  },
  version: {
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#999999',
  },
});