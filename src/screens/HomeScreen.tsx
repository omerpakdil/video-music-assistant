import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type HomeScreenNavigationProp = BottomTabNavigationProp<TabParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: Props) {
  const navigateToGenerate = () => {
    navigation.navigate('Generate');
  };

  const navigateToLibrary = () => {
    navigation.navigate('Library');
  };

  const recentProjects = [
    { id: 1, name: 'Summer Vibes', type: 'Lo-fi Hip Hop', date: '2 days ago' },
    { id: 2, name: 'Epic Journey', type: 'Cinematic', date: '1 week ago' },
    { id: 3, name: 'Party Night', type: 'EDM', date: '2 weeks ago' },
  ];

  const quickActions = [
    {
      id: 1,
      title: 'Upload Video',
      subtitle: 'From device',
      icon: 'videocam',
      color: '#A855F7',
      action: navigateToGenerate
    },
    {
      id: 2,
      title: 'Paste Link',
      subtitle: 'TikTok/YouTube',
      icon: 'link',
      color: '#10B981',
      action: navigateToGenerate
    },
    {
      id: 3,
      title: 'My Library',
      subtitle: 'Saved tracks',
      icon: 'library',
      color: '#F59E0B',
      action: navigateToLibrary
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
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.greetingSection}>
                <Text style={styles.greeting}>Good morning!</Text>
                <Text style={styles.subtitle}>Let's create amazing music</Text>
              </View>
              <TouchableOpacity style={styles.profileButton}>
                <View style={styles.profileAvatar}>
                  <Ionicons name="person" size={20} color="#A855F7" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Quick Actions Grid */}
            <View style={styles.quickActionsSection}>
              <View style={styles.actionsGrid}>
                {quickActions.map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    style={styles.actionCard}
                    onPress={action.action}
                  >
                    <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                      <Ionicons name={action.icon as any} size={20} color="#FFFFFF" />
                    </View>
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Primary CTA */}
            <TouchableOpacity style={styles.primaryCTA} onPress={navigateToGenerate}>
              <LinearGradient
                colors={['#A855F7', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <View style={styles.ctaContent}>
                  <View>
                    <Text style={styles.ctaTitle}>Create New Track</Text>
                    <Text style={styles.ctaSubtitle}>AI-powered music generation</Text>
                  </View>
                  <Ionicons name="arrow-forward-circle" size={28} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Recent Projects - Simplified */}
            <View style={styles.recentSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Projects</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.projectCard}>
                <View style={styles.projectIcon}>
                  <Ionicons name="musical-note" size={16} color="#A855F7" />
                </View>
                <View style={styles.projectInfo}>
                  <Text style={styles.projectName}>Summer Vibes</Text>
                  <Text style={styles.projectType}>Lo-fi Hip Hop</Text>
                </View>
                <View style={styles.projectMeta}>
                  <Text style={styles.projectDate}>2 days ago</Text>
                  <Ionicons name="chevron-forward" size={14} color="rgba(255, 255, 255, 0.5)" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.projectCard}>
                <View style={styles.projectIcon}>
                  <Ionicons name="musical-note" size={16} color="#A855F7" />
                </View>
                <View style={styles.projectInfo}>
                  <Text style={styles.projectName}>Epic Journey</Text>
                  <Text style={styles.projectType}>Cinematic</Text>
                </View>
                <View style={styles.projectMeta}>
                  <Text style={styles.projectDate}>1 week ago</Text>
                  <Ionicons name="chevron-forward" size={14} color="rgba(255, 255, 255, 0.5)" />
                </View>
              </TouchableOpacity>
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
    paddingBottom: 100, // Navbar için space (80px height + safe area)
    justifyContent: 'flex-start',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  profileButton: {
    padding: 4,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Quick Actions
  quickActionsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.7,
    textAlign: 'center',
  },

  // Primary CTA
  primaryCTA: {
    marginBottom: 16,
  },
  ctaGradient: {
    borderRadius: 16,
    padding: 16,
  },
  ctaContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  ctaSubtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },

  // Recent Projects
  recentSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 12,
    color: '#A855F7',
    fontWeight: '600',
  },
  projectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  projectIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  projectType: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  projectMeta: {
    alignItems: 'flex-end',
  },
  projectDate: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.5,
    marginBottom: 2,
  },
});