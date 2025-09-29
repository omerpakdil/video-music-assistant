import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { VideoSource } from '../types';

type VideoUploadScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'VideoUpload'
>;

interface Props {
  navigation: VideoUploadScreenNavigationProp;
}

const { width } = Dimensions.get('window');

export default function VideoUploadScreen({ navigation }: Props) {
  const [urlInput, setUrlInput] = useState('');
  const [stylePrompt, setStylePrompt] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoSource | null>(null);

  const handleVideoUpload = async () => {
    try {
      setIsUploading(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const videoSource: VideoSource = {
          type: 'upload',
          uri: result.assets[0].uri,
        };

        setSelectedVideo(videoSource);
        proceedToGeneration(videoSource);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload video. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      Alert.alert('Error', 'Please enter a valid video URL');
      return;
    }

    // Basic URL validation
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(urlInput.trim())) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }

    const videoSource: VideoSource = {
      type: 'url',
      uri: urlInput.trim(),
    };

    proceedToGeneration(videoSource);
  };

  const proceedToGeneration = (videoSource: VideoSource) => {
    navigation.navigate('MusicGeneration', {
      videoUri: videoSource.uri,
      prompt: stylePrompt.trim() || undefined,
    });
  };

  const musicStyles = [
    { id: 'lofi', name: 'Lo-fi Hip Hop', emoji: '🎵' },
    { id: 'cinematic', name: 'Cinematic', emoji: '🎬' },
    { id: 'edm', name: 'EDM', emoji: '🎧' },
    { id: 'jazz', name: 'Jazz', emoji: '🎷' },
    { id: 'rock', name: 'Rock', emoji: '🎸' },
    { id: 'ambient', name: 'Ambient', emoji: '🌙' },
  ];

  const selectStyle = (style: string) => {
    setStylePrompt(style);
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
              <View>
                <Text style={styles.title}>Create Music</Text>
                <Text style={styles.subtitle}>Upload video or paste link to get started</Text>
              </View>
            </View>

            {/* Upload Options */}
            <View style={styles.uploadOptions}>
              <TouchableOpacity
                style={styles.uploadCard}
                onPress={handleVideoUpload}
                disabled={isUploading}
              >
                <View style={styles.uploadIcon}>
                  {isUploading ? (
                    <ActivityIndicator color="#A855F7" size="small" />
                  ) : (
                    <Ionicons name="videocam" size={24} color="#A855F7" />
                  )}
                </View>
                <Text style={styles.uploadTitle}>Upload Video</Text>
                <Text style={styles.uploadSubtitle}>From your device</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.uploadCard}>
                <View style={styles.uploadIcon}>
                  <Ionicons name="link" size={24} color="#10B981" />
                </View>
                <Text style={styles.uploadTitle}>Paste Link</Text>
                <Text style={styles.uploadSubtitle}>TikTok, YouTube</Text>
              </TouchableOpacity>
            </View>

            {/* URL Input */}
            <View style={styles.urlSection}>
              <Text style={styles.sectionLabel}>Video URL</Text>
              <TextInput
                style={styles.urlInput}
                placeholder="Paste TikTok, YouTube or Instagram link here..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={urlInput}
                onChangeText={setUrlInput}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
            </View>

            {/* Music Styles */}
            <View style={styles.styleSection}>
              <Text style={styles.sectionLabel}>Music Style (Optional)</Text>
              <View style={styles.styleGrid}>
                {musicStyles.slice(0, 6).map((style) => (
                  <TouchableOpacity
                    key={style.id}
                    style={[
                      styles.styleChip,
                      stylePrompt === style.name && styles.styleChipSelected
                    ]}
                    onPress={() => selectStyle(style.name)}
                  >
                    <Text style={styles.styleEmoji}>{style.emoji}</Text>
                    <Text style={[
                      styles.styleChipText,
                      stylePrompt === style.name && styles.styleChipTextSelected
                    ]}>
                      {style.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Generate Button */}
            <TouchableOpacity
              style={[styles.generateButton, { opacity: (urlInput.trim() || selectedVideo) ? 1 : 0.5 }]}
              onPress={handleUrlSubmit}
              disabled={!(urlInput.trim() || selectedVideo)}
            >
              <LinearGradient
                colors={['#A855F7', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.generateGradient}
              >
                <Text style={styles.generateButtonText}>Generate Music</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
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
    paddingBottom: 100, // Navbar için space
    justifyContent: 'flex-start',
  },

  // Header
  header: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
  },

  // Upload Options
  uploadOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  uploadCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  uploadIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
  },

  // URL Section
  urlSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  urlInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Style Section
  styleSection: {
    marginBottom: 20,
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  styleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 8,
  },
  styleChipSelected: {
    backgroundColor: 'rgba(168, 85, 247, 0.3)',
    borderColor: '#A855F7',
  },
  styleEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  styleChipText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  styleChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Generate Button
  generateButton: {
    marginTop: 'auto',
    marginBottom: 20,
  },
  generateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 50,
    gap: 8,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});