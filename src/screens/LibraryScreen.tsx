import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface Project {
  id: number;
  title: string;
  genre: string;
  duration: string;
  date: string;
  thumbnail: string;
  isFavorite: boolean;
}

export default function LibraryScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const mockProjects: Project[] = [
    {
      id: 1,
      title: 'Summer Vibes',
      genre: 'Lo-fi Hip Hop',
      duration: '2:34',
      date: '2 days ago',
      thumbnail: '🎵',
      isFavorite: true,
    },
    {
      id: 2,
      title: 'Epic Journey',
      genre: 'Cinematic',
      duration: '3:45',
      date: '1 week ago',
      thumbnail: '🎬',
      isFavorite: false,
    },
    {
      id: 3,
      title: 'Party Night',
      genre: 'EDM',
      duration: '2:56',
      date: '2 weeks ago',
      thumbnail: '🎧',
      isFavorite: true,
    },
    {
      id: 4,
      title: 'Smooth Jazz',
      genre: 'Jazz',
      duration: '4:12',
      date: '3 weeks ago',
      thumbnail: '🎷',
      isFavorite: false,
    },
    {
      id: 5,
      title: 'Rock Anthem',
      genre: 'Rock',
      duration: '3:28',
      date: '1 month ago',
      thumbnail: '🎸',
      isFavorite: true,
    },
    {
      id: 6,
      title: 'Ambient Dreams',
      genre: 'Ambient',
      duration: '5:15',
      date: '1 month ago',
      thumbnail: '🌙',
      isFavorite: false,
    },
  ];

  const categories = ['All', 'Recent', 'Favorites', 'Lo-fi', 'EDM', 'Jazz'];

  const filteredProjects = mockProjects.filter(project => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Favorites') return project.isFavorite;
    if (selectedCategory === 'Recent') return ['2 days ago', '1 week ago'].includes(project.date);
    return project.genre.includes(selectedCategory);
  });

  const stats = {
    totalProjects: mockProjects.length,
    favorites: mockProjects.filter(p => p.isFavorite).length,
    totalDuration: '22:10',
  };

  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity style={styles.projectCard}>
      <View style={styles.projectThumbnail}>
        <Text style={styles.thumbnailEmoji}>{item.thumbnail}</Text>
      </View>

      <View style={styles.projectInfo}>
        <Text style={styles.projectTitle}>{item.title}</Text>
        <Text style={styles.projectGenre}>{item.genre}</Text>
        <View style={styles.projectMeta}>
          <Text style={styles.projectDuration}>{item.duration}</Text>
          <Text style={styles.projectDate}>{item.date}</Text>
        </View>
      </View>

      <View style={styles.projectActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons
            name={item.isFavorite ? 'heart' : 'heart-outline'}
            size={16}
            color={item.isFavorite ? '#EF4444' : 'rgba(255, 255, 255, 0.6)'}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="play" size={16} color="#A855F7" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="ellipsis-vertical" size={16} color="rgba(255, 255, 255, 0.6)" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

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
              <View>
                <Text style={styles.title}>My Library</Text>
                <Text style={styles.subtitle}>Your created music collection</Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.headerButton}>
                  <Ionicons name="search" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerButton}>
                  <Ionicons name="options" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Stats Card */}
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalProjects}</Text>
                <Text style={styles.statLabel}>Tracks</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.favorites}</Text>
                <Text style={styles.statLabel}>Favorites</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalDuration}</Text>
                <Text style={styles.statLabel}>Duration</Text>
              </View>
            </View>

            {/* Categories */}
            <View style={styles.categoriesGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && styles.categoryChipSelected
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category && styles.categoryTextSelected
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Projects List */}
            <View style={styles.projectsContainer}>
              <FlatList
                data={filteredProjects}
                renderItem={renderProject}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.projectsList}
              />
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
    paddingBottom: 80, // Navbar için space
    justifyContent: 'flex-start',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Stats Card
  statsCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 10,
  },

  // Categories
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryChipSelected: {
    backgroundColor: 'rgba(168, 85, 247, 0.3)',
    borderColor: '#A855F7',
  },
  categoryText: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
    fontWeight: '500',
  },
  categoryTextSelected: {
    opacity: 1,
    fontWeight: '600',
  },

  // Projects
  projectsContainer: {
    flex: 1,
  },
  projectsList: {
    paddingBottom: 0,
  },
  projectCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  projectThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  thumbnailEmoji: {
    fontSize: 20,
  },
  projectInfo: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  projectGenre: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
    marginBottom: 4,
  },
  projectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  projectDuration: {
    fontSize: 11,
    color: '#A855F7',
    fontWeight: '600',
  },
  projectDate: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.5,
  },
  projectActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});